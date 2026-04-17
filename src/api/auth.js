// ── OAuth 2.0 PKCE helpers ────────────────────────────────────────

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'user-read-private',
].join(' ')

const TOKEN_KEY   = 'vf_token'
const VERIFIER_KEY = 'vf_verifier'
const CLIENT_KEY  = 'vf_client_id'

// ── PKCE crypto ───────────────────────────────────────────────────

function randomString(len = 64) {
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    .slice(0, len)
}

async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateChallenge(verifier) {
  const hash = await sha256(verifier)
  return base64url(hash)
}

// ── Public API ────────────────────────────────────────────────────

export function getStoredToken()    { return sessionStorage.getItem(TOKEN_KEY) }
export function clearStoredToken()  { sessionStorage.removeItem(TOKEN_KEY) }
export function storeToken(token)   { sessionStorage.setItem(TOKEN_KEY, token) }

export function getClientId()       { return localStorage.getItem(CLIENT_KEY) ?? '' }
export function setClientId(id)     { localStorage.setItem(CLIENT_KEY, id) }

/** Redirect the browser to Spotify's auth page. */
export async function startOAuthFlow(clientId) {
  const verifier   = randomString(64)
  const challenge  = await generateChallenge(verifier)
  const redirectUri = getRedirectUri()

  sessionStorage.setItem(VERIFIER_KEY, verifier)
  if (clientId) setClientId(clientId)

  const params = new URLSearchParams({
    response_type:          'code',
    client_id:              clientId || getClientId(),
    scope:                  SCOPES,
    redirect_uri:           redirectUri,
    code_challenge_method:  'S256',
    code_challenge:         challenge,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

/** Called on page load — exchanges the ?code param for a token. */
export async function handleOAuthCallback() {
  const url    = new URL(window.location.href)
  const code   = url.searchParams.get('code')
  const error  = url.searchParams.get('error')

  if (error)  return { error }
  if (!code)  return null

  // Clean the URL immediately
  window.history.replaceState({}, '', window.location.pathname)

  const verifier   = sessionStorage.getItem(VERIFIER_KEY)
  const clientId   = getClientId()
  const redirectUri = getRedirectUri()

  if (!verifier || !clientId) return { error: 'Sessão expirada. Tente novamente.' }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      code,
      redirect_uri:  redirectUri,
      client_id:     clientId,
      code_verifier: verifier,
    }),
  })

  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    return { error: e.error_description ?? 'Falha na autenticação.' }
  }

  const data = await res.json()
  sessionStorage.removeItem(VERIFIER_KEY)
  storeToken(data.access_token)
  return { token: data.access_token }
}

function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`
}
