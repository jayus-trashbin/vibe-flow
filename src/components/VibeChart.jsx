import { useState, useId } from 'react'

const LINES = [
  { key: 'energy',       color: '#F59E0B', label: 'Energy' },
  { key: 'valence',      color: '#10B981', label: 'Mood' },
  { key: 'danceability', color: '#EC4899', label: 'Dance' },
]

function downsample(arr, max = 120) {
  if (arr.length <= max) return arr
  const step = arr.length / max
  return Array.from({ length: max }, (_, i) => arr[Math.round(i * step)])
}

export default function VibeChart({ originalTracks, sortedTracks }) {
  const [tab, setTab] = useState('sorted')
  const uid = useId()

  const tracks = tab === 'sorted' ? sortedTracks : originalTracks
  const data = downsample(tracks)
  const N = data.length

  // Build SVG polyline points string for each feature
  // viewBox: 0 0 N 100  — x=index, y=0-100 (0=top=high value, 100=bottom=low value)
  function points(key) {
    return data
      .map((t, i) => `${i},${((1 - (t.features?.[key] ?? 0)) * 92 + 4).toFixed(2)}`)
      .join(' ')
  }

  return (
    <div
      className="card fade-in"
      style={{ padding: '14px 16px' }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="section-label">Vibe Flow Chart</span>
          {LINES.map(l => (
            <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Toggle */}
        <div
          style={{
            display: 'flex', gap: 2,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20, padding: 2,
          }}
        >
          {[['sorted', 'Optimized'], ['original', 'Original']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 16,
                background: tab === key ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: tab === key ? '#fff' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer', transition: 'all 150ms',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      {N > 1 && (
        <svg
          key={tab}
          viewBox={`0 0 ${N - 1} 100`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: 80, display: 'block', overflow: 'visible' }}
          aria-label={`Vibe flow chart — ${tab} order`}
        >
          <defs>
            {LINES.map(l => (
              <linearGradient key={l.key} id={`${uid}-grad-${l.key}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={l.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={l.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {[25, 50, 75].map(y => (
            <line
              key={y}
              x1="0" y1={y} x2={N - 1} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Area fills (subtle) */}
          {LINES.map(l => {
            const pts = data
              .map((t, i) => `${i},${((1 - (t.features?.[l.key] ?? 0)) * 92 + 4).toFixed(2)}`)
            const closedPath = `M ${pts[0]} L ${pts.slice(1).join(' L ')} L ${N - 1},100 L 0,100 Z`
            return (
              <path
                key={l.key}
                d={closedPath}
                fill={`url(#${uid}-grad-${l.key})`}
              />
            )
          })}

          {/* Lines */}
          {LINES.map((l, li) => (
            <polyline
              key={l.key}
              points={points(l.key)}
              fill="none"
              stroke={l.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
              vectorEffect="non-scaling-stroke"
              className="chart-line"
              style={{ animationDelay: `${li * 120}ms` }}
            />
          ))}
        </svg>
      )}

      {/* X axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Track 1</span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Track {tracks.length}</span>
      </div>
    </div>
  )
}
