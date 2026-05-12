import { useState, useRef, useEffect, useCallback } from 'react';
import playlist from './playlist';

/**
 * Local audio player hook (HTML5 Audio).
 *
 * When used directly, plays from the local playlist.
 * The App component chooses between this and useSpotifyPlayer
 * based on the active source.
 */
export default function useAudioPlayer() {
  const audioRef = useRef(new Audio());
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const track = playlist[trackIndex];
  const audio = audioRef.current;

  // Load track when index changes
  useEffect(() => {
    audio.src = `./${track.file}`;
    audio.load();
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [trackIndex]);

  // Time update listener
  useEffect(() => {
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setTrackIndex((prev) => (prev + 1) % playlist.length);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const play = useCallback(() => {
    audio.play().catch(() => {});
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    setTrackIndex((prev) => (prev + 1) % playlist.length);
  }, []);

  const prev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  }, []);

  const seek = useCallback((fraction) => {
    if (audio.duration) {
      audio.currentTime = Math.min(fraction, 1) * audio.duration;
    }
  }, []);

  return {
    track,
    trackIndex,
    isPlaying,
    progress,
    duration,
    currentTime,
    togglePlay,
    next,
    prev,
    seek,
  };
}
