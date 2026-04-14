import { useState } from 'react'
import VibeChart from './VibeChart'
import { useCountUp } from '../hooks/useCountUp'
import { detectVibeJumps } from '../utils/algorithm'
import { Starburst, StarSmall } from './Decorations'

const FEATURE_BARS = [
  { key: 'energy',           color: '#F59E0B', label: 'Energy' },
  { key: 'valence',          color: '#10B981', label: 'Mood' },
  { key: 'danceability',     color: '#EC4899', label: 'Dance' },
  { key: 'tempo',            color: '#8B5CF6', label: 'Tempo' },
  { key: 'acousticness',     color: '#06B6D4', label: 'Acoustic' },
  { key: 'instrumentalness', color: '#F97316', label: 'Instr.' },
]

function FeatureMiniBar({ value, color, label }) {
  return (
    <div title={`${label}: ${(value * 100).toFixed(0)}%`} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div className="feature-bar" style={{ width: 20 }}>
        <div
          className="feature-bar-fill"
          style={{ width: `${value * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

function TrackRow({ index, track, isJump }) {
  const image = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url
  const artist = track.artists?.[0]?.name ?? 'Unknown'
  const durationMs = track.duration_ms ?? 0
  const mins = Math.floor(durationMs / 60000)
  const secs = String(Math.floor((durationMs % 60000) / 1000)).padStart(2, '0')

  return (
    <div
      className={isJump ? 'vibe-jump' : ''}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        borderRadius: isJump ? 0 : 0,
        transition: 'background 150ms',
      }}
    >
      {/* Index */}
      <span style={{ width: 24, textAlign: 'right', fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
        {index}
      </span>

      {/* Thumbnail */}
      <div style={{ width: 36, height: 36, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {image
          ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <div style={{ width: 3, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 0.5 }} />
              <div style={{ width: 3, height: 12, background: 'rgba(255,255,255,0.15)', borderRadius: 0.5 }} />
              <div style={{ width: 3, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 0.5 }} />
            </div>
        }
      </div>

      {/* Name + artist */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.name}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {artist}
        </div>
      </div>

      {/* Mini feature bars — hidden on very small screens */}
      <div
        className="hidden sm:flex"
        style={{ gap: 3, alignItems: 'center', flexShrink: 0, width: 138 }}
      >
        {FEATURE_BARS.map(fb => (
          <FeatureMiniBar
            key={fb.key}
            value={track.features?.[fb.key] ?? 0}
            color={fb.color}
            label={fb.label}
          />
        ))}
      </div>

      {/* Duration */}
      <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.3)', flexShrink: 0, width: 32, textAlign: 'right' }}>
        {mins}:{secs}
      </span>
    </div>
  )
}

function ScoreBlock({ score, label, color }) {
  const animated = useCountUp(score)
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontSize: 38, fontWeight: 700, fontFamily: 'DM Mono, monospace', color,
          textShadow: `0 0 24px ${color}66`,
          lineHeight: 1,
        }}
      >
        {animated}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: '0.04em' }}>
        {label}
      </div>
    </div>
  )
}

export default function ResultView({
  originalTracks, sortedTracks,
  originalScore, sortedScore,
  playlist, weights,
  usingFallback,
  onSave, onBack,
  saving, saveProgress, savedPlaylistUrl,
}) {
  const improvement = sortedScore - originalScore
  const vibeJumps = detectVibeJumps(sortedTracks, weights)

  const scoreColor = sortedScore >= 75 ? '#10B981' : sortedScore >= 50 ? '#F59E0B' : '#F97316'

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 55%, #110A1F 100%)' }}
    >
      {/* Decorations */}
      <Starburst color="#10B981" size={100} opacity={0.12} className="absolute top-0 right-0 pointer-events-none" />
      <StarSmall color="#F59E0B" size={9} className="absolute top-12 left-8 pulse-glow-anim" />
      <StarSmall color="#8B5CF6" size={7} className="absolute top-32 right-12 pulse-glow-anim" style={{ animationDelay: '1s' }} />

      <div className="max-w-2xl mx-auto px-5 py-8 fade-in">

        {/* Back */}
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back to settings
        </button>

        {/* Playlist name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          {playlist.images?.[0]?.url && (
            <img src={playlist.images[0].url} alt="" style={{ width: 28, height: 28, borderRadius: 4 }} />
          )}
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{playlist.name}</span>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: usingFallback ? 12 : 20 }}>
          Your optimized <span className="text-gradient">playlist</span>
        </h2>

        {/* Fallback warning */}
        {usingFallback && (
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{ width: 3, flexShrink: 0, alignSelf: 'stretch', background: '#F59E0B', borderRadius: 2 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', marginBottom: 2 }}>
                Sorted by popularity
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                Your Spotify app doesn't have access to audio features (deprecated for new apps).
                The sort used track popularity as a proxy.{' '}
                <a
                  href="https://developer.spotify.com/documentation/web-api/concepts/quota-modes"
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: '#F59E0B', textDecoration: 'underline' }}
                >
                  Apply for Extended Access
                </a>
                {' '}to unlock full audio analysis.
              </div>
            </div>
          </div>
        )}

        {/* ── Score card ────────────────────────────── */}
        <div
          className="card scale-in mb-4 relative overflow-hidden"
          style={{ padding: '20px 24px' }}
        >
          {/* Subtle gradient shine */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, rgba(16,185,129,0.05) 0%, transparent 60%)`, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'relative' }}>
            <ScoreBlock score={originalScore} label="Before" color="rgba(255,255,255,0.5)" />

            {/* Arrow + improvement */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: improvement > 0 ? '#10B981' : '#F97316' }}>
                {improvement > 0 ? '+' : ''}{improvement}
              </div>
              <div style={{ fontSize: 18 }}>→</div>
            </div>

            <ScoreBlock score={sortedScore} label="Vibe Score" color={scoreColor} />
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="section-label">Smoothness</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{sortedScore}/100</span>
            </div>
            <div className="feature-bar" style={{ height: 6 }}>
              <div
                className="feature-bar-fill"
                style={{
                  width: `${sortedScore}%`,
                  background: `linear-gradient(90deg, #F59E0B, ${scoreColor})`,
                  boxShadow: `0 0 8px ${scoreColor}66`,
                }}
              />
            </div>
          </div>

          {vibeJumps.size > 0 && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 3, height: 12, background: '#F59E0B', borderRadius: 2 }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                {vibeJumps.size} notable vibe {vibeJumps.size === 1 ? 'transition' : 'transitions'} highlighted below
              </span>
            </div>
          )}
        </div>

        {/* ── Vibe Chart ───────────────────────────── */}
        <div className="mb-4">
          <VibeChart originalTracks={originalTracks} sortedTracks={sortedTracks} />
        </div>

        {/* ── Track list ───────────────────────────── */}
        <div className="card mb-5" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="section-label">Optimized Order — {sortedTracks.length} tracks</span>
            <div className="hidden sm:flex" style={{ gap: 6, alignItems: 'center' }}>
              {FEATURE_BARS.map(fb => (
                <div key={fb.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: fb.color }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{fb.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {sortedTracks.map((t, i) => (
              <TrackRow
                key={t.id}
                index={i + 1}
                track={t}
                isJump={vibeJumps.has(i)}
              />
            ))}
          </div>
        </div>

        {/* ── Save button ──────────────────────────── */}
        {savedPlaylistUrl ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 12, padding: '14px 20px', marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: '#10B981', marginBottom: 4 }}>
                Playlist saved
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                "{playlist.name} (Vibe Sorted)" is now in your Spotify library.
              </p>
            </div>
            <a
              href={savedPlaylistUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ display: 'inline-block', textDecoration: 'none' }}
            >
              Open in Spotify ↗
            </a>
          </div>
        ) : (
          <button
            className="btn-primary w-full"
            onClick={onSave}
            disabled={saving}
            style={{ fontSize: 15, padding: '16px 24px', cursor: saving ? 'wait' : 'pointer' }}
          >
            {saving ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg className="spin-anim" style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
                Saving…{saveProgress > 0 ? ` (${saveProgress}%)` : ''}
              </span>
            ) : (
              'Save to Spotify'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
