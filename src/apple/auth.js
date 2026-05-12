/**
 * Apple Music MusicKit JS authorization.
 *
 * The developer token (JWT) is generated in the main process
 * since it needs the .p8 private key. The user token is obtained
 * via MusicKit JS authorize() in the renderer.
 */

const DEVELOPER_TOKEN_KEY = 'apple_developer_token';
const USER_TOKEN_KEY = 'apple_user_token';

let musicKitInstance = null;

/**
 * Load the MusicKit JS SDK script.
 */
function loadMusicKitScript() {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="musickit"]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load MusicKit JS'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize MusicKit with a developer token from the main process.
 */
export async function initMusicKit() {
  if (musicKitInstance) return musicKitInstance;

  // Get developer token from main process
  const devToken = await window.cupid.getAppleMusicToken();
  if (!devToken) throw new Error('No Apple Music developer token');

  localStorage.setItem(DEVELOPER_TOKEN_KEY, devToken);

  await loadMusicKitScript();

  await window.MusicKit.configure({
    developerToken: devToken,
    app: {
      name: 'Cupid Player',
      build: '1.0.0',
    },
  });

  musicKitInstance = window.MusicKit.getInstance();
  return musicKitInstance;
}

/**
 * Authorize the user — opens Apple Music login.
 */
export async function login() {
  const mk = await initMusicKit();
  const userToken = await mk.authorize();
  localStorage.setItem(USER_TOKEN_KEY, userToken);
  return userToken;
}

/**
 * Log out — unauthorize and clear tokens.
 */
export async function logout() {
  if (musicKitInstance) {
    await musicKitInstance.unauthorize();
  }
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(DEVELOPER_TOKEN_KEY);
  musicKitInstance = null;
}

/**
 * Check if user is logged in.
 */
export function isLoggedIn() {
  return !!localStorage.getItem(USER_TOKEN_KEY);
}

/**
 * Get the MusicKit instance (must call initMusicKit first).
 */
export function getMusicKit() {
  return musicKitInstance;
}
