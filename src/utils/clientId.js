/**
 * Client ID storage — no .env needed.
 * Users can paste their ID directly into the app.
 */

const KEY = 'vf_spotify_client_id'

export function getStoredClientId() {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function saveClientId(id) {
  try {
    localStorage.setItem(KEY, id.trim())
  } catch {
    console.warn('Could not save Client ID to localStorage')
  }
}

export function clearClientId() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

export function getClientId() {
  // Priority: stored > env var
  const stored = getStoredClientId()
  if (stored) return stored
  return import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
}
