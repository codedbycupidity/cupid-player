/**
 * React hook for Spotify Web Playback SDK
 *
 * Exposes the same interface as useAudioPlayer so the UI can
 * drive either source without caring which is active.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  initPlayer,
  disconnectPlayer,
  playTracks,
  resume,
  pause as sdkPause,
  seek as sdkSeek,
  nextTrack,
  previousTrack,
  getCurrentState,
} from './spotify/player.js';
import { getAccessToken } from './spotify/auth.js';

export default function useSpotifyPlayer(tracks) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);

  const pollRef = useRef(null);
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const track = tracks[trackIndex] ?? {
    title: 'No track',
    artist: '',
    art: null,
    uri: null,
  };

  // ── Initialise SDK player ──────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const token = await getAccessToken();
      if (!token || cancelled) return;

      await initPlayer(token, {
        onStateChange: (state) => {
          if (!state || cancelled) return;

          const { paused, position, duration: dur, track_window } = state;

          setIsPlaying(!paused);
          setCurrentTime(position / 1000);
          setDuration(dur / 1000);
          setProgress(dur > 0 ? position / dur : 0);

          // Sync track index if the SDK moved to a different track
          if (track_window?.current_track) {
            const sdkUri = track_window.current_track.uri;
            const idx = tracksRef.current.findIndex((t) => t.uri === sdkUri);
            if (idx !== -1) {
              setTrackIndex(idx);
            }
          }
        },
        onReady: () => {
          if (!cancelled) setReady(true);
        },
        onTokenRefresh: () => getAccessToken(),
      });
    }

    init();

    return () => {
      cancelled = true;
      disconnectPlayer();
      setReady(false);
    };
  }, []);

  // ── Poll progress while playing ────────────────────────────

  useEffect(() => {
    if (isPlaying) {
      pollRef.current = setInterval(async () => {
        const state = await getCurrentState();
        if (state) {
          const pos = state.position / 1000;
          const dur = state.duration / 1000;
          setCurrentTime(pos);
          setDuration(dur);
          setProgress(dur > 0 ? state.position / state.duration : 0);
        }
      }, 500);
    } else {
      clearInterval(pollRef.current);
    }

    return () => clearInterval(pollRef.current);
  }, [isPlaying]);

  // ── Playback controls ──────────────────────────────────────

  const startPlayback = useCallback(
    async (index) => {
      const token = await getAccessToken();
      if (!token || !tracks.length) return;
      const uris = tracks.map((t) => t.uri);
      await playTracks(token, uris, index ?? trackIndex);
    },
    [tracks, trackIndex],
  );

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await sdkPause();
    } else {
      // If we haven't started playback yet, kick it off
      const state = await getCurrentState();
      if (!state) {
        await startPlayback(trackIndex);
      } else {
        await resume();
      }
    }
  }, [isPlaying, startPlayback, trackIndex]);

  const next = useCallback(async () => {
    await nextTrack();
  }, []);

  const prev = useCallback(async () => {
    // If more than 3 seconds in, restart; otherwise go to previous
    if (currentTime > 3) {
      await sdkSeek(0);
    } else {
      await previousTrack();
    }
  }, [currentTime]);

  const seek = useCallback(
    async (fraction) => {
      if (duration > 0) {
        await sdkSeek(Math.round(fraction * duration * 1000));
      }
    },
    [duration],
  );

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
    ready,
    startPlayback,
  };
}
