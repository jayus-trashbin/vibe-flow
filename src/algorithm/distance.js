import { FEATURE_KEYS } from '../constants/features'

/**
 * Weighted Euclidean distance between two tracks.
 * d(a,b) = sqrt( sum_k w_k * (a[k] - b[k])^2 )
 */
export function weightedEuclidean(trackA, trackB, weights) {
  let sum = 0
  for (const key of FEATURE_KEYS) {
    const w = weights[key] ?? 0
    const diff = (trackA.features?.[key] ?? 0) - (trackB.features?.[key] ?? 0)
    sum += w * diff * diff
  }
  return Math.sqrt(sum)
}
