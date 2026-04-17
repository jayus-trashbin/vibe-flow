const SCORE_FEATURES = ['energy', 'valence', 'danceability', 'tempo_norm', 'acousticness']

/**
 * Vibe Score: 0–100 measuring smoothness of consecutive track transitions.
 * Returns { score, avgDist, jumps }
 */
export function computeVibeScore(tracks) {
  if (!tracks || tracks.length < 2) return { score: 100, avgDist: 0, jumps: [] }

  let totalDist = 0
  const jumps = []

  for (let i = 1; i < tracks.length; i++) {
    const a = tracks[i - 1].features
    const b = tracks[i].features
    if (!a || !b) continue

    let dist = 0
    for (const f of SCORE_FEATURES) {
      const diff = (a[f] ?? 0) - (b[f] ?? 0)
      dist += diff * diff
    }
    dist = Math.sqrt(dist)
    totalDist += dist

    if (dist > 0.5) {
      jumps.push({ index: i, dist })
    }
  }

  const avgDist = totalDist / (tracks.length - 1)
  const score = Math.max(0, Math.round((1 - avgDist) * 100))

  return { score, avgDist, jumps }
}

export function scoreLabel(score) {
  if (score >= 90) return { text: 'Perfeito',  color: '#10B981' }
  if (score >= 75) return { text: 'Ótimo',     color: '#10B981' }
  if (score >= 60) return { text: 'Bom',       color: '#F59E0B' }
  if (score >= 40) return { text: 'Regular',   color: '#F97316' }
  return               { text: 'Caótico',  color: '#EF4444' }
}
