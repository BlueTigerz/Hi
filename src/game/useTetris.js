import { useCallback, useEffect, useReducer } from 'react';
import { TICK_MS, initialState, randomPiece, reducer } from './tetris.js';

const KEY_ACTIONS = {
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowUp: 'rotate', w: 'rotate', W: 'rotate', ' ': 'rotate',
};

// Let focused form controls keep their own keys (typing a name, Space on a button,
// arrows on the volume slider). Sound controls drop focus after mouse use, so
// clicking them doesn't steal the game's keys.
const OWNS_KEYS = 'input, textarea, select, button';

export function useTetris() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState());

  useEffect(() => {
    if (state.gameOver) return undefined;
    const id = setInterval(() => dispatch({ type: 'tick', next: randomPiece() }), TICK_MS);
    return () => clearInterval(id);
  }, [state.gameOver]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target instanceof Element && e.target.matches(OWNS_KEYS)) return;
      const type = KEY_ACTIONS[e.key];
      if (!type) return;
      e.preventDefault();
      dispatch({ type });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const reset = useCallback(() => dispatch({ type: 'reset', next: randomPiece() }), []);

  return { ...state, reset };
}
