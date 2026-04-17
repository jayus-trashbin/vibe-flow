const BASE = 'https://api.spotify.com/v1'

// Custom error class to carry HTTP status
class SpotifyError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function apiFetch(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.error?.message || `Spotify API error ${res.status}`
    throw new SpotifyError(msg, res.status)
  }

  if (res.status === 204) return null
  return res.json()
}

export async function getMe(token) {
  return apiFetch(token, '/me')
}

// --- Playlists ---

export async function getAllPlaylists(token, onProgress) {
  const playlists = []
  let url = '/me/playlists?limit=50'

  while (url) {
    const data = await apiFetch(token, url)
    if (!data?.items) break

    playlists.push(...data.items.filter(Boolean))
    onProgress?.(playlists.length, data.total ?? playlists.length)

    url = data.next ? data.next.replace(BASE, '') : null
  }

  return playlists
}

// Fetch full playlist detail to get accurate track count
export async function getPlaylistDetail(token, playlistId) {
  return apiFetch(token, `/playlists/${playlistId}?fields=id,name,tracks(total),images`)
}

// --- Tracks ---

export async function getPlaylistTracks(token, playlistId, onProgress) {
  const tracks = []
  let url = `/playlists/${playlistId}/tracks?limit=100`

  try {
    while (url) {
      const data = await apiFetch(token, url)
      if (!data?.items) break

      const valid = data.items.filter(item => item?.track?.id && item.track.type === 'track')
      tracks.push(...valid.map(item => item.track))
      onProgress?.(tracks.length, data.total ?? tracks.length)

      url = data.next ? data.next.replace(BASE, '') : null
    }
  } catch (err) {
    if (err.status === 403) {
      const e = new Error('Unable to load playlist tracks. You may not have access to this playlist, or Spotify permissions may need updating. Try a different playlist or re-login.')
      e.status = 403
      e.isScopeError = true
      throw e
    }
    throw err
  }

  return tracks
}

// --- Audio Features ---
// NOTE: Spotify deprecated this endpoint for new apps (post Nov 2023).
// Returns null if the app doesn't have Extended Access — caller should fall back.

export async function getAudioFeatures(token, trackIds, onProgress) {
  const features = {}
  const chunkSize = 100

  for (let i = 0; i < trackIds.length; i += chunkSize) {
    const chunk = trackIds.slice(i, i + chunkSize)

    let data
    try {
      data = await apiFetch(token, `/audio-features?ids=${chunk.join(',')}`)
    } catch (err) {
      if (err.status === 403) {
        // Audio features deprecated for this app — signal caller to use fallback
        return null
      }
      throw err
    }

    const audioFeatures = data?.audio_features ?? []
    for (const f of audioFeatures) {
      if (f?.id) {
        features[f.id] = {
          energy:           f.energy           ?? 0.5,
          valence:          f.valence           ?? 0.5,
          danceability:     f.danceability      ?? 0.5,
          tempo:            Math.min(1, Math.max(0, ((f.tempo ?? 120) - 50) / 150)),
          acousticness:     f.acousticness      ?? 0.5,
          instrumentalness: f.instrumentalness  ?? 0,
        }
      }
    }

    onProgress?.(Math.min(i + chunkSize, trackIds.length), trackIds.length)
  }

  return features
}

// Build synthetic features from track popularity when audio-features are unavailable
export function buildFallbackFeatures(tracks) {
  const features = {}
  for (const t of tracks) {
    const p = (t.popularity ?? 50) / 100
    // Map popularity to a plausible feature space:
    // high popularity ≈ more danceable/energetic; low ≈ more acoustic/mellow
    features[t.id] = {
      energy:           p,
      valence:          p * 0.8 + 0.1,
      danceability:     p * 0.9 + 0.05,
      tempo:            p * 0.6 + 0.2,
      acousticness:     1 - p * 0.7,
      instrumentalness: Math.max(0, 0.3 - p * 0.3),
    }
  }
  return features
}

// --- Create & Populate Playlist ---

export async function createPlaylist(token, userId, name, description) {
  return apiFetch(token, `/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name, description, public: false }),
  })
}

export async function addTracksToPlaylist(token, playlistId, trackUris, onProgress) {
  const chunkSize = 100

  for (let i = 0; i < trackUris.length; i += chunkSize) {
    const chunk = trackUris.slice(i, i + chunkSize)
    await apiFetch(token, `/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: chunk }),
    })
    onProgress?.(Math.min(i + chunkSize, trackUris.length), trackUris.length)
  }
}
