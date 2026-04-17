export const FEATURES = [
  { key: 'energy',           label: 'Energy',        emoji: '⚡', color: '#F59E0B', defaultWeight: 1.5 },
  { key: 'valence',          label: 'Valence',        emoji: '😊', color: '#10B981', defaultWeight: 1.2 },
  { key: 'danceability',     label: 'Dance',          emoji: '💃', color: '#EC4899', defaultWeight: 1.0 },
  { key: 'tempo_norm',       label: 'Tempo',          emoji: '🥁', color: '#8B5CF6', defaultWeight: 0.8 },
  { key: 'acousticness',     label: 'Acoustic',       emoji: '🎸', color: '#06B6D4', defaultWeight: 0.6 },
  { key: 'instrumentalness', label: 'Instrumental',   emoji: '🎹', color: '#F97316', defaultWeight: 0.4 },
]

export const DEFAULT_WEIGHTS = Object.fromEntries(
  FEATURES.map(f => [f.key, f.defaultWeight])
)

export const FEATURE_KEYS = FEATURES.map(f => f.key)
