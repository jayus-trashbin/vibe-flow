const BASE = 'https://api.spotify.com/v1'

async function request(token, path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || res.statusText
    const e = new Error(msg)
    e.status = res.status
    e.retryAfter = res.headers.get('Retry-After')
    throw e
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────
export async function validateToken(token) {
  return request(token, '/me')
}

// ── Playlists ─────────────────────────────────────────────────────
export async function fetchPlaylists(token, limit = 50, offset = 0) {
  return request(token, `/me/playlists?limit=${limit}&offset=${offset}`)
}

// ── Tracks ────────────────────────────────────────────────────────
export async function fetchAllTracks(token, playlistId, onProgress) {
  const fields = 'total,items(track(id,name,artists,album(name,images),duration_ms,uri))'
  let tracks = []
  let offset = 0
  let total = null

  do {
    const data = await request(
      token,
      `/playlists/${playlistId}/tracks?limit=100&offset=${offset}&fields=${fields}`
    )
    total = data.total
    const valid = data.items
      .map(i => i.track)
      .filter(t => t && t.id)
    tracks = tracks.concat(valid)
    offset += 100
    onProgress?.({ loaded: tracks.length, total })
  } while (tracks.length < total && offset < total)

  return tracks
}

// ── Audio Features ────────────────────────────────────────────────
export async function fetchAudioFeatures(token, trackIds, onProgress) {
  const results = {}
  const batches = []
  for (let i = 0; i < trackIds.length; i += 100) {
    batches.push(trackIds.slice(i, i + 100))
  }

  let processed = 0
  for (const batch of batches) {
    const data = await request(token, `/audio-features?ids=${batch.join(',')}`)
    for (const feat of data.audio_features) {
      if (feat) {
        results[feat.id] = {
          energy:           feat.energy,
          valence:          feat.valence,
          danceability:     feat.danceability,
          tempo_norm:       Math.min(feat.tempo / 200, 1.0),
          tempo_raw:        feat.tempo,
          acousticness:     feat.acousticness,
          instrumentalness: feat.instrumentalness,
          loudness_norm:    Math.min(Math.max((feat.loudness + 60) / 60, 0), 1),
          speechiness:      feat.speechiness,
        }
      }
    }
    processed += batch.length
    onProgress?.({ loaded: processed, total: trackIds.length })
  }

  return results
}

// ── Save ──────────────────────────────────────────────────────────
export async function createPlaylist(token, userId, name, description) {
  return request(token, `/users/${userId}/playlists`, {
    method: 'POST',
    body: JSON.stringify({ name, description, public: false }),
  })
}

export async function addTracksToPlaylist(token, playlistId, uris) {
  const batches = []
  for (let i = 0; i < uris.length; i += 100) {
    batches.push(uris.slice(i, i + 100))
  }
  for (const batch of batches) {
    await request(token, `/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ uris: batch }),
    })
  }
}

// ── Helpers ───────────────────────────────────────────────────────
export function mergeTracksWithFeatures(tracks, featuresMap) {
  const withFeatures = []
  const excluded = []

  for (const t of tracks) {
    const feat = featuresMap[t.id]
    if (!feat) { excluded.push(t); continue }
    withFeatures.push({
      id:          t.id,
      name:        t.name,
      artist:      t.artists?.map(a => a.name).join(', ') ?? '',
      album:       t.album?.name ?? '',
      image:       t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url ?? null,
      duration_ms: t.duration_ms,
      uri:         t.uri,
      features:    feat,
    })
  }

  return { withFeatures, excluded }
}

export function formatDuration(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}
