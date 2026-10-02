import { useMemo } from 'react';
import { composeBoard } from '../game/tetris.js';

export default function Board({ board, piece, children }) {
  const cells = useMemo(() => composeBoard(board, piece).flat(), [board, piece]);

  return (
    <div className="board-wrap">
      <div className="board">
        {cells.map((type, i) => (
          <div key={i} className={type ? `cell piece-${type}` : 'cell'} />
        ))}
      </div>
      {children}
    </div>
  );
}
