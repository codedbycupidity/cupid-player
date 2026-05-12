# Spotify Integration Setup

This guide walks you through connecting Cupid Player to your Spotify account. You'll need a **Spotify Premium** account — the Web Playback SDK requires it.

## 1. Create a Spotify App

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click **Create App**
3. Fill in the app details (name, description — anything is fine)
4. Under **Which API/SDKs are you planning to use?**, select:
   - **Web API**
   - **Web Playback SDK**
5. Click **Create**

## 2. Configure the Redirect URI

This is where most issues come up. Follow these steps exactly:

1. In your app's dashboard, go to **Settings**
2. Under **Redirect URIs**, add:
   ```
   http://127.0.0.1:5173/callback
   ```
3. Click **Save**

### Important notes

- You **must** use `127.0.0.1`, not `localhost`. Spotify treats them differently. (`127.0.0.1` is the standard loopback address — it always refers to your own machine and is the same for everyone.)
- You **must** use `http`, not `https`. Spotify allows HTTP for loopback addresses.
- Spotify will show a warning: _"This redirect URI is not secure."_ — this is expected and safe for local development. Ignore it and save.
- Do **not** add a trailing slash. The URI must be exactly `http://127.0.0.1:5173/callback`.

## 3. Add Your Client ID

1. Copy your **Client ID** from the app's dashboard
2. Create a `.env` file in the project root (use `.env.example` as a template):
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   ```
3. Replace `your_client_id_here` with the Client ID you copied

## 4. Add Yourself as a User (Development Mode)

Spotify apps start in **Development Mode**, which restricts API access to explicitly added users.

1. In your app's dashboard, go to **Settings** > **User Management**
2. Add the email address associated with your Spotify account
3. Save

Without this step, API calls will return `403 Forbidden` even with a valid token.

## 5. Run the App

```bash
npm install
npm run dev
```

1. Click the Spotify icon in the player to open the connection panel
2. Click **log in** — a Spotify login window will appear inside the app
3. Authorize the app when prompted
4. After authorization, you'll be redirected back to the player automatically
5. Paste a Spotify playlist URL and click **load**

## Troubleshooting

### `redirect_uri: Not matching configuration`

The redirect URI in your Spotify Dashboard does not exactly match what the app sends. Make sure your dashboard has exactly:

```
http://127.0.0.1:5173/callback
```

No trailing slash, no `https`, no `localhost`.

### `redirect_uri: Insecure`

You're using `https://localhost` as the redirect URI. Spotify rejects self-signed certificates. Switch to `http://127.0.0.1:5173/callback` instead.

### `403 Forbidden` on playlist fetch

Two possible causes:

1. **You haven't added yourself in User Management.** Your Spotify app is in Development Mode, which blocks API access for users not explicitly added. Go to your app's Settings > User Management and add your Spotify email.

2. **Stale token without required scopes.** If you previously logged in before the scopes were updated, your token won't have playlist permissions. Fix: open DevTools (`Cmd+Shift+I`), run `localStorage.clear()` in the console, reload the app, and log in again.

### `Failed to initialize player`

The Web Playback SDK requires **Spotify Premium**. Free accounts cannot use the SDK for streaming. Check that your account is Premium by looking at your Spotify account settings.

### Auth window opens but nothing happens after login

The OAuth callback must return to the Electron app, not the system browser. If you see the callback URL with a `?code=` parameter stuck in a browser tab, the app is likely using `openExternal` incorrectly. Make sure you're on the latest version of the code — the auth flow should open a modal window inside Electron.

### Token exchange fails with `400 Bad Request`

This can happen if React's StrictMode double-fires the callback effect, consuming the authorization code twice. The app includes a guard against this. If you still hit it, clear localStorage and try again.
