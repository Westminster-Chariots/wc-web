"use client";

import { useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export default function AudioPlayer({ isMuted, setIsMuted }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay blocked, will play on first user interaction
        });
      }
    }

    // Ensure music continues playing
    const handleVisibilityChange = () => {
      if (audioRef.current && !document.hidden && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio ref={audioRef} loop>
        <source src="/assets/joyinsound-corporate-upbeat-motivational-music-royalty-free-496474.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMute}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-400/30 hover:bg-blue-600/30 transition-all duration-300"
        aria-label={isMuted ? "Unmute music" : "Mute music"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-blue-400" />
        ) : (
          <Volume2 className="w-5 h-5 text-blue-400" />
        )}
      </button>
    </>
  );
}