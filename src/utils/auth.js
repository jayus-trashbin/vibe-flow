import { getClientId } from './clientId'

// CLIENT_ID is retrieved dynamically from storage or .env
// Force exact trailing slash behavior
const baseUri = import.meta.env.VITE_REDIRECT_URI || window.location.origin
const REDIRECT_URI = baseUri.endsWith('/') ? baseUri : baseUri + '/'

export const REQUIRED_SCOPES = [
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
]
const SCOPES = REQUIRED_SCOPES.join(' ')

// --- PKCE Helpers ---

function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values).map(x => possible[x % possible.length]).join('')
}

async function sha256(plain) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (const byte of bytes) str += String.fromCharCode(byte)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
  const hashed = await sha256(verifier)
  return base64UrlEncode(hashed)
}

// --- Auth Flow ---

export async function initiateLogin(forceConsent = false) {
  const clientId = getClientId()
  if (!clientId) {
    throw new Error('Spotify Client ID not configured')
  }

  const verifier = generateRandomString(64)
  const challenge = await generateCodeChallenge(verifier)
  const state = generateRandomString(16)

  localStorage.setItem('pkce_verifier', verifier)
  localStorage.setItem('pkce_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    ...(forceConsent ? { show_dialog: 'true' } : {}),
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function handleCallback(code, state) {
  const clientId = getClientId()
  if (!clientId) {
    throw new Error('Spotify Client ID not configured')
  }

  const storedState = localStorage.getItem('pkce_state')
  const verifier = localStorage.getItem('pkce_verifier')

  if (state !== storedState) {
    throw new Error('State mismatch — possible CSRF attack.')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      code_verifier: verifier,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error_description || 'Token exchange failed')
  }

  const data = await response.json()
  const expiresAt = Date.now() + data.expires_in * 1000

  localStorage.removeItem('pkce_verifier')
  localStorage.removeItem('pkce_state')

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    grantedScope: data.scope || '',
  }
}

export async function refreshAccessToken(refreshToken) {
  const clientId = getClientId()
  if (!clientId) {
    throw new Error('Spotify Client ID not configured')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })

  if (!response.ok) throw new Error('Token refresh failed')

  const data = await response.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    grantedScope: data.scope || '',
  }
}

export function saveTokens(tokens) {
  localStorage.setItem('vf_tokens', JSON.stringify(tokens))
  if (tokens.grantedScope) {
    localStorage.setItem('vf_granted_scopes', tokens.grantedScope)
  }
}

export function loadTokens() {
  try {
    const raw = localStorage.getItem('vf_tokens')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearTokens() {
  localStorage.removeItem('vf_tokens')
  localStorage.removeItem('vf_token_scopes')
  localStorage.removeItem('vf_granted_scopes')
}

export function isTokenExpired(tokens) {
  return !tokens || Date.now() >= tokens.expiresAt - 60_000
}

export function isTokenScopesStale() {
  const granted = localStorage.getItem('vf_granted_scopes') || localStorage.getItem('vf_token_scopes') || ''
  const grantedSet = new Set(granted.split(' ').filter(Boolean))
  return REQUIRED_SCOPES.some(s => !grantedSet.has(s))
}
