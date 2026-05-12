# cupid player

A pixel-art desktop music player built with Electron, Vite, and React.

## Features

- Pixel-art UI with animated record player, spinning vinyl, and needle
- Record swap animation on song change (pink/blue vinyl alternation)
- Interactive progress bar with draggable star indicator
- Marquee scrolling for long track titles
- Pink and blue theme switching with persistent preference
- Spotify integration — browse your playlists and play tracks via yt-dlp
- Local MP3 playback from the `audio/` directory
- Custom frameless window with drag and resize
- Dynamic dock/taskbar icon that matches the active theme

## Getting Started

```bash
npm install
npm run dev
```

## Spotify Setup

Cupid Player can stream any track from your Spotify playlists. Audio is fetched from YouTube via yt-dlp, so **Spotify Premium is not required**.

See [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) for full setup instructions.

## Local Playback

Drop MP3 files into the `audio/` directory. The player will pick them up automatically with metadata and album art extracted from the files.

## Build

```bash
npm run package
```

## Tech

- Electron + Vite + React
- yt-dlp for audio streaming
- Spotify Web API for playlists and metadata
- CSS custom properties for theme switching
