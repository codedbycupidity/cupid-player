import { useState } from 'react';
import './App.css';

export default function App() {
  const [track, setTrack] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cupid Player</h1>
      </header>
      <main className="app-main">
        {track ? (
          <p>Now playing: {track}</p>
        ) : (
          <p className="empty">No track loaded.</p>
        )}
      </main>
    </div>
  );
}
