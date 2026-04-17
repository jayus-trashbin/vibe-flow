import { FEATURES } from '../constants/features'
import { PRESETS } from '../constants/presets'

function WeightSlider({ feature, value, onChange }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-base w-5 flex-shrink-0">{feature.emoji}</span>
      <span className="text-xs flex-shrink-0 w-20" style={{ color: 'var(--text-secondary)' }}>
        {feature.label}
      </span>
      <input
        type="range"
        min={0} max={3} step={0.1}
        value={value}
        onChange={e => onChange(feature.key, parseFloat(e.target.value))}
        aria-label={`Peso de ${feature.label}`}
        aria-valuenow={value} aria-valuemin={0} aria-valuemax={3}
        style={{ color: feature.color, flex: 1, accentColor: feature.color }}
      />
      <span className="font-mono text-xs w-7 text-right flex-shrink-0"
        style={{ color: feature.color }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export default function WeightPanel({ weights, onChange, startMode, onStartMode }) {
  const allZero = Object.values(weights).every(v => v === 0)

  function applyPreset(preset) {
    Object.entries(preset.weights).forEach(([k, v]) => onChange(k, v))
  }

  function resetDefaults() {
    FEATURES.forEach(f => onChange(f.key, f.defaultWeight))
  }

  return (
    <div className="rounded-xl p-4 flex flex-col gap-4"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>

      {/* Presets */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
          Presets
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => applyPreset(p)}
              className="text-xs rounded-md px-2.5 py-1 transition-all"
              style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {p.emoji} {p.label}
            </button>
          ))}
          <button onClick={resetDefaults}
            className="text-xs rounded-md px-2.5 py-1 transition-all"
            style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-faint)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
          Pesos das features
        </p>
        <div className="flex flex-col gap-2.5">
          {FEATURES.map(f => (
            <WeightSlider key={f.key} feature={f} value={weights[f.key]} onChange={onChange} />
          ))}
        </div>
        {allZero && (
          <p className="text-xs mt-2" style={{ color: 'var(--semantic-warning)' }}>
            ⚠️ Ajuste ao menos um peso para organizar
          </p>
        )}
      </div>

      {/* Start mode */}
      <div>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
          Início da sequência
        </p>
        <div className="flex gap-2">
          {[
            { id: 'calm',  label: 'Calmo',    emoji: '🌙' },
            { id: 'hype',  label: 'Agitado',  emoji: '🔥' },
            { id: 'first', label: 'Primeira', emoji: '📌' },
          ].map(m => (
            <button key={m.id} onClick={() => onStartMode(m.id)}
              className="flex-1 text-xs rounded-lg py-2 transition-all"
              style={{
                background: startMode === m.id ? 'rgba(139,92,246,0.2)' : 'var(--surface-hover)',
                border: `1px solid ${startMode === m.id ? 'rgba(139,92,246,0.5)' : 'var(--border-subtle)'}`,
                color: startMode === m.id ? '#8B5CF6' : 'var(--text-secondary)',
                fontWeight: startMode === m.id ? 600 : 400,
              }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
