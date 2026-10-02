// CORS is only needed when the frontend is served from a different origin than
// the API (e.g. a separately hosted frontend calling this Static Web App's /api).
// Requests from the Static Web App's own domain are same-origin and unaffected.
// ALLOWED_ORIGINS: comma-separated list of origins, or "*".
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

function corsHeaders(request) {
  const origin = request.headers.get('origin');
  if (!origin) return {};
  const allowAny = allowedOrigins.includes('*');
  if (!allowAny && !allowedOrigins.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': allowAny ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** Wraps a handler with CORS headers, preflight handling and JSON error responses. */
export function withCors(handler) {
  return async (request, context) => {
    const cors = corsHeaders(request);
    if (request.method === 'OPTIONS') return { status: 204, headers: cors };

    try {
      const response = await handler(request, context);
      return { ...response, headers: { ...cors, ...response.headers } };
    } catch (err) {
      context.error(err);
      return { status: 500, headers: cors, jsonBody: { error: 'Internal server error' } };
    }
  };
}
