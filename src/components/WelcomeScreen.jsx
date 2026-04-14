import { useState } from 'react'
import { initiateLogin } from '../utils/auth'
import { Starburst, StarSmall, Zigzag, Splash } from './Decorations'

const FEATURES = [
  { label: 'Energy Flow',       color: '#F59E0B', desc: 'Smooth energy arcs, no jarring spikes' },
  { label: 'Tunable Weights',   color: '#8B5CF6', desc: '6 audio features, fully configurable' },
  { label: 'Vibe Score',        color: '#10B981', desc: 'See the improvement before & after' },
  { label: '100% Client-Side',  color: '#06B6D4', desc: 'No server, no AI costs, no data stored' },
]

export default function WelcomeScreen() {
  const [error, setError] = useState('')

  async function handleLoginClick() {
    setError('')
    try {
      await initiateLogin()
    } catch (e) {
      setError(e.message || 'Failed to start login. Please check your Client ID configuration.')
    }
  }
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 55%, #110A1F 100%)' }}
    >
      {/* ── Decorative elements ─────────────────────── */}
      <Starburst
        color="#8B5CF6" size={140} opacity={0.18}
        className="absolute -top-8 -right-8 float-anim"
      />
      <Starburst
        color="#EC4899" size={80} opacity={0.15}
        className="absolute top-1/3 -left-10 float-anim"
        style={{ animationDelay: '1.5s' }}
      />
      <Splash
        color="#F59E0B" size={120} opacity={0.10}
        className="absolute bottom-16 -right-6"
      />
      <Zigzag
        color="#EC4899" width={160} opacity={0.25}
        className="absolute bottom-32 left-6"
      />

      {/* Scattered mini stars */}
      <StarSmall color="#F59E0B" size={10} className="absolute top-24 left-12 pulse-glow-anim" />
      <StarSmall color="#EC4899" size={8}  className="absolute top-40 right-16 pulse-glow-anim" style={{ animationDelay: '0.8s' }} />
      <StarSmall color="#10B981" size={7}  className="absolute bottom-48 right-10 pulse-glow-anim" style={{ animationDelay: '1.6s' }} />
      <StarSmall color="#8B5CF6" size={9}  className="absolute bottom-20 left-20 pulse-glow-anim" style={{ animationDelay: '2.4s' }} />

      {/* ── Logo ────────────────────────────────────── */}
      <div className="fade-in mb-8 flex flex-col items-center relative z-10">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #EC4899)',
            boxShadow: '0 0 32px rgba(245,158,11,0.4)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-9 h-9">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.779.779 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.779.779 0 01.519-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.533-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/>
          </svg>
        </div>

        <h1
          className="text-5xl font-bold tracking-tight mb-1"
          style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          <span className="text-gradient">Vibe</span>
          <span className="text-white"> Flow</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          Spotify Playlist Optimizer
        </p>
      </div>

      {/* ── Headline ─────────────────────────────────── */}
      <div className="fade-in text-center mb-10 max-w-sm relative z-10" style={{ animationDelay: '80ms' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 12 }}>
          Your playlist,{' '}
          <span className="text-gradient">perfectly ordered.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6 }}>
          Reorders your songs for seamless vibe transitions — using Spotify's own audio data. No AI, no cost.
        </p>
      </div>

      {/* ── Feature grid ─────────────────────────────── */}
      <div className="fade-in grid grid-cols-2 gap-2.5 max-w-sm w-full mb-10 relative z-10 stagger"
           style={{ animationDelay: '160ms' }}>
        {FEATURES.map(f => (
          <div
            key={f.label}
            className="card-hover fade-in"
            style={{ borderRadius: 10 }}
          >
            <div style={{ width: 3, height: 12, background: f.color, borderRadius: 2, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: f.color, marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Error banner ──────────────────────────── */}
      {error && (
        <div style={{ marginBottom: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 14px', maxWidth: 400 }} className="fade-in">
          <div style={{ fontSize: 12, color: '#EF4444' }}>{error}</div>
        </div>
      )}

      {/* ── CTA ──────────────────────────────────────── */}
      <div className="fade-in relative z-10 flex flex-col items-center" style={{ animationDelay: '280ms' }}>
        <button
          className="btn-primary"
          onClick={handleLoginClick}
          style={{ fontSize: 15, padding: '14px 40px' }}
        >
          Connect with Spotify
        </button>

        <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', maxWidth: 260 }}>
          Your original playlists are never modified. We only create new ones.
        </p>
      </div>
    </div>
  )
}
