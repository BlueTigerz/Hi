import { app } from '@azure/functions';
import { withCors } from '../http.js';
import { MAX_SCORE, saveScore } from '../store.js';

export const submitScoreHandler = withCors(async (request) => {
  const body = await request.json().catch(() => null);
  const username = String(body?.username ?? '').trim();
  const score = Number(body?.score);

  if (!username || username.length > 32) {
    return { status: 400, jsonBody: { error: 'Username must be 1-32 characters' } };
  }
  if (!Number.isInteger(score) || score < 0 || score > MAX_SCORE) {
    return { status: 400, jsonBody: { error: 'Score must be a non-negative integer' } };
  }

  const highscore = await saveScore(username, score);
  return { status: 201, jsonBody: { message: 'Score saved!', highscore } };
});

app.http('scores', {
  route: 'scores',
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: submitScoreHandler,
});
