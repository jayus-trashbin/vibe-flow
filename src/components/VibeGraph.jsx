import { useMemo } from 'react'

const GRAPH_FEATURES = [
  { key: 'energy',       color: '#F59E0B', label: 'Energy' },
  { key: 'valence',      color: '#10B981', label: 'Valence' },
  { key: 'danceability', color: '#EC4899', label: 'Dance' },
]

const W = 600, H = 80, PAD = 8

function buildPolyline(tracks, featureKey) {
  if (!tracks.length) return ''
  const points = tracks.map((t, i) => {
    const x = PAD + (i / Math.max(tracks.length - 1, 1)) * (W - PAD * 2)
    const val = t.features?.[featureKey] ?? 0
    const y = H - PAD - val * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return points.join(' ')
}

export default function VibeGraph({ tracks, isOriginal, onToggle }) {
  const polylines = useMemo(() =>
    GRAPH_FEATURES.map(f => ({ ...f, points: buildPolyline(tracks, f.key) })),
    [tracks]
  )

  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-3">
          {GRAPH_FEATURES.map(f => (
            <span key={f.key} className="flex items-center gap-1 text-xs" style={{ color: f.color }}>
              <span className="inline-block rounded-sm" style={{ width: 16, height: 3, background: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
        <button onClick={onToggle}
          className="text-xs rounded px-2 py-1 transition-all"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-muted)',
          }}>
          {isOriginal ? '✨ Ver organizada' : '↩ Ver original'}
        </button>
      </div>

      {/* SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(v => {
          const y = PAD + (1 - v) * (H - PAD * 2)
          return <line key={v} x1={PAD} y1={y} x2={W - PAD} y2={y}
            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        })}

        {/* Polylines */}
        {polylines.map(f => (
          <polyline key={f.key}
            points={f.points}
            fill="none"
            stroke={f.color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.7}
            style={{
              strokeDasharray: 1000,
              strokeDashoffset: 0,
              transition: 'all 400ms ease',
            }}
          />
        ))}
      </svg>

      {/* Label */}
      <p className="text-xs mt-1 text-center" style={{ color: 'var(--text-faint)' }}>
        {isOriginal ? 'Ordem original' : 'Ordem organizada'} · {tracks.length} faixas
      </p>
    </div>
  )
}
