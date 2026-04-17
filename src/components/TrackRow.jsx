import { FEATURES } from '../constants/features'
import { formatDuration } from '../api/spotify'

export default function TrackRow({ track, index, isJump }) {
  const f = track.features

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200"
      style={{
        background: isJump ? 'rgba(245,158,11,0.06)' : 'var(--surface-1)',
        borderLeft: `3px solid ${isJump ? '#F59E0B' : 'transparent'}`,
      }}
    >
      {/* Index */}
      <span className="font-mono text-xs w-6 text-right flex-shrink-0" style={{ color: 'var(--text-faint)' }}>
        {index + 1}
      </span>

      {/* Thumbnail */}
      {track.image
        ? <img src={track.image} alt="" className="rounded object-cover flex-shrink-0" width={36} height={36} />
        : <div className="flex-shrink-0 rounded flex items-center justify-center text-base"
            style={{ width: 36, height: 36, background: 'var(--surface-hover)' }}>♪</div>
      }

      {/* Name + Artist */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{track.name}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{track.artist}</p>
      </div>

      {/* Feature bars */}
      {f && (
        <div className="flex gap-0.5 flex-shrink-0" style={{ width: 120 }} aria-label="Feature bars">
          {FEATURES.map(feat => (
            <div key={feat.key} title={`${feat.label}: ${(f[feat.key] * 100).toFixed(0)}%`}
              className="flex-1 rounded-sm" style={{ height: 16, background: 'rgba(255,255,255,0.06)', position: 'relative' }}>
              <div className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-300"
                style={{
                  height: `${Math.round(f[feat.key] * 100)}%`,
                  background: feat.color,
                  opacity: 0.8,
                }} />
            </div>
          ))}
        </div>
      )}

      {/* Duration */}
      <span className="font-mono text-xs flex-shrink-0 w-9 text-right" style={{ color: 'var(--text-faint)' }}>
        {formatDuration(track.duration_ms)}
      </span>
    </div>
  )
}
