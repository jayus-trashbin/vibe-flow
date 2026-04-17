import { weightedEuclidean } from './distance'

/**
 * Nearest Neighbor greedy sort — O(n²).
 * startMode: 'calm' | 'hype' | 'first'
 */
export function nearestNeighborSort(tracks, weights, startMode = 'calm') {
  const n = tracks.length
  if (n <= 1) return [...tracks]

  // Determine starting track index
  let startIdx = 0
  if (startMode === 'calm') {
    let minE = Infinity
    tracks.forEach((t, i) => {
      const e = t.features?.energy ?? 0
      if (e < minE) { minE = e; startIdx = i }
    })
  } else if (startMode === 'hype') {
    let maxE = -Infinity
    tracks.forEach((t, i) => {
      const e = t.features?.energy ?? 0
      if (e > maxE) { maxE = e; startIdx = i }
    })
  }
  // 'first' keeps startIdx = 0

  const sorted = [tracks[startIdx]]
  const used = new Set([startIdx])

  while (sorted.length < n) {
    const current = sorted[sorted.length - 1]
    let nearestIdx = -1
    let nearestDist = Infinity

    for (let i = 0; i < n; i++) {
      if (used.has(i)) continue
      const d = weightedEuclidean(current, tracks[i], weights)
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    }

    if (nearestIdx === -1) break
    sorted.push(tracks[nearestIdx])
    used.add(nearestIdx)
  }

  return sorted
}
