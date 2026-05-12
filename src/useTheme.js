import { useState, useCallback, useMemo } from 'react';

// ── Pink theme assets ────────────────────────────────────
import pinkFrame from '../assets/pink/frame.png';
import pinkFrameNoBg from '../assets/pink/frame_no_background.png';
import pinkPlant from '../assets/pink/plant.png';
import pinkRecordPlayer from '../assets/pink/record_player.png';
import pinkAlbumFrame from '../assets/pink/album_frame.png';
import pinkBackwardsButton from '../assets/pink/backwards_button.png';
import pinkPauseButton from '../assets/pink/pause_button.png';
import pinkPlayButton from '../assets/pink/play_button.png';
import pinkForwardsButton from '../assets/pink/forwards_button.png';
import pinkExitButton from '../assets/pink/exit_button.png';
import pinkMinimizerButton from '../assets/pink/minimizer_button.png';
import pinkWindowButton from '../assets/pink/window_button.png';
import pinkFavicon from '../assets/pink/favicon.png';
// ── Shared animation assets ─────────────────────────────
import recordA1 from '../assets/animations/record-pink/frame-1.png';
import recordA2 from '../assets/animations/record-pink/frame-2.png';
import recordA3 from '../assets/animations/record-pink/frame-3.png';
import recordA4 from '../assets/animations/record-pink/frame-4.png';
import recordB1 from '../assets/animations/record-blue/frame-1.png';
import recordB2 from '../assets/animations/record-blue/frame-2.png';
import recordB3 from '../assets/animations/record-blue/frame-3.png';
import recordB4 from '../assets/animations/record-blue/frame-4.png';
import needlePlay1 from '../assets/animations/needle-playing/frame-1.png';
import needlePlay2 from '../assets/animations/needle-playing/frame-2.png';
import needlePlay3 from '../assets/animations/needle-playing/frame-3.png';
import needleChange1 from '../assets/animations/needle-change/frame-1.png';
import needleChange2 from '../assets/animations/needle-change/frame-2.png';
import needleChange3 from '../assets/animations/needle-change/frame-3.png';

const SHARED_ANIMATIONS = {
  recordFramesA: [recordA1, recordA2, recordA3, recordA4],
  recordFramesB: [recordB1, recordB2, recordB3, recordB4],
  needlePlayFrames: [needlePlay1, needlePlay2, needlePlay3],
  needleChangeFrames: [needleChange1, needleChange2, needleChange3],
};

// ── Blue theme assets ────────────────────────────────────
import blueFrame from '../assets/blue/frame.png';
import blueFrameNoBg from '../assets/blue/frame_no_background.png';
import bluePlant from '../assets/blue/plant.png';
import blueRecordPlayer from '../assets/blue/record_player.png';
import blueAlbumFrame from '../assets/blue/album_frame.png';
import blueBackwardsButton from '../assets/blue/backwards_button.png';
import bluePauseButton from '../assets/blue/pause_button.png';
import bluePlayButton from '../assets/blue/play_button.png';
import blueForwardsButton from '../assets/blue/forwards_button.png';
import blueExitButton from '../assets/blue/exit_button.png';
import blueMinimizerButton from '../assets/blue/minimizer_button.png';
import blueWindowButton from '../assets/blue/window_button.png';
import blueFavicon from '../assets/blue/favicon.png';

const THEME_ASSETS = {
  pink: {
    frame: pinkFrame,
    frameNoBg: pinkFrameNoBg,
    plant: pinkPlant,
    recordPlayer: pinkRecordPlayer,
    albumFrame: pinkAlbumFrame,
    backwardsButton: pinkBackwardsButton,
    pauseButton: pinkPauseButton,
    playButton: pinkPlayButton,
    forwardsButton: pinkForwardsButton,
    exitButton: pinkExitButton,
    minimizerButton: pinkMinimizerButton,
    windowButton: pinkWindowButton,
    favicon: pinkFavicon,
    ...SHARED_ANIMATIONS,
  },
  blue: {
    frame: blueFrame,
    frameNoBg: blueFrameNoBg,
    plant: bluePlant,
    recordPlayer: blueRecordPlayer,
    albumFrame: blueAlbumFrame,
    backwardsButton: blueBackwardsButton,
    pauseButton: bluePauseButton,
    playButton: bluePlayButton,
    forwardsButton: blueForwardsButton,
    exitButton: blueExitButton,
    minimizerButton: blueMinimizerButton,
    windowButton: blueWindowButton,
    favicon: blueFavicon,
    ...SHARED_ANIMATIONS,
  },
};

const STORAGE_KEY = 'cupid-player-theme';

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'pink' || stored === 'blue') return stored;
  } catch {
    // localStorage unavailable
  }
  return 'pink';
}

/**
 * Theme hook — stores preference in localStorage and provides
 * the correct asset set for the active theme.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(getStoredTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'pink' ? 'blue' : 'pink';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const assets = useMemo(() => THEME_ASSETS[theme], [theme]);

  return { theme, toggleTheme, assets };
}
