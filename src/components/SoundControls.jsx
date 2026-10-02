// Drop focus after mouse/touch use so arrow keys and Space go back to the game.
// Keyboard users (Tab) keep focus and can adjust the controls normally.
const releaseFocus = (e) => e.currentTarget.blur();

export default function SoundControls({ volume, muted, setVolume, toggleMuted }) {
  const silent = muted || volume === 0;

  return (
    <div className="sound-controls">
      <button
        type="button"
        onClick={toggleMuted}
        onPointerUp={releaseFocus}
        aria-pressed={!silent}
        aria-label={silent ? 'Turn sound on' : 'Turn sound off'}
        title={silent ? 'Sound off' : 'Sound on'}
      >
        {silent ? '🔇' : '🔊'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={silent ? 0 : volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        onPointerUp={releaseFocus}
        aria-label="Music volume"
      />
      <span className="volume-label">{Math.round((silent ? 0 : volume) * 100)}%</span>
    </div>
  );
}
