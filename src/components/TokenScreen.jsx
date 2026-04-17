import { useState } from 'react'
import { startOAuthFlow, getClientId, setClientId } from '../api/auth'

function Starburst({ className = '' }) {
  return (
    <svg viewBox="0 0 80 80" className={`absolute pointer-events-none ${className}`} aria-hidden="true">
      <path
        d="M40 5 L43 35 L70 20 L50 42 L75 50 L48 52 L55 78 L40 58 L25 78 L32 52 L5 50 L30 42 L10 20 L37 35 Z"
        fill="url(#sb1)" opacity="0.18"
      />
      <defs>
        <radialGradient id="sb1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function TokenScreen({ authError }) {
  const [clientId, setClientIdState] = useState(getClientId())
  const [showSetup, setShowSetup]    = useState(!getClientId())
  const [loading, setLoading]        = useState(false)

  async function handleLogin() {
    const id = clientId.trim()
    if (!id) return
    setClientId(id)
    setLoading(true)
    await startOAuthFlow(id)
    // page will redirect — loading stays true
  }

  return (
    <main className="relative flex flex-col items-center justify-start min-h-screen px-5 pt-16 pb-10 overflow-hidden">
      {/* Decorative */}
      <Starburst className="w-48 h-48 -top-12 -left-12 opacity-50" />
      <Starburst className="w-28 h-28 top-24 right-2 opacity-30 rotate-45" />
      <div
        className="absolute top-36 left-8 w-px h-28 opacity-10"
        style={{ background: 'repeating-linear-gradient(to bottom, #F59E0B 0, #F59E0B 4px, transparent 4px, transparent 8px)' }}
      />

      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8 animate-fade-up">
        <span className="text-5xl animate-pulse-glow select-none">🎵</span>
        <h1
          className="text-4xl font-bold tracking-tight select-none"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          VIBE FLOW
        </h1>
        <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Organize sua playlist por vibe — sem IA, só algoritmo
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm flex flex-col gap-3 animate-fade-up" style={{ animationDelay: '80ms' }}>

        {/* OAuth error */}
        {authError && (
          <div className="rounded-xl px-4 py-3 text-sm text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--semantic-error)' }}>
            {authError}
          </div>
        )}

        {/* Main card */}
        <div className="rounded-xl p-6 flex flex-col gap-4"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}>

          {/* Client ID setup */}
          {showSetup ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="clientid" className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
                  Client ID do seu app Spotify
                </label>
                <input
                  id="clientid"
                  type="text"
                  value={clientId}
                  onChange={e => setClientIdState(e.target.value)}
                  placeholder="Ex: 1a2b3c4d5e6f..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg px-3.5 py-3 text-sm font-mono outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    caretColor: '#F59E0B',
                  }}
                  onFocus={e => e.target.style.borderColor = '#F59E0B'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
                  onKeyDown={e => e.key === 'Enter' && clientId.trim() && handleLogin()}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !clientId.trim()}
                className="w-full rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: clientId.trim() && !loading
                    ? 'linear-gradient(135deg, #1DB954, #1aa34a)'
                    : 'rgba(29,185,84,0.3)',
                  color: clientId.trim() && !loading ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: clientId.trim() && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                {loading
                  ? <><span className="animate-spin-loader w-4 h-4 rounded-full border-2 border-white/30 border-t-white" /> Redirecionando...</>
                  : <><SpotifyIcon /> Entrar com Spotify</>
                }
              </button>
            </>
          ) : (
            <>
              {/* Fast login — client ID already saved */}
              <div className="flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.15)', color: 'var(--text-muted)' }}>
                <span>🔑</span>
                <span className="font-mono truncate flex-1">{clientId.slice(0, 8)}…{clientId.slice(-4)}</span>
                <button onClick={() => setShowSetup(true)}
                  className="flex-shrink-0 text-xs underline decoration-dotted transition-colors"
                  style={{ color: 'var(--text-faint)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-faint)'}>
                  trocar
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full rounded-lg py-3.5 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: loading ? 'rgba(29,185,84,0.3)' : 'linear-gradient(135deg, #1DB954, #1aa34a)',
                  color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(29,185,84,0.2)',
                }}
                onMouseEnter={e => !loading && (e.currentTarget.style.boxShadow = '0 0 30px rgba(29,185,84,0.35)')}
                onMouseLeave={e => !loading && (e.currentTarget.style.boxShadow = '0 0 20px rgba(29,185,84,0.2)')}
              >
                {loading
                  ? <><span className="animate-spin-loader w-4 h-4 rounded-full border-2 border-white/30 border-t-white" /> Redirecionando...</>
                  : <><SpotifyIcon /> Entrar com Spotify</>
                }
              </button>
            </>
          )}
        </div>

        {/* Setup instructions (collapsed when client ID is saved) */}
        {showSetup && (
          <div className="rounded-xl p-4 text-xs leading-relaxed animate-fade-up"
            style={{
              background: 'rgba(245,158,11,0.03)',
              border: '1px solid rgba(245,158,11,0.10)',
              color: 'var(--text-muted)',
              animationDelay: '160ms',
            }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--accent-amber)' }}>
              Setup rápido (só na primeira vez):
            </p>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>Acesse <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                  developer.spotify.com/dashboard
                </a>
              </li>
              <li>Crie um app com Redirect URI:
                <code className="ml-1 px-1.5 py-0.5 rounded text-xs break-all"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-secondary)' }}>
                  {window.location.origin + window.location.pathname}
                </code>
              </li>
              <li>Copie o <strong style={{ color: 'var(--text-secondary)' }}>Client ID</strong> e cole acima</li>
            </ol>
          </div>
        )}

        {/* Features pill strip */}
        <div className="flex gap-2 justify-center flex-wrap animate-fade-up" style={{ animationDelay: '200ms' }}>
          {['Zero backend', 'Sem coleta de dados', '100% no browser'].map(f => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', color: 'var(--text-faint)' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}

function SpotifyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  )
}
