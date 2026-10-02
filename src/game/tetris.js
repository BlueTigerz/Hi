export const ROWS = 20;
export const COLS = 10;
export const TICK_MS = 500;
export const POINTS_PER_LINE = 100;
const SPAWN_COL = 3;

export const PIECES = [
  { shape: [[1, 1, 1, 1]], type: 'i' },
  { shape: [[1, 1], [1, 1]], type: 'o' },
  { shape: [[0, 1, 0], [1, 1, 1]], type: 't' },
  { shape: [[1, 0, 0], [1, 1, 1]], type: 'j' },
  { shape: [[0, 0, 1], [1, 1, 1]], type: 'l' },
  { shape: [[1, 1, 0], [0, 1, 1]], type: 's' },
  { shape: [[0, 1, 1], [1, 1, 0]], type: 'z' },
];

export function randomPiece() {
  const pick = PIECES[Math.floor(Math.random() * PIECES.length)];
  return { shape: pick.shape.map((row) => row.slice()), type: pick.type, row: 0, col: SPAWN_COL };
}

export function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function collides(board, shape, row, col) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (!shape[i][j]) continue;
      const r = row + i;
      const c = col + j;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
      if (board[r][c]) return true;
    }
  }
  return false;
}

export function rotate(shape) {
  const h = shape.length;
  const w = shape[0].length;
  return Array.from({ length: w }, (_, c) =>
    Array.from({ length: h }, (_, i) => shape[h - 1 - i][c]),
  );
}

function merge(board, piece) {
  const next = board.map((row) => row.slice());
  piece.shape.forEach((cells, i) =>
    cells.forEach((filled, j) => {
      if (filled) next[piece.row + i][piece.col + j] = piece.type;
    }),
  );
  return next;
}

function clearLines(board) {
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;
  const fresh = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...fresh, ...kept], cleared };
}

export function initialState(piece = randomPiece()) {
  return { board: emptyBoard(), piece, score: 0, gameOver: false };
}

function tryMove(state, dRow, dCol) {
  const { piece, board } = state;
  if (collides(board, piece.shape, piece.row + dRow, piece.col + dCol)) return state;
  return { ...state, piece: { ...piece, row: piece.row + dRow, col: piece.col + dCol } };
}

/**
 * Pure reducer. Randomness is injected via `action.next` so the reducer
 * stays deterministic (safe under React StrictMode double-invocation).
 */
export function reducer(state, action) {
  if (action.type === 'reset') return initialState(action.next);
  if (state.gameOver) return state;

  switch (action.type) {
    case 'left':
      return tryMove(state, 0, -1);
    case 'right':
      return tryMove(state, 0, 1);
    case 'down':
      return tryMove(state, 1, 0);
    case 'rotate': {
      const rotated = rotate(state.piece.shape);
      if (collides(state.board, rotated, state.piece.row, state.piece.col)) return state;
      return { ...state, piece: { ...state.piece, shape: rotated } };
    }
    case 'tick': {
      const moved = tryMove(state, 1, 0);
      if (moved !== state) return moved;

      const { board, cleared } = clearLines(merge(state.board, state.piece));
      const score = state.score + cleared * POINTS_PER_LINE;
      const next = action.next;
      const gameOver = collides(board, next.shape, next.row, next.col);
      return { board, piece: next, score, gameOver };
    }
    default:
      return state;
  }
}

/** Board with the active piece overlaid, for rendering. */
export function composeBoard(board, piece) {
  if (!piece) return board;
  const view = board.map((row) => row.slice());
  piece.shape.forEach((cells, i) =>
    cells.forEach((filled, j) => {
      const r = piece.row + i;
      const c = piece.col + j;
      if (filled && r >= 0 && r < ROWS && c >= 0 && c < COLS) view[r][c] = piece.type;
    }),
  );
  return view;
}
