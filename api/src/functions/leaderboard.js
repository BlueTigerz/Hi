import { app } from '@azure/functions';
import { withCors } from '../http.js';
import { getLeaderboard } from '../store.js';

export const leaderboardHandler = withCors(async () => ({
  jsonBody: await getLeaderboard(),
  headers: { 'Cache-Control': 'no-store' },
}));

app.http('leaderboard', {
  route: 'leaderboard',
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: leaderboardHandler,
});
