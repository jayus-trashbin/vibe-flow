const FEATURE_KEYS = ['energy', 'valence', 'danceability', 'tempo', 'acousticness', 'instrumentalness']

export const DEFAULT_WEIGHTS = {
  energy: 1.0,
  valence: 0.8,
  danceability: 0.8,
  tempo: 0.6,
  acousticness: 0.6,
  instrumentalness: 0.4,
}

export const PRESETS = {
  balanced: {
    label: 'Balanced',
    weights: { energy: 1.0, valence: 0.8, danceability: 0.8, tempo: 0.6, acousticness: 0.6, instrumentalness: 0.4 },
  },
  dj: {
    label: 'DJ Mode',
    weights: { energy: 0.6, valence: 0.4, danceability: 1.0, tempo: 1.0, acousticness: 0.2, instrumentalness: 0.6 },
  },
  chill: {
    label: 'Chill Flow',
    weights: { energy: 0.8, valence: 1.0, danceability: 0.4, tempo: 0.4, acousticness: 1.0, instrumentalness: 0.6 },
  },
  workout: {
    label: 'Workout',
    weights: { energy: 1.0, valence: 0.6, danceability: 0.8, tempo: 1.0, acousticness: 0.2, instrumentalness: 0.2 },
  },
  roadtrip: {
    label: 'Road Trip',
    weights: { energy: 0.8, valence: 1.0, danceability: 0.6, tempo: 0.6, acousticness: 0.6, instrumentalness: 0.2 },
  },
}

/**
 * Weighted Euclidean distance between two feature vectors.
 */
function weightedDistance(a, b, weights) {
  let sum = 0
  for (const key of FEATURE_KEYS) {
    const diff = (a[key] ?? 0) - (b[key] ?? 0)
    const w = weights[key] ?? 1
    sum += w * w * diff * diff
  }
  return Math.sqrt(sum)
}

/**
 * Nearest Neighbor sort.
 * @param {Array} tracks - enriched tracks with .features
 * @param {Object} weights
 * @param {'calm'|'energetic'|'first'} startMode
 * @returns {Array} sorted tracks
 */
export function nearestNeighborSort(tracks, weights = DEFAULT_WEIGHTS, startMode = 'calm') {
  if (tracks.length <= 1) return [...tracks]

  const pool = [...tracks]

  // Choose starting track
  let startIndex = 0
  if (startMode === 'calm') {
    startIndex = pool.reduce((best, t, i) =>
      (t.features?.energy ?? 1) < (pool[best].features?.energy ?? 1) ? i : best, 0)
  } else if (startMode === 'energetic') {
    startIndex = pool.reduce((best, t, i) =>
      (t.features?.energy ?? 0) > (pool[best].features?.energy ?? 0) ? i : best, 0)
  }

  const sorted = []
  const visited = new Uint8Array(pool.length)

  visited[startIndex] = 1
  sorted.push(pool[startIndex])

  while (sorted.length < pool.length) {
    const current = sorted[sorted.length - 1]
    let minDist = Infinity
    let nearestIdx = -1

    for (let i = 0; i < pool.length; i++) {
      if (visited[i]) continue
      const dist = weightedDistance(current.features, pool[i].features, weights)
      if (dist < minDist) {
        minDist = dist
        nearestIdx = i
      }
    }

    visited[nearestIdx] = 1
    sorted.push(pool[nearestIdx])
  }

  return sorted
}

/**
 * Vibe Score: 0–100. Higher = smoother transitions.
 * Based on the average weighted distance between consecutive tracks, normalized.
 */
export function calcVibeScore(tracks, weights = DEFAULT_WEIGHTS) {
  if (tracks.length < 2) return 100

  let totalDist = 0
  for (let i = 0; i < tracks.length - 1; i++) {
    totalDist += weightedDistance(tracks[i].features, tracks[i + 1].features, weights)
  }

  const avgDist = totalDist / (tracks.length - 1)

  // Max possible weighted distance in 6D space (all features 0→1, each weighted)
  const maxDist = Math.sqrt(FEATURE_KEYS.reduce((s, k) => s + (weights[k] ?? 1) ** 2, 0))

  return Math.round(Math.max(0, Math.min(100, (1 - avgDist / maxDist) * 100)))
}

/**
 * Enrich tracks array by merging audio features into each track object.
 */
export function enrichTracks(tracks, featuresMap) {
  return tracks
    .filter(t => featuresMap[t.id])
    .map(t => ({ ...t, features: featuresMap[t.id] }))
}

/**
 * Returns a Set of track indices (0-based) where the transition to the
 * next track is a "vibe jump" — distance ≥ 1.5× the average.
 */
export function detectVibeJumps(tracks, weights = DEFAULT_WEIGHTS) {
  if (tracks.length < 2) return new Set()

  const distances = []
  for (let i = 0; i < tracks.length - 1; i++) {
    distances.push(weightedDistance(tracks[i].features, tracks[i + 1].features, weights))
  }

  const avg = distances.reduce((a, b) => a + b, 0) / distances.length
  const threshold = avg * 1.5

  return new Set(distances.reduce((acc, d, i) => {
    if (d > threshold) acc.push(i)
    return acc
  }, []))
}
