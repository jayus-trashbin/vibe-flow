import { useState } from 'react'
import { StarSmall } from './Decorations'

function PlaylistCard({ playlist, selected, onClick }) {
  const image = playlist.images?.[0]?.url
  const trackCount = playlist.tracks?.total ?? playlist.tracks_total ?? '—'

  return (
    <button
      onClick={onClick}
      className="fade-in w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
      style={{
        background: selected ? 'rgba(245,158,11,0.08)' : 'var(--surface)',
        border: `1px solid ${selected ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
        outline: 'none',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--surface-hover)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'var(--surface)' }}
    >
      {/* Thumbnail */}
      <div
        className="flex-shrink-0 overflow-hidden"
        style={{
          width: 44, height: 44, borderRadius: 6,
          background: 'rgba(255,255,255,0.06)',
          boxShadow: selected ? '0 0 12px rgba(245,158,11,0.25)' : 'none',
        }}
      >
        {image
          ? <img src={image} alt={playlist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ width: 8, height: 16, background: 'rgba(255,255,255,0.15)', borderRadius: 1, margin: '0 2px' }} />
              <div style={{ width: 8, height: 20, background: 'rgba(255,255,255,0.2)', borderRadius: 1, margin: '0 2px' }} />
              <div style={{ width: 8, height: 14, background: 'rgba(255,255,255,0.15)', borderRadius: 1, margin: '0 2px' }} />
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {playlist.name}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
          {trackCount} tracks
        </div>
      </div>

      {/* Check mark */}
      {selected && (
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 20, height: 20, background: '#F59E0B' }}
        >
          <svg viewBox="0 0 24 24" fill="black" style={{ width: 11, height: 11 }}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
      )}
    </button>
  )
}

export default function PlaylistSelector({ playlists, loading, onSelect, user }) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = playlists.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(playlist) {
    setSelectedId(playlist.id)
    // Small delay so the selection state is visible before navigating
    setTimeout(() => onSelect(playlist), 180)
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0A0A0F 0%, #0D0B1A 55%, #110A1F 100%)' }}
    >
      <div className="max-w-lg mx-auto px-5 py-10 fade-in">
        {/* Decorative star */}
        <StarSmall color="#8B5CF6" size={12} className="absolute top-8 right-8 pulse-glow-anim" />

        {/* Header */}
        <div className="mb-7">
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Logged in as{' '}
            <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{user?.display_name}</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Choose a <span className="text-gradient">playlist</span>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 6 }}>
            Select the playlist you want to optimize.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg
            viewBox="0 0 24 24" fill="currentColor"
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}
          >
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search playlists…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* List */}
        <div style={{ maxHeight: '64vh', overflowY: 'auto', paddingRight: 2 }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <svg className="spin-anim" style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" stroke="#F59E0B"/>
              </svg>
              <span style={{ fontSize: 13 }}>Loading your playlists…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              No playlists found.
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {filtered.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 30}ms` }}>
                  <PlaylistCard
                    playlist={p}
                    selected={selectedId === p.id}
                    onClick={() => handleSelect(p)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
