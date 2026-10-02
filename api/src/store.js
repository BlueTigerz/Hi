import { randomUUID } from 'node:crypto';
import { TableClient, odata } from '@azure/data-tables';

// Table Storage only sorts by PartitionKey + RowKey, so scores are stored in a
// single partition with RowKey = (MAX_SCORE - score) zero-padded. Reading the
// partition in key order then yields highest scores first.
export const MAX_SCORE = 999_999_999;
const SCORE_DIGITS = String(MAX_SCORE).length;
const SCORES_PARTITION = 'scores';
const PLAYERS_PARTITION = 'players';
const LEADERBOARD_SIZE = 20;

let tablesPromise;

function getTables() {
  tablesPromise ??= (async () => {
    const connectionString = process.env.TABLES_CONNECTION_STRING;
    if (!connectionString) throw new Error('TABLES_CONNECTION_STRING is not set');

    // Azurite (local emulator) is served over plain HTTP.
    const isLocal = /UseDevelopmentStorage=true|DefaultEndpointsProtocol=http;/i.test(connectionString);
    const options = { allowInsecureConnection: isLocal };
    const scores = TableClient.fromConnectionString(connectionString, 'scores', options);
    const players = TableClient.fromConnectionString(connectionString, 'players', options);

    // No-op if the tables already exist.
    await Promise.all([scores.createTable(), players.createTable()]);
    return { scores, players };
  })().catch((err) => {
    tablesPromise = undefined; // allow a retry on the next request
    throw err;
  });
  return tablesPromise;
}

function scoreRowKey(score) {
  const inverted = String(MAX_SCORE - score).padStart(SCORE_DIGITS, '0');
  // Ties: earlier submissions rank first; UUID guarantees uniqueness.
  return `${inverted}_${String(Date.now()).padStart(15, '0')}_${randomUUID()}`;
}

function playerRowKey(username) {
  // RowKey disallows / \ # ? and control chars; base64url is always safe.
  return Buffer.from(username.toLowerCase(), 'utf8').toString('base64url');
}

export async function getLeaderboard() {
  const { scores } = await getTables();
  const pages = scores
    .listEntities({
      queryOptions: {
        filter: odata`PartitionKey eq ${SCORES_PARTITION}`,
        select: ['username', 'score', 'highscore'],
      },
    })
    .byPage({ maxPageSize: LEADERBOARD_SIZE });

  const rows = [];
  for await (const page of pages) {
    for (const e of page) {
      rows.push({ username: e.username, score: e.score, highscore: e.highscore });
      if (rows.length === LEADERBOARD_SIZE) return rows;
    }
  }
  return rows;
}

/** Updates the player's best score (with optimistic concurrency) and returns it. */
async function updatePlayerBest(players, username, score) {
  const rowKey = playerRowKey(username);

  for (let attempt = 0; attempt < 3; attempt++) {
    let existing;
    try {
      existing = await players.getEntity(PLAYERS_PARTITION, rowKey);
    } catch (err) {
      if (err.statusCode !== 404) throw err;
    }

    const highscore = Math.max(existing?.highscore ?? 0, score);
    try {
      if (!existing) {
        await players.createEntity({ partitionKey: PLAYERS_PARTITION, rowKey, username, highscore });
      } else if (highscore > existing.highscore) {
        await players.updateEntity(
          { partitionKey: PLAYERS_PARTITION, rowKey, username, highscore },
          'Replace',
          { etag: existing.etag },
        );
      }
      return highscore;
    } catch (err) {
      // 409: created concurrently; 412: etag changed. Re-read and retry.
      if (err.statusCode !== 409 && err.statusCode !== 412) throw err;
    }
  }
  throw new Error('Could not update player high score due to concurrent updates');
}

export async function saveScore(username, score) {
  const { scores, players } = await getTables();
  const highscore = await updatePlayerBest(players, username, score);
  await scores.createEntity({
    partitionKey: SCORES_PARTITION,
    rowKey: scoreRowKey(score),
    username,
    score,
    highscore,
  });
  return highscore;
}
