import { useEffect, useState } from 'react'
import { fetchPlaylists } from '../api/spotify'

function PlaylistCard({ playlist, onClick }) {
  const disabled = playlist.tracks.total < 2
  const img = playlist.images?.[0]?.url

  return (
    <button
      onClick={() => !disabled && onClick(playlist)}
      disabled={disabled}
      title={disabled ? 'Playlist precisa de ao menos 2 músicas' : playlist.name}
      className="flex items-center gap-3 w-full text-left rounded-xl px-3.5 py-2.5 transition-all duration-150"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'var(--surface-hover)')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.background = 'var(--surface-2)')}
    >
      {img
        ? <img src={img} alt="" className="rounded-lg object-cover flex-shrink-0" width={44} height={44} />
        : <div className="flex-shrink-0 flex items-center justify-center rounded-lg text-xl"
            style={{ width: 44, height: 44, background: 'var(--surface-hover)' }}>🎶</div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{playlist.name}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{playlist.tracks.total} músicas</p>
      </div>
      {!disabled && <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>›</span>}
    </button>
  )
}

export default function PlaylistList({ token, user, onSelect, onBack }) {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')

  useEffect(() => {
    fetchPlaylists(token)
      .then(data => setPlaylists(data.items ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = playlists.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="flex flex-col min-h-screen px-5 pt-8 pb-10 max-w-lg mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-sm transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          ← Voltar
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Suas Playlists
          </h2>
          {user && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {user.display_name}
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      {playlists.length > 6 && (
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar playlist..."
          className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-4 outline-none"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
        />
      )}

      {/* List */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="animate-spin-loader w-6 h-6 rounded-full border-2 border-white/10 border-t-white/60" />
        </div>
      )}
      {error && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--semantic-error)' }}>{error}</p>
      )}
      {!loading && !error && (
        <div className="flex flex-col gap-1.5">
          {filtered.length === 0
            ? <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma playlist encontrada.</p>
            : filtered.map(p => (
                <PlaylistCard key={p.id} playlist={p} onClick={onSelect} />
              ))
          }
        </div>
      )}
    </main>
  )
}
