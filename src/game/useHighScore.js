import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tetrisHighScoreMinecraft';

function readStored() {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function useHighScore(score) {
  const [highScore, setHighScore] = useState(readStored);

  useEffect(() => {
    if (score <= highScore) return;
    setHighScore(score);
    try {
      localStorage.setItem(STORAGE_KEY, String(score));
    } catch {
      // Storage unavailable (private mode, etc.) — keep in-memory value only.
    }
  }, [score, highScore]);

  return highScore;
}
