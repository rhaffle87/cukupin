'use client'

/**
 * Screen Lock Overlay for Cukupin PWA
 *
 * Fullscreen visual security barrier that protects financial numbers
 * and charts on shared mobile or desktop screens.
 *
 * Features:
 * - 6-digit tactile PIN dial pad + desktop keyboard support.
 * - Platform Biometrics (Fingerprint / Touch ID / Face ID) trigger.
 * - Subtle shake animation on invalid PIN attempt.
 * - "Lupa PIN" sign-out recovery flow.
 *
 * Strictly NO raw unicode emojis. Lucide SVG icons only.
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  Lock,
  Fingerprint,
  Delete,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  X,
} from 'lucide-react'
import { useScreenLock } from '@/context/ScreenLockContext'
import { useFinance } from '@/context/FinanceContext'
import { toast } from 'sonner'

export function ScreenLockOverlay() {
  const {
    isLocked,
    config,
    biometricAvailable,
    unlockWithPin,
    unlockWithBiometric,
    resetLockState,
  } = useScreenLock()
  const { supabase, user } = useFinance()

  const [pin, setPin] = useState<string>('')
  const [isShaking, setIsShaking] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Try biometric auto-prompt once if biometric is enabled
  useEffect(() => {
    if (isLocked && config.biometricEnabled && biometricAvailable) {
      const timer = setTimeout(() => {
        unlockWithBiometric().then((success) => {
          if (success) {
            setPin('')
            setErrorMessage('')
          }
        })
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isLocked, config.biometricEnabled, biometricAvailable, unlockWithBiometric])

  // Process PIN when length reaches 6
  const handlePinSubmit = useCallback(
    async (pinToVerify: string) => {
      if (pinToVerify.length !== 6 || isSubmitting) return
      setIsSubmitting(true)
      setErrorMessage('')

      const success = await unlockWithPin(pinToVerify)
      if (success) {
        setPin('')
        setErrorMessage('')
      } else {
        setIsShaking(true)
        setErrorMessage('PIN salah. Silakan coba lagi.')
        setTimeout(() => {
          setIsShaking(false)
          setPin('')
        }, 500)
      }
      setIsSubmitting(false)
    },
    [unlockWithPin, isSubmitting]
  )

  // Handle digit press
  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6) return
    const nextPin = pin + digit
    setPin(nextPin)
    setErrorMessage('')

    if (nextPin.length === 6) {
      handlePinSubmit(nextPin)
    }
  }

  // Handle backspace
  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1))
      setErrorMessage('')
    }
  }

  // Handle keyboard inputs on desktop
  useEffect(() => {
    if (!isLocked) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showForgotModal) return

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleDigitPress(e.key)
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleBackspace()
      } else if (e.key === 'Escape') {
        setPin('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLocked, pin, showForgotModal, handleDigitPress])

  // Handle Biometric Button Click
  const handleBiometricClick = async () => {
    const success = await unlockWithBiometric()
    if (success) {
      setPin('')
      setErrorMessage('')
    } else {
      toast.error('Verifikasi biometrik tidak berhasil atau dibatalkan.')
    }
  }

  // Handle Forgot PIN / Sign Out Recovery
  const handleConfirmReset = async () => {
    resetLockState()
    setShowForgotModal(false)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cukupin_offline_queue')
      if (user?.id === 'local-dev-user') {
        localStorage.setItem('cukupin_dev_logged_out', 'true')
      }
    }
    if (supabase && user?.id !== 'local-dev-user') {
      await supabase.auth.signOut()
    }
    toast.success('Kunci layar direset. Silakan masuk kembali dengan kata sandi akun.')
    window.location.href = '/auth/login'
  }

  if (!isLocked) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-title"
      className="fixed inset-0 z-[999] bg-[#FAF9F5] text-ink flex flex-col items-center justify-between p-6 select-none overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Top Brand Header */}
      <div className="w-full max-w-xs flex flex-col items-center pt-14 sm:pt-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#DFDCD2] shadow-xs flex items-center justify-center mb-4 text-emerald-700">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1
          id="lock-title"
          className="text-xl font-bold tracking-tight text-ink flex items-center gap-2"
        >
          <Lock className="w-5 h-5 text-emerald-600" />
          Kunci Layar Cukupin
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 max-w-[260px]">
          Aplikasi terkunci. Masukkan 6 digit PIN untuk mengakses catatan keuangan Anda.
        </p>
      </div>

      {/* PIN Dots Indicator */}
      <div className="my-6 flex flex-col items-center">
        <div
          className={`flex items-center gap-4 py-2 transition-transform duration-200 ${
            isShaking ? 'translate-x-[-10px] animate-shake text-rose-500' : ''
          }`}
        >
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-xs'
                    : 'border-[#D0CBBF] bg-transparent'
                }`}
              />
            )
          })}
        </div>

        {/* Error message or verification status */}
        <div className="h-5 mt-2 flex items-center justify-center">
          {errorMessage && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 pb-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitPress(digit)}
            disabled={isSubmitting}
            className="h-16 rounded-2xl bg-white border border-[#DFDCD2] shadow-xs text-2xl font-bold font-numeric text-ink flex items-center justify-center active:scale-95 active:bg-[#ECE9DF] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {digit}
          </button>
        ))}

        {/* Bottom row: Biometric or empty placeholder */}
        {config.biometricEnabled && biometricAvailable ? (
          <button
            type="button"
            onClick={handleBiometricClick}
            disabled={isSubmitting}
            aria-label="Buka dengan Biometrik"
            className="h-16 rounded-2xl bg-white/70 border border-[#DFDCD2] text-emerald-700 flex flex-col items-center justify-center active:scale-95 active:bg-[#ECE9DF] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <Fingerprint className="w-7 h-7" />
            <span className="text-[10px] font-semibold mt-0.5">Biometrik</span>
          </button>
        ) : (
          <div className="h-16" />
        )}

        {/* Digit 0 */}
        <button
          type="button"
          onClick={() => handleDigitPress('0')}
          disabled={isSubmitting}
          className="h-16 rounded-2xl bg-white border border-[#DFDCD2] shadow-xs text-2xl font-bold font-numeric text-ink flex items-center justify-center active:scale-95 active:bg-[#ECE9DF] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={pin.length === 0 || isSubmitting}
          aria-label="Hapus Digit"
          className="h-16 rounded-2xl bg-white/70 border border-[#DFDCD2] text-muted hover:text-ink flex items-center justify-center active:scale-95 active:bg-[#ECE9DF] transition-all disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <Delete className="w-6 h-6" />
        </button>
      </div>

      {/* Forgot PIN / Reset Link */}
      <div className="w-full max-w-xs text-center pt-4 pb-2">
        <button
          type="button"
          onClick={() => setShowForgotModal(true)}
          className="text-xs font-medium text-muted hover:text-ink underline underline-offset-4 transition-colors"
        >
          Lupa 6 digit PIN Anda?
        </button>
      </div>

      {/* Forgot PIN Recovery Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DFDCD2] p-6 max-w-sm w-full shadow-lg animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE9DF]">
              <div className="flex items-center gap-2 text-ink font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Reset Kunci Layar
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-muted hover:text-ink p-1 rounded-lg hover:bg-[#FAF9F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-ink/80 mt-3 leading-relaxed">
              Jika Anda lupa PIN, Anda dapat mereset kunci layar dengan keluar dari akun
              (Sign Out) dan masuk kembali dengan email &amp; kata sandi akun Anda. Data
              keuangan di cloud tidak akan hilang.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 text-xs font-semibold text-muted hover:text-ink rounded-xl border border-[#DFDCD2] hover:bg-[#FAF9F5] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar &amp; Reset PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
