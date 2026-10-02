import { useState } from 'react';
import { submitScore } from '../api.js';

export default function GameOver({ score, leaderboardOnline, onRestart, onSubmitted, onSubmitFailed }) {
  const [username, setUsername] = useState('player');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    setStatus('sending');
    try {
      const res = await submitScore(name, score);
      setStatus('sent');
      setMessage(res.message);
      onSubmitted();
    } catch (err) {
      setStatus('error');
      setMessage(`Couldn't submit score: ${err.message}`);
      onSubmitFailed();
    }
  };

  const showForm = leaderboardOnline && status !== 'sent';

  return (
    <div className="overlay">
      <h2>Game Over!</h2>
      <p>Score: {score}</p>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={32}
            placeholder="Username"
            aria-label="Username for the leaderboard"
            autoFocus
            disabled={status === 'sending'}
          />
          <button type="submit" disabled={status === 'sending' || !username.trim()}>
            {status === 'sending' ? 'Sending…' : 'Submit score'}
          </button>
        </form>
      )}

      {message && <p className={status === 'error' ? 'error' : 'success'}>{message}</p>}
      {!leaderboardOnline && status !== 'error' && (
        <p className="muted">Online leaderboard is unavailable right now.</p>
      )}

      <button type="button" onClick={onRestart} autoFocus={!showForm}>
        Play again
      </button>
    </div>
  );
}
