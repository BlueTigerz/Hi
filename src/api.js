const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TIMEOUT_MS = 5000;

async function request(path, options) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    ...options,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body;
}

export async function fetchLeaderboard() {
  const rows = await request('/leaderboard');
  // Guard against hosts that answer /api/* with something other than our API.
  if (!Array.isArray(rows)) throw new Error('Unexpected leaderboard response');
  return rows;
}

export function submitScore(username, score) {
  return request('/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score }),
  });
}
