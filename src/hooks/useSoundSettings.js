import { useEffect, useState } from 'react';

const STORAGE_KEY = 'tetrisSoundSettings';
const DEFAULTS = { volume: 0.4, muted: false };

function readStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const volume = Number(saved?.volume);
    return {
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : DEFAULTS.volume,
      muted: Boolean(saved?.muted),
    };
  } catch {
    return DEFAULTS;
  }
}

export function useSoundSettings() {
  const [settings, setSettings] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable — settings last for this session only.
    }
  }, [settings]);

  return {
    ...settings,
    setVolume: (volume) => setSettings({ volume, muted: volume === 0 }),
    toggleMuted: () =>
      setSettings((s) => ({
        muted: !s.muted,
        // Unmuting at zero volume would be silent; restore a sensible level.
        volume: s.muted && s.volume === 0 ? DEFAULTS.volume : s.volume,
      })),
  };
}
