'use client'

/**
 * Screen Lock Context & Hook for Cukupin PWA
 *
 * Provides biometric & PIN screen lock state, visibility-based auto-lock,
 * dial pad verification, and recovery options.
 *
 * Note: Strictly NO raw unicode emojis.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import {
  ScreenLockConfig,
  DEFAULT_SCREEN_LOCK_CONFIG,
  getScreenLockConfig,
  saveScreenLockConfig,
  clearScreenLockConfig,
  generateSalt,
  hashPin,
  verifyPin,
  isBiometricAvailable,
  registerBiometric,
  verifyBiometric,
  isSessionUnlocked,
  setSessionUnlocked,
  getLastActiveTimestamp,
  setLastActiveTimestamp,
  shouldAutoLock,
} from '@/lib/security/screenLock'

interface ScreenLockContextType {
  isLocked: boolean
  isConfigured: boolean
  biometricAvailable: boolean
  config: ScreenLockConfig
  lockScreen: () => void
  unlockWithPin: (pin: string) => Promise<boolean>
  unlockWithBiometric: () => Promise<boolean>
  setupPin: (newPin: string, enableBiometric?: boolean) => Promise<boolean>
  disableLock: (currentPin: string) => Promise<boolean>
  updateTimeout: (timeoutMinutes: number) => void
  toggleBiometric: (enabled: boolean) => Promise<boolean>
  resetLockState: () => void
}

const ScreenLockContext = createContext<ScreenLockContextType | null>(null)

export function ScreenLockProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ScreenLockConfig>(DEFAULT_SCREEN_LOCK_CONFIG)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [biometricAvailable, setBiometricAvailable] = useState<boolean>(false)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const configRef = useRef<ScreenLockConfig>(DEFAULT_SCREEN_LOCK_CONFIG)
  configRef.current = config

  // Initialize config and check unlock status on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialConfig = getScreenLockConfig()
    setConfig(initialConfig)

    // Check biometric hardware support
    isBiometricAvailable().then((supported) => {
      setBiometricAvailable(supported)
    })

    if (initialConfig.enabled && initialConfig.pinHash) {
      const alreadyUnlocked = isSessionUnlocked()
      const lastActive = getLastActiveTimestamp()
      const now = Date.now()

      if (!alreadyUnlocked) {
        setIsLocked(true)
      } else if (
        shouldAutoLock(initialConfig.autoLockTimeoutMinutes, lastActive, now)
      ) {
        setIsLocked(true)
        setSessionUnlocked(false)
      } else {
        setLastActiveTimestamp(now)
      }
    }

    setIsInitialized(true)
  }, [])

  // Activity updater helper
  const recordUserActivity = useCallback(() => {
    if (configRef.current.enabled && !isLocked) {
      setLastActiveTimestamp(Date.now())
    }
  }, [isLocked])

  // Track window focus, visibility, and user activity
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      const activeConfig = configRef.current
      if (!activeConfig.enabled) return

      if (document.visibilityState === 'hidden') {
        // App went into background or screen shut off
        setLastActiveTimestamp(Date.now())
      } else if (document.visibilityState === 'visible') {
        // App returned to foreground
        const lastActive = getLastActiveTimestamp()
        const now = Date.now()

        if (
          shouldAutoLock(activeConfig.autoLockTimeoutMinutes, lastActive, now)
        ) {
          setIsLocked(true)
          setSessionUnlocked(false)
        } else {
          setLastActiveTimestamp(now)
        }
      }
    }

    const handleUserInteraction = () => {
      recordUserActivity()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)
    window.addEventListener('pointerdown', handleUserInteraction, { passive: true })
    window.addEventListener('keydown', handleUserInteraction, { passive: true })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
      window.removeEventListener('pointerdown', handleUserInteraction)
      window.removeEventListener('keydown', handleUserInteraction)
    }
  }, [recordUserActivity])

  const lockScreen = useCallback(() => {
    if (!configRef.current.enabled) return
    setIsLocked(true)
    setSessionUnlocked(false)
    setLastActiveTimestamp(Date.now())
  }, [])

  const unlockWithPin = useCallback(
    async (pin: string): Promise<boolean> => {
      const currentConfig = configRef.current
      if (!currentConfig.enabled || !currentConfig.pinHash || !currentConfig.salt) {
        setIsLocked(false)
        return true
      }

      const isValid = await verifyPin(pin, currentConfig.pinHash, currentConfig.salt)
      if (isValid) {
        setIsLocked(false)
        setSessionUnlocked(true)
        setLastActiveTimestamp(Date.now())
        return true
      }
      return false
    },
    []
  )

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const currentConfig = configRef.current
    if (!currentConfig.enabled || !currentConfig.biometricEnabled) {
      return false
    }

    const verified = await verifyBiometric(currentConfig.credentialId)
    if (verified) {
      setIsLocked(false)
      setSessionUnlocked(true)
      setLastActiveTimestamp(Date.now())
      return true
    }
    return false
  }, [])

  const setupPin = useCallback(
    async (newPin: string, enableBiometric: boolean = false): Promise<boolean> => {
      if (!newPin || newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
        return false
      }

      const salt = generateSalt(16)
      const pinHash = await hashPin(newPin, salt)

      let credentialId: string | null = null
      let bioEnabled = false

      if (enableBiometric) {
        const bioResult = await registerBiometric()
        if (bioResult) {
          credentialId = bioResult.credentialId
          bioEnabled = true
        }
      }

      const newConfig: ScreenLockConfig = {
        enabled: true,
        pinHash,
        salt,
        biometricEnabled: bioEnabled,
        autoLockTimeoutMinutes: config.autoLockTimeoutMinutes || 5,
        credentialId,
      }

      saveScreenLockConfig(newConfig)
      setConfig(newConfig)
      setSessionUnlocked(true)
      setIsLocked(false)
      setLastActiveTimestamp(Date.now())

      return true
    },
    [config.autoLockTimeoutMinutes]
  )

  const disableLock = useCallback(
    async (currentPin: string): Promise<boolean> => {
      const currentConfig = configRef.current
      if (!currentConfig.enabled) {
        clearScreenLockConfig()
        setConfig(DEFAULT_SCREEN_LOCK_CONFIG)
        setIsLocked(false)
        return true
      }

      const isValid = await verifyPin(
        currentPin,
        currentConfig.pinHash,
        currentConfig.salt
      )
      if (!isValid) return false

      clearScreenLockConfig()
      setConfig(DEFAULT_SCREEN_LOCK_CONFIG)
      setIsLocked(false)
      return true
    },
    []
  )

  const updateTimeout = useCallback((timeoutMinutes: number) => {
    const updated: ScreenLockConfig = {
      ...configRef.current,
      autoLockTimeoutMinutes: timeoutMinutes,
    }
    saveScreenLockConfig(updated)
    setConfig(updated)
  }, [])

  const toggleBiometric = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      const currentConfig = configRef.current
      if (!enabled) {
        const updated: ScreenLockConfig = {
          ...currentConfig,
          biometricEnabled: false,
        }
        saveScreenLockConfig(updated)
        setConfig(updated)
        return true
      }

      const reg = await registerBiometric()
      if (reg) {
        const updated: ScreenLockConfig = {
          ...currentConfig,
          biometricEnabled: true,
          credentialId: reg.credentialId,
        }
        saveScreenLockConfig(updated)
        setConfig(updated)
        return true
      }
      return false
    },
    []
  )

  const resetLockState = useCallback(() => {
    clearScreenLockConfig()
    setConfig(DEFAULT_SCREEN_LOCK_CONFIG)
    setIsLocked(false)
  }, [])

  return (
    <ScreenLockContext.Provider
      value={{
        isLocked: isInitialized ? isLocked : false,
        isConfigured: Boolean(config.enabled && config.pinHash),
        biometricAvailable,
        config,
        lockScreen,
        unlockWithPin,
        unlockWithBiometric,
        setupPin,
        disableLock,
        updateTimeout,
        toggleBiometric,
        resetLockState,
      }}
    >
      {children}
    </ScreenLockContext.Provider>
  )
}

export function useScreenLock() {
  const context = useContext(ScreenLockContext)
  if (!context) {
    throw new Error('useScreenLock must be used within a ScreenLockProvider')
  }
  return context
}
