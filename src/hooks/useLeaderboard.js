import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLeaderboard } from '../api.js';

const RETRY_MS = 30_000;

/**
 * Tracks whether the leaderboard API is reachable. The game never depends on
 * it: while offline we retry in the background, and leaderboard features light
 * up as soon as the API answers.
 *
 * status: 'checking' | 'online' | 'offline'
 */
export function useLeaderboard() {
  const [status, setStatus] = useState('checking');
  const [rows, setRows] = useState([]);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setRows(await fetchLeaderboard());
      setStatus('online');
    } catch (err) {
      console.warn('Leaderboard unavailable:', err.message);
      setStatus('offline');
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== 'offline') return undefined;
    const id = setInterval(refresh, RETRY_MS);
    window.addEventListener('online', refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', refresh);
    };
  }, [status, refresh]);

  return { status, rows, refresh };
}
