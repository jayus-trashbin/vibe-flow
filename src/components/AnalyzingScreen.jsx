import { Starburst, StarSmall, Zigzag } from './Decorations'

const STAGES = {
  tracks:   { label: 'Loading tracks',         color: '#F59E0B' },
  features: { label: 'Fetching audio features', color: '#8B5CF6' },
  sorting:  { label: 'Optimizing order',       color: '#10B981' },
}

const STAGE_ORDER = ['tracks', 'features', 'sorting']

export default function AnalyzingScreen({ stage, current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  const meta = STAGES[stage] ?? STAGES.tracks
  const stageIndex = STAGE_ORDER.indexOf(stage)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 55%, #110A1F 100%)' }}
    >
      {/* Decorations */}
      <Starburst color="#8B5CF6" size={120} opacity={0.12} className="absolute -top-4 -right-4 float-anim" />
      <Starburst color="#EC4899" size={70} opacity={0.10} className="absolute bottom-20 -left-8 float-anim" style={{ animationDelay: '2s' }} />
      <Zigzag color="#F59E0B" width={120} opacity={0.15} className="absolute top-1/4 left-4" />
      <StarSmall color="#10B981" size={9}  className="absolute top-20 right-16 pulse-glow-anim" />
      <StarSmall color="#F59E0B" size={7}  className="absolute bottom-32 left-12 pulse-glow-anim" style={{ animationDelay: '1.2s' }} />

      {/* Content */}
      <div className="fade-in flex flex-col items-center relative z-10" style={{ maxWidth: 320 }}>

        {/* Animated icon */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${meta.color}18`,
              border: `2px solid ${meta.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ width: 20, height: 20, background: meta.color, borderRadius: '50%' }} />
          </div>
          {/* Spinning ring */}
          <svg
            className="spin-anim"
            style={{ position: 'absolute', inset: -4, width: 80, height: 80 }}
            viewBox="0 0 80 80"
          >
            <circle
              cx="40" cy="40" r="36"
              fill="none"
              stroke={meta.color}
              strokeWidth="2"
              strokeDasharray="60 165"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Stage label */}
        <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>
          {meta.label}…
        </h2>

        {/* Count */}
        {total > 0 && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontFamily: 'DM Mono, monospace' }}>
            {current} <span style={{ color: 'rgba(255,255,255,0.2)' }}>/</span> {total}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ width: 240, marginBottom: 28 }}>
          <div className="feature-bar" style={{ height: 5, width: '100%' }}>
            <div
              className="feature-bar-fill"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${meta.color}aa, ${meta.color})`,
                boxShadow: `0 0 8px ${meta.color}55`,
              }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {STAGE_ORDER.map((s, i) => {
            const m = STAGES[s]
            const done = i < stageIndex
            const active = i === stageIndex
            return (
              <div key={s} style={{ display: 'flex', flex: 'col', alignItems: 'center', gap: 6, opacity: done || active ? 1 : 0.3 }}>
                <div
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: done ? m.color : active ? `${m.color}30` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? m.color : done ? m.color : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13,
                    transition: 'all 300ms',
                  }}
                >
                  {done
                    ? <svg viewBox="0 0 24 24" fill="black" style={{ width: 12, height: 12 }}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    : <div style={{ width: 6, height: 6, background: m.color, borderRadius: '50%' }} />
                  }
                </div>
                <span style={{ fontSize: 10, color: active ? '#fff' : 'rgba(255,255,255,0.4)', display: 'block', textAlign: 'center', maxWidth: 56 }}>
                  {m.label.split(' ')[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
