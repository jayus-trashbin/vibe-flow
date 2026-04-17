import { scoreLabel } from '../algorithm/vibeScore'

export default function VibeScoreCard({ scoreBefore, scoreAfter }) {
  const after = scoreLabel(scoreAfter)
  const improved = scoreAfter > scoreBefore

  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>

      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
        Vibe Score
      </p>

      <div className="flex items-center gap-3">
        {/* Before */}
        <div className="flex flex-col items-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Antes</span>
          <span className="text-3xl font-bold" style={{ color: 'var(--text-faint)', lineHeight: 1.1 }}>
            {scoreBefore}
          </span>
        </div>

        <span className="text-xl" style={{ color: 'var(--text-disabled)' }}>→</span>

        {/* After */}
        <div className="flex flex-col items-center">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Depois</span>
          <span className="text-3xl font-bold"
            style={{
              color: after.color,
              lineHeight: 1.1,
              filter: improved ? 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' : 'none',
            }}>
            {scoreAfter}
          </span>
        </div>

        {/* Label + improvement */}
        <div className="flex flex-col ml-1">
          <span className="text-sm font-semibold" style={{ color: after.color }}>{after.text}</span>
          {improved && (
            <span className="text-xs" style={{ color: 'var(--accent-green)' }}>
              +{scoreAfter - scoreBefore} pts ✨
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
