/**
 * Screen Lock & Device Security Engine for Cukupin PWA
 *
 * Implements:
 * - Salted SHA-256 PIN hashing using Web Crypto API (crypto.subtle).
 * - WebAuthn Biometric platform authentication (Touch ID, Face ID, Windows Hello, Android Fingerprint).
 * - Local configuration persistence in localStorage with default fallback.
 * - Auto-lock timeout evaluation on tab visibility switch or idle background.
 *
 * Note: Strictly NO raw unicode emojis.
 */

export interface ScreenLockConfig {
  enabled: boolean
  pinHash: string | null
  salt: string | null
  biometricEnabled: boolean
  autoLockTimeoutMinutes: number // 0 = immediate on switch, 1, 5, 15, -1 = never on background
  credentialId?: string | null
}

export const SCREEN_LOCK_CONFIG_KEY = 'cukupin_screen_lock_config'
export const SCREEN_LOCK_UNLOCKED_SESSION_KEY = 'cukupin_screen_unlocked'
export const SCREEN_LOCK_LAST_ACTIVE_KEY = 'cukupin_last_active_time'

export const DEFAULT_SCREEN_LOCK_CONFIG: ScreenLockConfig = {
  enabled: false,
  pinHash: null,
  salt: null,
  biometricEnabled: false,
  autoLockTimeoutMinutes: 5,
  credentialId: null,
}

/**
 * Generate a cryptographically secure hex salt
 */
export function generateSalt(byteLength: number = 16): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(byteLength)
    crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for non-crypto environments
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  )
}

/**
 * Compute SHA-256 hex digest
 */
export async function sha256Hex(text: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback for Node.js test environment if crypto.subtle is not present
  try {
    const nodeCrypto = await import('node:crypto')
    return nodeCrypto.createHash('sha256').update(text).digest('hex')
  } catch {
    // Basic hash representation fallback
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }
}

/**
 * Hash a PIN with a salt
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${pin}`)
}

/**
 * Verify an input PIN against stored salt and hash
 */
export async function verifyPin(
  inputPin: string,
  storedHash: string | null,
  salt: string | null
): Promise<boolean> {
  if (!storedHash || !salt || !inputPin) return false
  const calculatedHash = await hashPin(inputPin, salt)
  return calculatedHash === storedHash
}

/**
 * Retrieve current screen lock configuration from localStorage
 */
export function getScreenLockConfig(): ScreenLockConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_SCREEN_LOCK_CONFIG }
  }
  try {
    const stored = window.localStorage.getItem(SCREEN_LOCK_CONFIG_KEY)
    if (!stored) return { ...DEFAULT_SCREEN_LOCK_CONFIG }
    const parsed = JSON.parse(stored)
    return {
      enabled: Boolean(parsed.enabled),
      pinHash: parsed.pinHash || null,
      salt: parsed.salt || null,
      biometricEnabled: Boolean(parsed.biometricEnabled),
      autoLockTimeoutMinutes:
        typeof parsed.autoLockTimeoutMinutes === 'number'
          ? parsed.autoLockTimeoutMinutes
          : DEFAULT_SCREEN_LOCK_CONFIG.autoLockTimeoutMinutes,
      credentialId: parsed.credentialId || null,
    }
  } catch {
    return { ...DEFAULT_SCREEN_LOCK_CONFIG }
  }
}

/**
 * Persist screen lock configuration to localStorage
 */
export function saveScreenLockConfig(config: ScreenLockConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(SCREEN_LOCK_CONFIG_KEY, JSON.stringify(config))
}

/**
 * Clear screen lock configuration (for reset or logout)
 */
export function clearScreenLockConfig(): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.removeItem(SCREEN_LOCK_CONFIG_KEY)
  if (window.sessionStorage) {
    window.sessionStorage.removeItem(SCREEN_LOCK_UNLOCKED_SESSION_KEY)
  }
  window.localStorage.removeItem(SCREEN_LOCK_LAST_ACTIVE_KEY)
}

/**
 * Check if the current browser session has been unlocked
 */
export function isSessionUnlocked(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return false
  return window.sessionStorage.getItem(SCREEN_LOCK_UNLOCKED_SESSION_KEY) === 'true'
}

/**
 * Update session unlocked status
 */
export function setSessionUnlocked(unlocked: boolean): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return
  if (unlocked) {
    window.sessionStorage.setItem(SCREEN_LOCK_UNLOCKED_SESSION_KEY, 'true')
    setLastActiveTimestamp(Date.now())
  } else {
    window.sessionStorage.removeItem(SCREEN_LOCK_UNLOCKED_SESSION_KEY)
  }
}

/**
 * Get the last active epoch timestamp in milliseconds
 */
export function getLastActiveTimestamp(): number {
  if (typeof window === 'undefined' || !window.localStorage) return 0
  const val = window.localStorage.getItem(SCREEN_LOCK_LAST_ACTIVE_KEY)
  return val ? parseInt(val, 10) || 0 : 0
}

/**
 * Update the last active timestamp
 */
export function setLastActiveTimestamp(timestamp: number = Date.now()): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(SCREEN_LOCK_LAST_ACTIVE_KEY, timestamp.toString())
}

/**
 * Check if the screen should auto-lock based on elapsed idle time
 */
export function shouldAutoLock(
  timeoutMinutes: number,
  lastActiveMs: number,
  currentMs: number = Date.now()
): boolean {
  // Negative number means never auto-lock when backgrounded
  if (timeoutMinutes < 0) return false
  // 0 means immediately on switch/background
  if (timeoutMinutes === 0) return true
  // If no last active record, lock
  if (!lastActiveMs || lastActiveMs <= 0) return true

  const elapsedMs = currentMs - lastActiveMs
  return elapsedMs >= timeoutMinutes * 60 * 1000
}

/**
 * Helper to convert ArrayBuffer to Base64URL string
 */
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Helper to convert Base64URL string to Uint8Array
 */
function base64UrlToBuffer(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(base64 + padding)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Check if WebAuthn platform biometrics (TouchID / FaceID / Fingerprint) are available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!window.PublicKeyCredential) return false
  try {
    if (
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable ===
      'function'
    ) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
    return false
  } catch {
    return false
  }
}

/**
 * Register device biometric credential with WebAuthn
 */
export async function registerBiometric(
  username: string = 'pengguna@cukupin.app'
): Promise<{ credentialId: string } | null> {
  if (typeof window === 'undefined' || !navigator.credentials) return null

  try {
    const challenge = new Uint8Array(32)
    if (crypto.getRandomValues) {
      crypto.getRandomValues(challenge)
    }

    const userId = new Uint8Array(16)
    if (crypto.getRandomValues) {
      crypto.getRandomValues(userId)
    }

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Cukupin PWA',
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: username,
          displayName: 'Pengguna Cukupin',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null

    if (!credential || !credential.rawId) return null

    const credentialId = bufferToBase64Url(credential.rawId)
    return { credentialId }
  } catch (err) {
    console.warn('Biometric registration cancelled or failed:', err)
    return null
  }
}

/**
 * Verify user via WebAuthn platform biometric authenticator
 */
export async function verifyBiometric(credentialId?: string | null): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.credentials) return false

  try {
    const challenge = new Uint8Array(32)
    if (crypto.getRandomValues) {
      crypto.getRandomValues(challenge)
    }

    const allowCredentials = credentialId
      ? [
          {
            type: 'public-key' as const,
            id: base64UrlToBuffer(credentialId),
          },
        ]
      : undefined

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'required',
        allowCredentials,
        timeout: 60000,
      },
    })

    return Boolean(assertion)
  } catch (err) {
    console.warn('Biometric verification cancelled or failed:', err)
    return false
  }
}
