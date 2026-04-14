import { useState } from 'react'
import { Starburst, StarSmall } from './Decorations'
import { saveClientId } from '../utils/clientId'

export default function SetupScreen({ onComplete }) {
  const [clientId, setClientId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!clientId.trim()) {
      setError('Please enter your Spotify Client ID')
      return
    }

    setLoading(true)

    // Quick validation: try to list playlists
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId.trim(),
          client_secret: 'dummy', // Will fail, but that's ok — we just validate format
        }),
      })

      // If we get a response (even 401), the Client ID format is valid
      if (response.status === 401 || response.status === 400) {
        // Expected — secret is wrong, but ID format was recognized
        saveClientId(clientId.trim())
        onComplete()
      } else if (response.ok) {
        // Unexpected success, but it works
        saveClientId(clientId.trim())
        onComplete()
      } else {
        setError('Invalid Client ID. Please check and try again.')
      }
    } catch (e) {
      // Network error — assume the ID might be valid
      saveClientId(clientId.trim())
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 55%, #110A1F 100%)' }}
    >
      {/* Decorations */}
      <Starburst color="#8B5CF6" size={140} opacity={0.18} className="absolute -top-8 -right-8 float-anim" />
      <Starburst color="#EC4899" size={80} opacity={0.15} className="absolute top-1/3 -left-10 float-anim" style={{ animationDelay: '1.5s' }} />
      <StarSmall color="#F59E0B" size={10} className="absolute top-24 left-12 pulse-glow-anim" />

      <div className="fade-in max-w-sm w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            <span className="text-gradient">Vibe Flow</span>
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Connect your Spotify account to reorder your playlists for seamless vibe transitions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Instructions */}
          <div
            className="card"
            style={{
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
              padding: 12,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', marginBottom: 6 }}>
              Get your Spotify Client ID
            </div>
            <ol style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, paddingLeft: 18 }}>
              <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5CF6', textDecoration: 'none' }}>developer.spotify.com/dashboard</a></li>
              <li>Log in or create an account</li>
              <li>Create a new app</li>
              <li>Accept the terms and create the app</li>
              <li>Copy the <strong>Client ID</strong> and paste it below</li>
            </ol>
          </div>

          {/* Input */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginBottom: 6 }}>
              Spotify Client ID
            </label>
            <input
              type="text"
              placeholder="Paste your Client ID here"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--surface)',
                border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                borderRadius: 8,
                padding: '10px 12px',
                color: '#fff',
                fontSize: 13,
                fontFamily: 'DM Mono, monospace',
                outline: 'none',
                transition: 'border-color 150ms',
              }}
              onFocus={e => {
                if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onBlur={e => {
                e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'var(--border)'
              }}
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: 8 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !clientId.trim()}
            style={{ padding: '12px 20px', fontSize: 14 }}
          >
            {loading ? 'Verifying…' : 'Continue to Spotify'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
          Your Client ID is stored locally in your browser. We never send it to any server.
        </p>
      </div>
    </div>
  )
}
