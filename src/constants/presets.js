export const PRESETS = [
  {
    id: 'balanced',
    label: 'Balanced',
    emoji: '⚖️',
    weights: { energy: 1.0, valence: 1.0, danceability: 1.0, tempo_norm: 1.0, acousticness: 1.0, instrumentalness: 1.0 },
  },
  {
    id: 'dj',
    label: 'DJ Mode',
    emoji: '🎧',
    weights: { energy: 1.0, valence: 0.5, danceability: 2.5, tempo_norm: 2.0, acousticness: 0.3, instrumentalness: 0.2 },
  },
  {
    id: 'chill',
    label: 'Chill Flow',
    emoji: '🌊',
    weights: { energy: 1.5, valence: 2.0, danceability: 0.5, tempo_norm: 0.5, acousticness: 1.5, instrumentalness: 0.8 },
  },
  {
    id: 'energy_arc',
    label: 'Energy Arc',
    emoji: '🚀',
    weights: { energy: 3.0, valence: 1.0, danceability: 1.0, tempo_norm: 1.0, acousticness: 0.5, instrumentalness: 0.3 },
  },
  {
    id: 'study',
    label: 'Study Mode',
    emoji: '📚',
    weights: { energy: 0.8, valence: 0.5, danceability: 0.3, tempo_norm: 0.4, acousticness: 1.5, instrumentalness: 2.5 },
  },
  {
    id: 'road_trip',
    label: 'Road Trip',
    emoji: '🚗',
    weights: { energy: 1.2, valence: 1.5, danceability: 1.0, tempo_norm: 0.8, acousticness: 0.5, instrumentalness: 0.3 },
  },
]
