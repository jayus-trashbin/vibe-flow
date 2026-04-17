import { useState, useEffect } from 'react'
import TokenScreen  from './components/TokenScreen'
import PlaylistList from './components/PlaylistList'
import Organizer    from './components/Organizer'
import { handleOAuthCallback, getStoredToken } from './api/auth'
import { validateToken } from './api/spotify'

const SCREENS = { token: 'token', playlists: 'playlists', organizer: 'organizer' }

export default function App() {
  const [screen, setScreen]     = useState(SCREENS.token)
  const [token, setToken]       = useState('')
  const [user, setUser]         = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [authError, setAuthError] = useState(null)
  const [booting, setBooting]   = useState(true)

  useEffect(() => {
    async function boot() {
      // 1. Check if returning from Spotify OAuth redirect
      const callback = await handleOAuthCallback()
      if (callback) {
        if (callback.error) {
          setAuthError(callback.error)
          setBooting(false)
          return
        }
        // Got a fresh token — validate + get user profile
        try {
          const profile = await validateToken(callback.token)
          setToken(callback.token)
          setUser(profile)
          setScreen(SCREENS.playlists)
        } catch {
          setAuthError('Autenticação bem-sucedida, mas falha ao carregar perfil. Tente novamente.')
        }
        setBooting(false)
        return
      }

      // 2. Resume an existing session
      const stored = getStoredToken()
      if (stored) {
        try {
          const profile = await validateToken(stored)
          setToken(stored)
          setUser(profile)
          setScreen(SCREENS.playlists)
        } catch {
          // Token expired — fall through to login screen
        }
      }

      setBooting(false)
    }
    boot()
  }, [])

  function handleSelectPlaylist(p) {
    setPlaylist(p)
    setScreen(SCREENS.organizer)
  }

  if (booting) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <span className="animate-spin-loader w-8 h-8 rounded-full border-2 border-white/20 border-t-white" />
      </main>
    )
  }

  return (
    <>
      {screen === SCREENS.token && (
        <TokenScreen authError={authError} />
      )}
      {screen === SCREENS.playlists && (
        <PlaylistList
          token={token}
          user={user}
          onSelect={handleSelectPlaylist}
          onBack={() => setScreen(SCREENS.token)}
        />
      )}
      {screen === SCREENS.organizer && playlist && (
        <Organizer
          token={token}
          user={user}
          playlist={playlist}
          onBack={() => setScreen(SCREENS.playlists)}
        />
      )}
    </>
  )
}
