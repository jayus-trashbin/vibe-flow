import { useState, useEffect, useCallback } from 'react'
import {
  handleCallback, loadTokens, saveTokens, clearTokens,
  isTokenExpired, refreshAccessToken,
} from './utils/auth'
import { getClientId } from './utils/clientId'
import {
  getMe, getAllPlaylists, getPlaylistTracks, getAudioFeatures,
  createPlaylist, addTracksToPlaylist,
} from './utils/spotify'
import {
  nearestNeighborSort, calcVibeScore, enrichTracks, DEFAULT_WEIGHTS,
} from './utils/algorithm'

import SetupScreen from './components/SetupScreen'
import WelcomeScreen from './components/WelcomeScreen'
import PlaylistSelector from './components/PlaylistSelector'
import WeightsPanel from './components/WeightsPanel'
import AnalyzingScreen from './components/AnalyzingScreen'
import ResultView from './components/ResultView'

// ---- Top-level steps ----
// welcome → playlists → weights → analyzing → results

export default function App() {
  // Client ID setup
  const [clientIdConfigured, setClientIdConfigured] = useState(!!getClientId())

  // Auth
  const [tokens, setTokens] = useState(null)
  const [user, setUser] = useState(null)

  // Navigation
  const [step, setStep] = useState('welcome')

  // Playlists
  const [playlists, setPlaylists] = useState([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  // Config
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS })
  const [startMode, setStartMode] = useState('calm')

  // Analysis
  const [analyzeStage, setAnalyzeStage] = useState('tracks')
  const [analyzeCurrent, setAnalyzeCurrent] = useState(0)
  const [analyzeTotal, setAnalyzeTotal] = useState(0)

  // Results
  const [originalTracks, setOriginalTracks] = useState([])
  const [sortedTracks, setSortedTracks] = useState([])
  const [originalScore, setOriginalScore] = useState(0)
  const [sortedScore, setSortedScore] = useState(0)

  // Save
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)
  const [savedUrl, setSavedUrl] = useState(null)

  // Error
  const [error, setError] = useState(null)

  // ---- Helper: get a valid token ----
  const getToken = useCallback(async (tok) => {
    if (!isTokenExpired(tok)) return tok.accessToken
    const refreshed = await refreshAccessToken(tok.refreshToken)
    saveTokens(refreshed)
    setTokens(refreshed)
    return refreshed.accessToken
  }, [])

  // ---- Handle OAuth callback ----
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const errorParam = params.get('error')

    if (errorParam) {
      setError(`Spotify denied access: ${errorParam}`)
      window.history.replaceState({}, '', '/')
      return
    }

    if (code && state) {
      window.history.replaceState({}, '', '/')
      handleCallback(code, state)
        .then(tok => {
          saveTokens(tok)
          setTokens(tok)
        })
        .catch(e => setError(e.message))
    } else {
      // Try restoring session
      const stored = loadTokens()
      if (stored) setTokens(stored)
    }
  }, [])

  // ---- When tokens arrive, load user + playlists ----
  useEffect(() => {
    if (!tokens) return

    let cancelled = false

    async function init() {
      try {
        const tok = await getToken(tokens)
        const me = await getMe(tok)
        if (cancelled) return
        setUser(me)
        setStep('playlists')
        setLoadingPlaylists(true)
        const pls = await getAllPlaylists(tok)
        if (cancelled) return
        setPlaylists(pls)
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoadingPlaylists(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [tokens, getToken])

  // ---- Select playlist → go to weights ----
  function handlePlaylistSelect(playlist) {
    setSelectedPlaylist(playlist)
    setSavedUrl(null)
    setStep('weights')
  }

  // ---- Weight change ----
  function handleWeightChange(key, value) {
    setWeights(prev => ({ ...prev, [key]: value }))
  }

  // ---- Run analysis ----
  async function handleAnalyze() {
    setStep('analyzing')
    setError(null)
    try {
      const tok = await getToken(tokens)

      // 1. Load tracks
      setAnalyzeStage('tracks')
      setAnalyzeCurrent(0)
      setAnalyzeTotal(selectedPlaylist.tracks.total)
      const raw = await getPlaylistTracks(tok, selectedPlaylist.id, (cur, tot) => {
        setAnalyzeCurrent(cur)
        setAnalyzeTotal(tot)
      })

      // 2. Fetch audio features
      setAnalyzeStage('features')
      setAnalyzeCurrent(0)
      setAnalyzeTotal(raw.length)
      const ids = raw.map(t => t.id)
      const featuresMap = await getAudioFeatures(tok, ids, (cur, tot) => {
        setAnalyzeCurrent(cur)
        setAnalyzeTotal(tot)
      })

      // 3. Enrich + sort
      setAnalyzeStage('sorting')
      setAnalyzeCurrent(0)
      setAnalyzeTotal(raw.length)
      const enriched = enrichTracks(raw, featuresMap)
      const sorted = nearestNeighborSort(enriched, weights, startMode)

      const oScore = calcVibeScore(enriched, weights)
      const sScore = calcVibeScore(sorted, weights)

      setOriginalTracks(enriched)
      setSortedTracks(sorted)
      setOriginalScore(oScore)
      setSortedScore(sScore)
      setStep('results')
    } catch (e) {
      setError(e.message)
      setStep('weights')
    }
  }

  // ---- Save playlist ----
  async function handleSave() {
    setSaving(true)
    setSaveProgress(0)
    try {
      const tok = await getToken(tokens)
      const newPlaylist = await createPlaylist(
        tok,
        user.id,
        `${selectedPlaylist.name} (Vibe Sorted)`,
        `Optimized by Vibe Flow — Vibe Score: ${sortedScore}/100`,
      )

      const uris = sortedTracks.map(t => `spotify:track:${t.id}`)
      await addTracksToPlaylist(tok, newPlaylist.id, uris, (cur, tot) => {
        setSaveProgress(Math.round((cur / tot) * 100))
      })

      setSavedUrl(newPlaylist.external_urls?.spotify ?? '')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ---- Logout ----
  function handleLogout() {
    clearTokens()
    setTokens(null)
    setUser(null)
    setPlaylists([])
    setSelectedPlaylist(null)
    setStep('welcome')
  }

  // ---- Render ----
  return (
    <div className="min-h-screen bg-spotify-black">
      {/* Persistent error banner */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900 border border-red-700
                        text-white text-sm rounded-lg px-4 py-3 shadow-xl max-w-sm w-full flex items-start gap-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">×</button>
        </div>
      )}

      {/* Logout button (when authenticated) */}
      {tokens && step !== 'welcome' && (
        <button
          onClick={handleLogout}
          className="fixed top-4 right-4 z-40 text-xs text-spotify-text hover:text-white
                     transition-colors bg-spotify-card rounded-full px-3 py-1.5"
        >
          Logout
        </button>
      )}

      {/* Screen router */}
      {!clientIdConfigured && (
        <SetupScreen onComplete={() => setClientIdConfigured(true)} />
      )}

      {clientIdConfigured && step === 'welcome' && (
        <WelcomeScreen />
      )}

      {clientIdConfigured && step === 'playlists' && (
        <PlaylistSelector
          playlists={playlists}
          loading={loadingPlaylists}
          onSelect={handlePlaylistSelect}
          user={user}
        />
      )}

      {clientIdConfigured && step === 'weights' && selectedPlaylist && (
        <WeightsPanel
          weights={weights}
          onChange={handleWeightChange}
          startMode={startMode}
          onStartModeChange={setStartMode}
          playlist={selectedPlaylist}
          onAnalyze={handleAnalyze}
          analyzing={false}
        />
      )}

      {clientIdConfigured && step === 'analyzing' && (
        <AnalyzingScreen
          stage={analyzeStage}
          current={analyzeCurrent}
          total={analyzeTotal}
        />
      )}

      {clientIdConfigured && step === 'results' && (
        <ResultView
          originalTracks={originalTracks}
          sortedTracks={sortedTracks}
          originalScore={originalScore}
          sortedScore={sortedScore}
          playlist={selectedPlaylist}
          weights={weights}
          onSave={handleSave}
          onBack={() => setStep('weights')}
          saving={saving}
          saveProgress={saveProgress}
          savedPlaylistUrl={savedUrl}
        />
      )}
    </div>
  )
}
