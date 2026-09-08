import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateSalt,
  hashPin,
  verifyPin,
  shouldAutoLock,
  getScreenLockConfig,
  saveScreenLockConfig,
  clearScreenLockConfig,
  isSessionUnlocked,
  setSessionUnlocked,
  DEFAULT_SCREEN_LOCK_CONFIG,
  SCREEN_LOCK_CONFIG_KEY,
} from '@/lib/security/screenLock'

describe('Screen Lock & Device Security Engine Tests', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('Cryptographic Salt & PIN Hashing', () => {
    it('generates a 32-character hex salt from 16 bytes', () => {
      const salt1 = generateSalt(16)
      const salt2 = generateSalt(16)

      expect(salt1).toHaveLength(32)
      expect(salt2).toHaveLength(32)
      expect(salt1).not.toBe(salt2)
      expect(/^[0-9a-f]+$/i.test(salt1)).toBe(true)
    })

    it('hashes PIN deterministically with identical salt', async () => {
      const pin = '123456'
      const salt = generateSalt(16)

      const hash1 = await hashPin(pin, salt)
      const hash2 = await hashPin(pin, salt)

      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64) // SHA-256 hex length
    })

    it('produces different hashes for same PIN with different salts', async () => {
      const pin = '889900'
      const saltA = generateSalt(16)
      const saltB = generateSalt(16)

      const hashA = await hashPin(pin, saltA)
      const hashB = await hashPin(pin, saltB)

      expect(hashA).not.toBe(hashB)
    })

    it('verifies correct PIN successfully', async () => {
      const pin = '654321'
      const salt = generateSalt(16)
      const storedHash = await hashPin(pin, salt)

      const isValid = await verifyPin(pin, storedHash, salt)
      expect(isValid).toBe(true)
    })

    it('rejects incorrect PIN', async () => {
      const pin = '654321'
      const wrongPin = '654322'
      const salt = generateSalt(16)
      const storedHash = await hashPin(pin, salt)

      const isValid = await verifyPin(wrongPin, storedHash, salt)
      expect(isValid).toBe(false)
    })

    it('safely rejects empty or null parameters in verifyPin', async () => {
      expect(await verifyPin('', 'somehash', 'somesalt')).toBe(false)
      expect(await verifyPin('123456', null, 'somesalt')).toBe(false)
      expect(await verifyPin('123456', 'somehash', null)).toBe(false)
    })
  })

  describe('Auto-Lock Timeout Logic', () => {
    it('never auto-locks if timeoutMinutes is negative (-1)', () => {
      const now = 1700000000000
      const lastActive = now - 60 * 60 * 1000 // 1 hour ago
      expect(shouldAutoLock(-1, lastActive, now)).toBe(false)
    })

    it('immediately auto-locks if timeoutMinutes is 0', () => {
      const now = 1700000000000
      const lastActive = now - 1000 // 1 second ago
      expect(shouldAutoLock(0, lastActive, now)).toBe(true)
    })

    it('does not lock if elapsed time is less than timeoutMinutes', () => {
      const now = 1700000000000
      const fiveMinutesMs = 5 * 60 * 1000
      const lastActive = now - (fiveMinutesMs - 1000) // 4 min 59 sec ago

      expect(shouldAutoLock(5, lastActive, now)).toBe(false)
    })

    it('locks when elapsed time equals or exceeds timeoutMinutes', () => {
      const now = 1700000000000
      const fiveMinutesMs = 5 * 60 * 1000
      const lastActive = now - fiveMinutesMs // Exactly 5 minutes ago

      expect(shouldAutoLock(5, lastActive, now)).toBe(true)
      expect(shouldAutoLock(5, lastActive - 5000, now)).toBe(true) // 5 min 5 sec ago
    })

    it('locks if lastActive timestamp is missing or zero', () => {
      const now = 1700000000000
      expect(shouldAutoLock(5, 0, now)).toBe(true)
    })
  })

  describe('Configuration & Session Persistence', () => {
    it('returns default config when storage is empty', () => {
      const config = getScreenLockConfig()
      expect(config).toEqual(DEFAULT_SCREEN_LOCK_CONFIG)
      expect(config.enabled).toBe(false)
    })

    it('persists and retrieves updated screen lock configuration', () => {
      const customConfig = {
        enabled: true,
        pinHash: 'abcdef1234567890',
        salt: '1122334455667788',
        biometricEnabled: true,
        autoLockTimeoutMinutes: 15,
        credentialId: 'cred-1234',
      }

      saveScreenLockConfig(customConfig)
      const loaded = getScreenLockConfig()

      expect(loaded).toEqual(customConfig)
    })

    it('handles corrupted configuration gracefully', () => {
      localStorage.setItem(SCREEN_LOCK_CONFIG_KEY, '{ invalid-json ...')
      const loaded = getScreenLockConfig()
      expect(loaded).toEqual(DEFAULT_SCREEN_LOCK_CONFIG)
    })

    it('clears screen lock configuration and active session', () => {
      saveScreenLockConfig({
        enabled: true,
        pinHash: 'hash',
        salt: 'salt',
        biometricEnabled: true,
        autoLockTimeoutMinutes: 5,
        credentialId: null,
      })
      setSessionUnlocked(true)

      expect(isSessionUnlocked()).toBe(true)

      clearScreenLockConfig()

      expect(getScreenLockConfig()).toEqual(DEFAULT_SCREEN_LOCK_CONFIG)
      expect(isSessionUnlocked()).toBe(false)
    })

    it('sets and removes session unlock state', () => {
      expect(isSessionUnlocked()).toBe(false)
      setSessionUnlocked(true)
      expect(isSessionUnlocked()).toBe(true)
      setSessionUnlocked(false)
      expect(isSessionUnlocked()).toBe(false)
    })
  })
})
