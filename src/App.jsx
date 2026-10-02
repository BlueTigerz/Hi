import { useEffect } from 'react';
import Board from './components/Board.jsx';
import GameOver from './components/GameOver.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import BackgroundMusic from './components/BackgroundMusic.jsx';
import SoundControls from './components/SoundControls.jsx';
import { useSoundSettings } from './hooks/useSoundSettings.js';
import { useTetris } from './game/useTetris.js';
import { useHighScore } from './game/useHighScore.js';
import { useLeaderboard } from './hooks/useLeaderboard.js';

export default function App() {
  const { board, piece, score, gameOver, reset } = useTetris();
  const highScore = useHighScore(score);
  const leaderboard = useLeaderboard();
  const sound = useSoundSettings();
  const online = leaderboard.status === 'online';
  const { refresh } = leaderboard;

  // Re-check the API at game over so the submit form reflects its current state.
  useEffect(() => {
    if (gameOver) refresh();
  }, [gameOver, refresh]);

  return (
    <main className="app">
      <BackgroundMusic volume={sound.volume} muted={sound.muted} />

      <h1>Minecraft Tetris</h1>

      <SoundControls {...sound} />

      <Board board={board} piece={piece}>
        {gameOver && (
          <GameOver
            score={score}
            leaderboardOnline={online}
            onRestart={reset}
            onSubmitted={refresh}
            onSubmitFailed={refresh}
          />
        )}
      </Board>

      <div className="scoreboard">
        Score: {score} | High Score: {highScore}
      </div>

      <div className="info">
        Controls: ← → or A D to move, ↑, W or Space to rotate, ↓ or S to drop faster.
      </div>

      {online && <Leaderboard rows={leaderboard.rows} />}
    </main>
  );
}
