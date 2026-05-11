/**
 * Spotify OAuth 2.0 PKCE Authorization Flow
 *
 * No backend needed — the entire flow runs in the browser.
 * Requires VITE_SPOTIFY_CLIENT_ID to be set in your .env file.
 */

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:5173/callback';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-modify-playback-state',
];

const TOKEN_KEY = 'spotify_token';
const TOKEN_EXPIRY_KEY = 'spotify_token_expiry';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const CODE_VERIFIER_KEY = 'spotify_code_verifier';

// ── PKCE helpers ──────────────────────────────────────────────

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => possible[v % possible.length]).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  const str = String.fromCharCode(...bytes);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

// ── Public API ────────────────────────────────────────────────

/**
 * Initiate the Spotify login flow.
 * Redirects the browser to Spotify's authorize endpoint.
 */
export async function login() {
  const verifier = generateRandomString(64);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

/**
 * Handle the OAuth callback — exchange the authorization code for tokens.
 * Call this when the page loads with a `?code=` query parameter.
 *
 * @returns {string} access token
 */
export async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const error = params.get('error');

  if (error) {
    throw new Error(`Spotify auth error: ${error}`);
  }

  if (!code) return null;

  const verifier = localStorage.getItem(CODE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error('Missing PKCE code verifier — did the login flow start from this browser?');
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const data = await res.json();
  storeTokens(data);
  localStorage.removeItem(CODE_VERIFIER_KEY);

  // Clean the URL so the code param doesn't linger
  window.history.replaceState({}, document.title, '/');

  return data.access_token;
}

/**
 * Refresh the access token using the stored refresh token.
 *
 * @returns {string|null} new access token, or null if no refresh token
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    // Refresh token expired or revoked — user must log in again
    clearTokens();
    return null;
  }

  const data = await res.json();
  storeTokens(data);
  return data.access_token;
}

/**
 * Get a valid access token, refreshing if necessary.
 *
 * @returns {string|null}
 */
export async function getAccessToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token) return null;

  // Refresh if the token expires in less than 5 minutes
  if (expiry && Date.now() > Number(expiry) - 5 * 60 * 1000) {
    return refreshAccessToken();
  }

  return token;
}

/**
 * Log out — clear all stored tokens.
 */
export function logout() {
  clearTokens();
}

/**
 * Check whether we have a stored token (may be expired).
 */
export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// ── Internal helpers ──────────────────────────────────────────

function storeTokens({ access_token, refresh_token, expires_in }) {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + expires_in * 1000));
  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
