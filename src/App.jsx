import { useState } from 'react';
import './App.css';

import frame from '../assets/frame.png';
import plant from '../assets/plant.png';
import progressBar from '../assets/progress_bar.png';
import progressBarStars from '../assets/progress_bar_stars.png';
import starDefault from '../assets/star_selected.png';
import backwardsButton from '../assets/backwards_button.png';
import pauseButton from '../assets/pause_button.png';
import forwardsButton from '../assets/forwards_button.png';
import exitButton from '../assets/exit_button.png';
import minimizerButton from '../assets/minimizer_button.png';
import windowButton from '../assets/window_button.png';

export default function App() {
  const [track, setTrack] = useState(null);
  const [progress, setProgress] = useState(0);

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

      {/* Playback controls */}
      <img
        src={backwardsButton}
        className="layer clickable"
        alt="Previous"
        draggable={false}
      />
      <img
        src={pauseButton}
        className="layer clickable"
        alt="Pause"
        draggable={false}
      />
      <img
        src={forwardsButton}
        className="layer clickable"
        alt="Next"
        draggable={false}
      />

      {/* Window controls */}
      <img
        src={minimizerButton}
        className="layer clickable"
        alt="Minimize"
        draggable={false}
        onClick={() => window.cupid?.minimize()}
      />
      <img
        src={windowButton}
        className="layer clickable"
        alt="Maximize"
        draggable={false}
        onClick={() => window.cupid?.maximize()}
      />
      <img
        src={exitButton}
        className="layer clickable"
        alt="Close"
        draggable={false}
        onClick={() => window.cupid?.close()}
      />

      {/* Drag region for moving the window */}
      <div className="drag-region" />
    </div>
  );
}
