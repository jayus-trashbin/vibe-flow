import { PRESETS } from '../utils/algorithm'
import { StarSmall, Zigzag } from './Decorations'

const FEATURE_META = {
  energy:           { label: 'Energy',          color: '#F59E0B' },
  valence:          { label: 'Mood',            color: '#10B981' },
  danceability:     { label: 'Danceability',    color: '#EC4899' },
  tempo:            { label: 'Tempo',           color: '#8B5CF6' },
  acousticness:     { label: 'Acousticness',    color: '#06B6D4' },
  instrumentalness: { label: 'Instrumental',    color: '#F97316' },
}

const START_MODES = [
  { key: 'calm',      label: 'Calm First',    desc: 'Start gentle' },
  { key: 'first',     label: 'Original',      desc: 'Keep track 1' },
  { key: 'energetic', label: 'High Energy',   desc: 'Start loud' },
]

function FeatureSlider({ featureKey, value, onChange }) {
  const meta = FEATURE_META[featureKey]
  return (
    <div
      className="fade-in"
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
    >
      {/* Label */}
      <div style={{ width: 90, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <div style={{ width: 2, height: 10, background: meta.color, borderRadius: 1 }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: meta.color }}>{meta.label}</span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0" max="1" step="0.1"
        value={value}
        onChange={e => onChange(featureKey, parseFloat(e.target.value))}
        aria-label={`Weight for ${meta.label}`}
        style={{ flex: 1, accentColor: meta.color }}
      />

      {/* Value */}
      <span
        style={{ width: 28, textAlign: 'right', fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}
      >
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export default function WeightsPanel({ weights, onChange, startMode, onStartModeChange, playlist, onAnalyze }) {
  function applyPreset(key) {
    Object.entries(PRESETS[key].weights).forEach(([k, v]) => onChange(k, v))
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 55%, #110A1F 100%)' }}
    >
      <div className="max-w-2xl mx-auto px-5 py-10 fade-in">
        {/* Decorations */}
        <StarSmall color="#F59E0B" size={10} className="absolute top-8 right-10 pulse-glow-anim" />
        <Zigzag color="#8B5CF6" width={100} opacity={0.2} className="absolute bottom-24 right-4" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {playlist.images?.[0]?.url && (
              <img
                src={playlist.images[0].url} alt=""
                style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
              />
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }} className="truncate">
              {playlist.name}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 'auto', flexShrink: 0 }}>
              {playlist.tracks?.total} tracks
            </span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Configure your <span className="text-gradient">flow</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
            Tune how much each audio feature influences the sort order.
          </p>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

          {/* ── Left: Feature sliders ─────────────────── */}
          <div>
            {/* Presets */}
            <div style={{ marginBottom: 12 }}>
              <div className="section-label mb-2">Quick Presets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key)}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders card */}
            <div className="card" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
              <div className="section-label">Feature Weights</div>
              {Object.keys(FEATURE_META).map((key, i) => (
                <div key={key} style={{ animationDelay: `${i * 40}ms` }}>
                  <FeatureSlider
                    featureKey={key}
                    value={weights[key]}
                    onChange={onChange}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Start mode + CTA ───────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Start mode */}
            <div className="card">
              <div className="section-label mb-3">Starting Track</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {START_MODES.map(({ key, label, desc }) => {
                  const active = startMode === key
                  return (
                    <button
                      key={key}
                      onClick={() => onStartModeChange(key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        background: active ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 150ms',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ width: 2, height: 14, background: active ? '#F59E0B' : 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: active ? '#F59E0B' : '#fff' }}>{label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{desc}</div>
                      </div>
                      {active && (
                        <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg viewBox="0 0 24 24" fill="black" style={{ width: 10, height: 10 }}>
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Visual hint: feature color legend */}
            <div className="card" style={{ padding: 12 }}>
              <div className="section-label mb-2">Feature Colors</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                {Object.entries(FEATURE_META).map(([key, meta]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 6px ${meta.color}`, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{meta.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              className="btn-primary w-full"
              onClick={onAnalyze}
              style={{ fontSize: 15, padding: '16px 24px' }}
            >
              Optimize Playlist →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
