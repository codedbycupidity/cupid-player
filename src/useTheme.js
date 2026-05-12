import { useState, useCallback, useMemo } from 'react';

// ── Pink theme assets ────────────────────────────────────
import pinkFrame from '../assets/animations/pink/frame.png';
import pinkFrameNoBg from '../assets/animations/pink/frame_no_background.png';
import pinkPlant from '../assets/animations/pink/plant.png';
import pinkRecordPlayer from '../assets/animations/pink/record_player.png';
import pinkAlbumFrame from '../assets/animations/pink/album_frame.png';
import pinkBackwardsButton from '../assets/animations/pink/backwards_button.png';
import pinkPauseButton from '../assets/animations/pink/pause_button.png';
import pinkPlayButton from '../assets/animations/pink/play_button.png';
import pinkForwardsButton from '../assets/animations/pink/forwards_button.png';
import pinkExitButton from '../assets/animations/pink/exit_button.png';
import pinkMinimizerButton from '../assets/animations/pink/minimizer_button.png';
import pinkWindowButton from '../assets/animations/pink/window_button.png';
import pinkFavicon from '../assets/animations/pink/favicon.png';

// ── Blue theme assets ────────────────────────────────────
import blueFrame from '../assets/animations/blue/frame.png';
import blueFrameNoBg from '../assets/animations/blue/frame_no_background.png';
import bluePlant from '../assets/animations/blue/plant.png';
import blueRecordPlayer from '../assets/animations/blue/record_player.png';
import blueAlbumFrame from '../assets/animations/blue/album_frame.png';
import blueBackwardsButton from '../assets/animations/blue/backwards_button.png';
import bluePauseButton from '../assets/animations/blue/pause_button.png';
import bluePlayButton from '../assets/animations/blue/play_button.png';
import blueForwardsButton from '../assets/animations/blue/forwards_button.png';
import blueExitButton from '../assets/animations/blue/exit_button.png';
import blueMinimizerButton from '../assets/animations/blue/minimizer_button.png';
import blueWindowButton from '../assets/animations/blue/window_button.png';
import blueFavicon from '../assets/animations/blue/favicon.png';

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
