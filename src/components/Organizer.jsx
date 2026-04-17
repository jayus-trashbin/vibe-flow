import { useState, useEffect, useCallback } from 'react'
import {
  fetchAllTracks, fetchAudioFeatures, mergeTracksWithFeatures,
  createPlaylist, addTracksToPlaylist,
} from '../api/spotify'
import { nearestNeighborSort } from '../algorithm/nearestNeighbor'
import { computeVibeScore } from '../algorithm/vibeScore'
import { DEFAULT_WEIGHTS } from '../constants/features'
import WeightPanel from './WeightPanel'
import TrackRow from './TrackRow'
import VibeGraph from './VibeGraph'
import VibeScoreCard from './VibeScoreCard'

const SAVE_STATES = { idle: 'idle', saving: 'saving', saved: 'saved', error: 'error' }

export default function Organizer({ token, user, playlist, onBack }) {
  const [loadState, setLoadState]       = useState({ phase: 'tracks', loaded: 0, total: 0 })
  const [originalTracks, setOriginal]   = useState([])
  const [sortedTracks, setSorted]       = useState([])
  const [excluded, setExcluded]         = useState(0)
  const [weights, setWeights]           = useState({ ...DEFAULT_WEIGHTS })
  const [startMode, setStartMode]       = useState('calm')
  const [showOriginal, setShowOriginal] = useState(false)
  const [scores, setScores]             = useState({ before: 0, after: 0 })
  const [jumps, setJumps]               = useState([])
  const [saveState, setSaveState]       = useState(SAVE_STATES.idle)
  const [saveError, setSaveError]       = useState('')
  const [ready, setReady]               = useState(false)

  // Load tracks + features on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoadState({ phase: 'tracks', loaded: 0, total: playlist.tracks.total })
        const rawTracks = await fetchAllTracks(token, playlist.id, ({ loaded, total }) => {
          if (!cancelled) setLoadState({ phase: 'tracks', loaded, total })
        })

        if (cancelled) return
        setLoadState({ phase: 'features', loaded: 0, total: rawTracks.length })

        const featMap = await fetchAudioFeatures(
          token,
          rawTracks.map(t => t.id),
          ({ loaded, total }) => {
            if (!cancelled) setLoadState({ phase: 'features', loaded, total })
          }
        )

        if (cancelled) return
        const { withFeatures, excluded: exc } = mergeTracksWithFeatures(rawTracks, featMap)
        setExcluded(exc.length)
        setOriginal(withFeatures)

        const sorted = nearestNeighborSort(withFeatures, DEFAULT_WEIGHTS, 'calm')
        setSorted(sorted)

        const scoreBefore = computeVibeScore(withFeatures)
        const scoreAfter  = computeVibeScore(sorted)
        setScores({ before: scoreBefore.score, after: scoreAfter.score })
        setJumps(scoreAfter.jumps)
        setReady(true)
      } catch (err) {
        if (!cancelled) setLoadState({ phase: 'error', message: err.message, status: err.status })
      }
    }
    load()
    return () => { cancelled = true }
  }, [token, playlist])

  // Re-sort when weights or startMode change
  const resort = useCallback(() => {
    if (!originalTracks.length) return
    const allZero = Object.values(weights).every(v => v === 0)
    if (allZero) return

    const sorted = nearestNeighborSort(originalTracks, weights, startMode)
    setSorted(sorted)

    const scoreAfter = computeVibeScore(sorted)
    setScores(s => ({ ...s, after: scoreAfter.score }))
    setJumps(scoreAfter.jumps)
    setSaveState(SAVE_STATES.idle)
  }, [originalTracks, weights, startMode])

  // Save playlist
  async function handleSave() {
    setSaveState(SAVE_STATES.saving)
    setSaveError('')
    try {
      const pl = await createPlaylist(
        token, user.id,
        `${playlist.name} (Vibe Sorted)`,
        `Reorganizada por vibe flow — score ${scores.after}/100`
      )
      await addTracksToPlaylist(token, pl.id, sortedTracks.map(t => t.uri))
      setSaveState(SAVE_STATES.saved)
    } catch (err) {
      setSaveError(err.message || 'Erro ao salvar.')
      setSaveState(SAVE_STATES.error)
    }
  }

  const displayTracks = showOriginal ? originalTracks : sortedTracks
  const jumpSet = new Set(jumps.map(j => j.index))

  // Loading screen
  if (!ready) {
    const isError = loadState.phase === 'error'
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-5 gap-4">
        {isError
          ? <>
              <p className="text-sm" style={{ color: 'var(--semantic-error)' }}>{loadState.message}</p>
              <button onClick={onBack} className="text-xs" style={{ color: 'var(--text-muted)' }}>← Voltar</button>
            </>
          : <>
              <span className="animate-spin-loader w-8 h-8 rounded-full border-2 border-white/10 border-t-white/50" />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {loadState.phase === 'tracks'
                  ? `Carregando músicas... ${loadState.loaded}/${loadState.total}`
                  : `Analisando audio features... ${loadState.loaded}/${loadState.total}`
                }
              </p>
            </>
        }
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen pb-10 animate-fade-up">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
        <button onClick={onBack} className="text-sm flex-shrink-0 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          ←
        </button>
        {playlist.images?.[0]?.url && (
          <img src={playlist.images[0].url} alt="" className="rounded object-cover flex-shrink-0" width={32} height={32} />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{playlist.name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {sortedTracks.length} músicas
            {excluded > 0 && ` · ${excluded} excluídas (sem dados)`}
          </p>
        </div>

        {/* Save button */}
        <SaveButton state={saveState} onSave={handleSave} />
      </div>

      <div className="flex flex-col gap-4 px-4 pt-4">
        {/* Scores + Graph */}
        <VibeScoreCard scoreBefore={scores.before} scoreAfter={scores.after} />
        <VibeGraph tracks={displayTracks} isOriginal={showOriginal} onToggle={() => setShowOriginal(v => !v)} />

        {saveState === SAVE_STATES.error && (
          <p className="text-xs text-center" style={{ color: 'var(--semantic-error)' }}>{saveError}</p>
        )}

        {/* Controls */}
        <WeightPanel
          weights={weights}
          onChange={(key, val) => setWeights(w => ({ ...w, [key]: val }))}
          startMode={startMode}
          onStartMode={setStartMode}
        />

        {/* Re-sort button */}
        <button onClick={resort}
          disabled={Object.values(weights).every(v => v === 0)}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: '#000',
            opacity: Object.values(weights).every(v => v === 0) ? 0.4 : 1,
            cursor: Object.values(weights).every(v => v === 0) ? 'not-allowed' : 'pointer',
          }}>
          🔀 Reorganizar
        </button>

        {/* Track list */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between px-3 py-2"
            style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '1px' }}>
              {showOriginal ? 'Original' : 'Organizada'}
            </p>
            {jumps.length > 0 && !showOriginal && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}>
                {jumps.length} saltos
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 p-1.5 max-h-[480px] overflow-y-auto">
            {displayTracks.map((t, i) => (
              <TrackRow key={t.id + i} track={t} index={i} isJump={!showOriginal && jumpSet.has(i)} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

function SaveButton({ state, onSave }) {
  const styles = {
    idle:   { bg: 'var(--surface-hover)', border: 'var(--border-medium)', text: 'var(--text-secondary)', label: '💾 Salvar' },
    saving: { bg: 'var(--surface-hover)', border: 'var(--border-medium)', text: 'var(--text-muted)',     label: 'Salvando...' },
    saved:  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10B981',              label: '✓ Salva!' },
    error:  { bg: 'var(--surface-hover)', border: '#EF4444',              text: '#EF4444',              label: 'Tentar novamente' },
  }
  const s = styles[state]

  return (
    <button
      onClick={state === 'idle' || state === 'error' ? onSave : undefined}
      disabled={state === 'saving' || state === 'saved'}
      className="text-xs rounded-lg px-3 py-2 transition-all flex-shrink-0"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        cursor: state === 'saving' || state === 'saved' ? 'default' : 'pointer',
      }}>
      {state === 'saving'
        ? <span className="flex items-center gap-1.5">
            <span className="animate-spin-loader inline-block w-3 h-3 rounded-full border border-white/20 border-t-white/60" />
            {s.label}
          </span>
        : s.label
      }
    </button>
  )
}
