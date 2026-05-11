import { useState, useCallback, useEffect } from 'react';
import './App.css';
import useAudioPlayer from './useAudioPlayer';
import useSpotifyPlayer from './useSpotifyPlayer';
import { login, handleCallback, isLoggedIn, logout } from './spotify/auth.js';
import { parsePlaylistUrl, fetchPlaylistTracks } from './spotify/api.js';

import frame from '../assets/frame.png';
import plant from '../assets/plant.png';
import progressBar from '../assets/progress_bar.png';
import progressBarStars from '../assets/progress_bar_stars.png';
import starDefault from '../assets/star_selected.png';
import backwardsButton from '../assets/backwards_button.png';
import pauseButton from '../assets/pause_button.png';
import playButton from '../assets/play_button.png';
import forwardsButton from '../assets/forwards_button.png';
import exitButton from '../assets/exit_button.png';
import minimizerButton from '../assets/minimizer_button.png';
import windowButton from '../assets/window_button.png';
import albumFrame from '../assets/album_frame.png';

function useResize(corner) {
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    let lastX = e.screenX;
    let lastY = e.screenY;

    const onMouseMove = (e) => {
      const dx = e.screenX - lastX;
      const dy = e.screenY - lastY;
      lastX = e.screenX;
      lastY = e.screenY;
      window.cupid?.resize({ dx, dy, corner });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [corner]);

  return onMouseDown;
}

function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  // ── Source state ─────────────────────────────────────────
  const [source, setSource] = useState('local'); // 'local' | 'spotify'
  const [spotifyConnected, setSpotifyConnected] = useState(isLoggedIn());
  const [spotifyTracks, setSpotifyTracks] = useState([]);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [spotifyError, setSpotifyError] = useState(null);
  const [showSpotifyPanel, setShowSpotifyPanel] = useState(false);

  // ── Hooks for both sources ──────────────────────────────
  const local = useAudioPlayer();
  const spotify = useSpotifyPlayer(spotifyTracks);

  // Choose the active player based on source
  const player = source === 'spotify' ? spotify : local;

  const {
    track,
    isPlaying,
    progress,
    duration,
    currentTime,
    togglePlay,
    next,
    prev,
    seek,
  } = player;

  // ── Handle OAuth callback on mount ──────────────────────
  useEffect(() => {
    async function checkCallback() {
      const params = new URLSearchParams(window.location.search);
      if (params.has('code')) {
        try {
          await handleCallback();
          setSpotifyConnected(true);
        } catch (err) {
          setSpotifyError(err.message);
        }
      }
    }
    checkCallback();
  }, []);

  // ── Spotify playlist loading ────────────────────────────
  const loadSpotifyPlaylist = useCallback(async () => {
    const id = parsePlaylistUrl(playlistUrl);
    if (!id) {
      setSpotifyError('Invalid Spotify playlist URL');
      return;
    }

    setLoadingPlaylist(true);
    setSpotifyError(null);

    try {
      const tracks = await fetchPlaylistTracks(id);
      if (tracks.length === 0) {
        setSpotifyError('Playlist is empty or contains no playable tracks');
        return;
      }
      setSpotifyTracks(tracks);
      setSource('spotify');
      setShowSpotifyPanel(false);
    } catch (err) {
      setSpotifyError(err.message);
    } finally {
      setLoadingPlaylist(false);
    }
  }, [playlistUrl]);

  const switchToLocal = useCallback(() => {
    setSource('local');
    setShowSpotifyPanel(false);
  }, []);

  const handleSpotifyConnect = useCallback(() => {
    login();
  }, []);

  const handleSpotifyDisconnect = useCallback(() => {
    logout();
    setSpotifyConnected(false);
    setSpotifyTracks([]);
    if (source === 'spotify') setSource('local');
  }, [source]);

  // ── Resize handles ─────────────────────────────────────
  const resizeTL = useResize('top-left');
  const resizeTR = useResize('top-right');
  const resizeBL = useResize('bottom-left');
  const resizeBR = useResize('bottom-right');

  return (
    <div className="player">
      {/* Base frame */}
      <img src={frame} className="layer" alt="" draggable={false} />

      {/* Decorative */}
      <img src={plant} className="layer" alt="" draggable={false} />

      {/* Progress bar layers */}
      <img src={progressBar} className="layer" alt="" draggable={false} />
      <img src={progressBarStars} className="layer" alt="" draggable={false} />
      <img src={starDefault} className="layer" alt="" draggable={false} />

      {/* Playback control layers (visual only) */}
      <img src={backwardsButton} className="layer" alt="" draggable={false} />
      <img src={isPlaying ? pauseButton : playButton} className="layer" alt="" draggable={false} />
      <img src={forwardsButton} className="layer" alt="" draggable={false} />

      {/* Window control layers (visual only) */}
      <img src={minimizerButton} className="layer" alt="" draggable={false} />
      <img src={windowButton} className="layer" alt="" draggable={false} />
      <img src={exitButton} className="layer" alt="" draggable={false} />

      {/* SVG clip-path for pixel-art album mask */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="album-mask" clipPathUnits="objectBoundingBox">
            {/* 35x41 centered vertically */}
            <rect x="0.07317" y="0" width="0.85366" height="1" />
            {/* 37x39 */}
            <rect x="0.04878" y="0.02439" width="0.90244" height="0.95122" />
            {/* 39x37 */}
            <rect x="0.02439" y="0.04878" width="0.95122" height="0.90244" />
            {/* 41x35 */}
            <rect x="0" y="0.07317" width="1" height="0.85366" />
          </clipPath>
        </defs>
      </svg>

      {/* Album art clipped to pixel mask */}
      {track.art && (
        <div className="album-mask">
          <img src={track.art} className="album-art" alt="" draggable={false} />
        </div>
      )}

      {/* Album frame overlay */}
      <img src={albumFrame} className="layer album-frame-layer" alt="" draggable={false} />

      {/* Now playing section */}
      <div className="now-playing">
        <div className="track-info">
          <div className="now-playing-label">
            {source === 'spotify' ? 'spotify' : 'now playing...'}
          </div>
          <div className="track-title">{track.title}</div>
          <div className="track-artist">by {track.artist}</div>
        </div>
      </div>

      {/* Time display */}
      <div className="time-display">
        <span className="time-current">{formatTime(currentTime)}</span>
        <span className="time-remaining">{formatTime(duration - currentTime)}</span>
      </div>

      {/* Spotify connection panel */}
      {showSpotifyPanel && (
        <div className="spotify-panel">
          <div className="spotify-panel-inner">
            {!spotifyConnected ? (
              <>
                <div className="spotify-label">connect spotify</div>
                <button className="spotify-btn" onClick={handleSpotifyConnect}>
                  log in
                </button>
              </>
            ) : (
              <>
                <div className="spotify-label">
                  spotify {source === 'spotify' ? '(active)' : '(connected)'}
                </div>
                <input
                  className="spotify-input"
                  type="text"
                  placeholder="paste playlist url..."
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadSpotifyPlaylist()}
                />
                <div className="spotify-btn-row">
                  <button
                    className="spotify-btn"
                    onClick={loadSpotifyPlaylist}
                    disabled={loadingPlaylist}
                  >
                    {loadingPlaylist ? '...' : 'load'}
                  </button>
                  {source === 'spotify' && (
                    <button className="spotify-btn" onClick={switchToLocal}>
                      local
                    </button>
                  )}
                  <button className="spotify-btn spotify-btn-disconnect" onClick={handleSpotifyDisconnect}>
                    logout
                  </button>
                </div>
                {spotifyError && <div className="spotify-error">{spotifyError}</div>}
              </>
            )}
          </div>
        </div>
      )}

      {/* Drag region for moving the window */}
      <div className="drag-region" />

      {/* Custom resize handles at frame corners */}
      <div className="resize-handle top-left" onMouseDown={resizeTL} />
      <div className="resize-handle top-right" onMouseDown={resizeTR} />
      <div className="resize-handle bottom-left" onMouseDown={resizeBL} />
      <div className="resize-handle bottom-right" onMouseDown={resizeBR} />

      {/* Playback control click targets */}
      <div className="btn btn-prev" onClick={prev} />
      <div className="btn btn-play" onClick={togglePlay} />
      <div className="btn btn-next" onClick={next} />

      {/* Window control click targets */}
      <div className="btn btn-spotify-toggle" onClick={() => setShowSpotifyPanel((v) => !v)} title="Spotify" />
      <div className="btn btn-minimize" onClick={() => window.cupid?.minimize()} />
      <div className="btn btn-window" onClick={() => window.cupid?.maximize()} />
      <div className="btn btn-exit" onClick={() => window.cupid?.close()} />
    </div>
  );
}
