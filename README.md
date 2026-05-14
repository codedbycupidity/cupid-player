# cupid player

A pixel-art desktop music player built with Electron, Vite, and React.

## Features

- Pixel-art UI with animated record player, spinning vinyl, and needle
- Record swap animation on song change (pink/blue vinyl alternation)
- Interactive progress bar with draggable star indicator
- Marquee scrolling for long track titles
- Pink and blue theme switching with persistent preference
- Spotify integration — browse your playlists and play tracks via yt-dlp
- Apple Music integration — browse your library playlists via MusicKit JS
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

## Apple Music Setup

Browse your Apple Music library playlists. Requires an Apple Developer account for the MusicKit key. **Apple Music subscription is not required for playback.**

See [APPLE_MUSIC_SETUP.md](APPLE_MUSIC_SETUP.md) for full setup instructions.

## Local Playback

Drop MP3 files into the `audio/` directory. The player will pick them up automatically with metadata and album art extracted from the files.

## Build

```bash
npm run package
```

The built app will be in `out/mac-arm64/Cupid Player.app` (macOS) or `out/` for other platforms.

### Install as Desktop App

**macOS:**
```bash
cp -r "out/mac-arm64/Cupid Player.app" /Applications/
```

**Windows:** Run the installer from `out/Cupid Player Setup.exe`.

**Linux:** Run the AppImage from `out/`.

> Note: The macOS build is unsigned. On first launch you may need to right-click > Open, or go to System Settings > Privacy & Security to allow it.

## Tech Stack

- **Electron** — desktop app shell (frameless window, IPC, system tray)
- **Vite** — build tool and dev server
- **React** — UI framework
- **HTML5 Audio** — local MP3 playback
- **yt-dlp** — YouTube audio streaming for Spotify/Apple Music tracks
- **Spotify Web API** — playlist and metadata fetching (OAuth PKCE)
- **Apple MusicKit JS** — library playlist access (JWT auth)
- **CSS** — custom properties for theming, calc-based responsive scaling
- **Node.js** — main process (JWT generation, yt-dlp execution)
- **jsonwebtoken** — Apple Music developer token generation
- **music-metadata** — MP3 ID3 tag extraction (title, artist, album art)
