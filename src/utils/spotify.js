const BASE = 'https://api.spotify.com/v1'

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
    throw new Error(err.error?.message || `Spotify API error ${res.status}`)
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
    playlists.push(...data.items)
    onProgress?.(playlists.length, data.total)

    if (data.next) {
      // Extract relative path from absolute next URL
      url = data.next.replace(BASE, '')
    } else {
      url = null
    }
  }

  return playlists
}

// --- Tracks ---

export async function getPlaylistTracks(token, playlistId, onProgress) {
  const tracks = []
  let url = `/playlists/${playlistId}/tracks?limit=100&fields=next,total,items(track(id,name,artists,album(images),duration_ms,preview_url))`

  while (url) {
    const data = await apiFetch(token, url)
    const valid = data.items.filter(item => item.track && item.track.id)
    tracks.push(...valid.map(item => item.track))
    onProgress?.(tracks.length, data.total)

    url = data.next ? data.next.replace(BASE, '') : null
  }

  return tracks
}

// --- Audio Features ---

export async function getAudioFeatures(token, trackIds, onProgress) {
  const features = {}
  const chunkSize = 100

  for (let i = 0; i < trackIds.length; i += chunkSize) {
    const chunk = trackIds.slice(i, i + chunkSize)
    const data = await apiFetch(token, `/audio-features?ids=${chunk.join(',')}`)

    for (const f of data.audio_features) {
      if (f) {
        features[f.id] = {
          energy: f.energy,
          valence: f.valence,
          danceability: f.danceability,
          // Normalize tempo from ~50-200 BPM to 0-1
          tempo: Math.min(1, Math.max(0, (f.tempo - 50) / 150)),
          acousticness: f.acousticness,
          instrumentalness: f.instrumentalness,
        }
      }
    }

    onProgress?.(Math.min(i + chunkSize, trackIds.length), trackIds.length)
  }

  return features
}

// --- Create & Populate Playlist ---

export async function createPlaylist(token, userId, name, description) {
  return apiFetch(token, `/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      public: false,
    }),
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
