import { useEffect, useRef } from 'react';

const SRC = '/MinecraftCreator8bitVRC6Cover.mp3';

export default function BackgroundMusic({ volume, muted }) {
  const audioRef = useRef(null);
  const silent = muted || volume === 0;

  // Browsers block autoplay until the user interacts, so retry on first input.
  useEffect(() => {
    const audio = audioRef.current;
    const play = () => {
      if (!audio.muted) audio.play().catch(() => {});
    };
    play();
    window.addEventListener('keydown', play, { once: true });
    window.addEventListener('pointerdown', play, { once: true });
    return () => {
      window.removeEventListener('keydown', play);
      window.removeEventListener('pointerdown', play);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    audio.muted = silent;
    // Changing a sound control is a user gesture, so playback is allowed here.
    if (!silent && audio.paused) audio.play().catch(() => {});
  }, [volume, silent]);

  return <audio ref={audioRef} src={SRC} loop />;
}
