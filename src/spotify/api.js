/**
 * Spotify Web API helpers
 *
 * Fetches playlist data and normalises track objects into a shape
 * compatible with the local playlist format:
 *   { title, artist, art, uri }
 */

import { getAccessToken } from './auth.js';

const API_BASE = 'https://api.spotify.com/v1';

/**
 * Parse a Spotify playlist URL or URI and return the playlist ID.
 *
 * Accepts:
 *   - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 *   - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
 *   - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
 *
 * @param {string} input
 * @returns {string|null} playlist ID or null if not recognised
 */
export function parsePlaylistUrl(input) {
  if (!input) return null;

  const trimmed = input.trim();

  // Spotify URI format
  const uriMatch = trimmed.match(/^spotify:playlist:([a-zA-Z0-9]+)$/);
  if (uriMatch) return uriMatch[1];

  // Web URL format
  try {
    const url = new URL(trimmed);
    if (url.hostname === 'open.spotify.com') {
      const parts = url.pathname.split('/');
      const idx = parts.indexOf('playlist');
      if (idx !== -1 && parts[idx + 1]) {
        return parts[idx + 1];
      }
    }
  } catch {
    // not a valid URL
  }

  return null;
}

/**
 * Fetch all tracks from a Spotify playlist (handles pagination).
 *
 * @param {string} playlistId
 * @returns {Promise<Array<{ title: string, artist: string, art: string, uri: string }>>}
 */
export async function fetchPlaylistTracks(playlistId) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Spotify');

  const res = await fetch(`${API_BASE}/playlists/${playlistId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const tracks = [];

  // The full playlist response nests tracks under `items` or `tracks`
  const container = data.tracks || data.items;
  const items = container?.items || [];

  for (const entry of items) {
    // Track data may be under `track` or `item` depending on API version
    const t = entry.track || entry.item;
    if (!t || !t.uri) continue;

    tracks.push({
      title: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      art: t.album?.images?.[0]?.url ?? null,
      uri: t.uri,
    });
  }

  return tracks;
}

/**
 * Fetch basic playlist metadata (name, image).
 *
 * @param {string} playlistId
 * @returns {Promise<{ name: string, image: string|null }>}
 */
export async function fetchPlaylistInfo(playlistId) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Spotify');

  const res = await fetch(
    `${API_BASE}/playlists/${playlistId}?fields=name,images`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    name: data.name,
    image: data.images?.[0]?.url ?? null,
  };
}
