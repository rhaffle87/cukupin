'use client'

/**
 * Security & PIN Configuration Modal for Cukupin PWA
 *
 * Allows users to:
 * - Set up or change a 6-digit PIN.
 * - Toggle WebAuthn platform biometrics (Fingerprint / Face ID).
 * - Choose background auto-lock timeout duration.
 * - Manually lock the screen immediately.
 *
 * Strictly NO raw unicode emojis. Lucide SVG icons only.
 */

import React, { useState } from 'react'
import {
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  Fingerprint,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { useScreenLock } from '@/context/ScreenLockContext'
import { toast } from 'sonner'

interface SecuritySettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SetupStep = 'idle' | 'enter_new_pin' | 'confirm_new_pin' | 'verify_current_to_disable'

export function SecuritySettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const {
    isConfigured,
    config,
    biometricAvailable,
    setupPin,
    disableLock,
    updateTimeout,
    toggleBiometric,
    lockScreen,
  } = useScreenLock()

  const [step, setStep] = useState<SetupStep>('idle')
  const [newPin, setNewPin] = useState<string>('')
  const [confirmPin, setConfirmPin] = useState<string>('')
  const [currentPin, setCurrentPin] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  if (!isOpen) return null

  const resetInternalState = () => {
    setStep('idle')
    setNewPin('')
    setConfirmPin('')
    setCurrentPin('')
    setErrorMessage('')
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetInternalState()
    onClose()
  }

  // Handle PIN Setup / Confirmation
  const handleNextStep = async () => {
    setErrorMessage('')

    if (step === 'enter_new_pin') {
      if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
        setErrorMessage('PIN harus tepat 6 digit angka.')
        return
      }
      setStep('confirm_new_pin')
      return
    }

    if (step === 'confirm_new_pin') {
      if (confirmPin !== newPin) {
        setErrorMessage('Konfirmasi PIN tidak cocok dengan PIN baru.')
        return
      }

      setIsProcessing(true)
      const success = await setupPin(confirmPin, config.biometricEnabled)
      setIsProcessing(false)

      if (success) {
        toast.success('PIN keamanan berhasil diatur!')
        resetInternalState()
      } else {
        setErrorMessage('Gagal menyimpan PIN. Coba lagi.')
      }
      return
    }

    if (step === 'verify_current_to_disable') {
      setIsProcessing(true)
      const success = await disableLock(currentPin)
      setIsProcessing(false)

      if (success) {
        toast.success('Kunci layar berhasil dinonaktifkan.')
        resetInternalState()
      } else {
        setErrorMessage('PIN saat ini salah.')
      }
    }
  }

  // Handle Biometric Toggle
  const handleToggleBiometric = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsProcessing(true)
    const success = await toggleBiometric(checked)
    setIsProcessing(false)

    if (success) {
      toast.success(
        checked
          ? 'Autentikasi biometrik berhasil diaktifkan!'
          : 'Autentikasi biometrik dinonaktifkan.'
      )
    } else if (checked) {
      toast.error('Gagal mengaktifkan biometrik pada perangkat ini.')
    }
  }

  // Handle Immediate Manual Lock
  const handleLockNow = () => {
    handleClose()
    lockScreen()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-settings-title"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl border border-[#DFDCD2] shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECE9DF] bg-[#FAF9F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="security-settings-title"
                className="text-base font-bold text-ink"
              >
                Keamanan &amp; Kunci PIN
              </h2>
              <p className="text-xs text-muted">Proteksi PWA pada perangkat bersama</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup"
            className="text-muted hover:text-ink p-1.5 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status Section */}
          {step === 'idle' ? (
            <>
              {/* PIN Lock Master Card */}
              <div className="p-4 rounded-xl border border-[#DFDCD2] bg-[#FAF9F5] flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#DFDCD2] flex items-center justify-center text-ink shrink-0 mt-0.5">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">Kunci Layar 6 Digit PIN</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {isConfigured
                        ? 'Proteksi PIN aktif pada perangkat ini.'
                        : 'Belum dikonfigurasi. Atur PIN untuk privasi lebih.'}
                    </p>
                  </div>
                </div>

                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aktif
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep('enter_new_pin')}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors"
                  >
                    Aktifkan
                  </button>
                )}
              </div>

              {/* Configure or Change PIN actions if enabled */}
              {isConfigured && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('enter_new_pin')}
                    className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-[#DFDCD2] bg-white hover:bg-[#FAF9F5] text-ink transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Ubah 6 Digit PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('verify_current_to_disable')}
                    className="px-3 py-2 text-xs font-bold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                  >
                    Matikan
                  </button>
                </div>
              )}

              {/* Biometric Authentication Section */}
              <div className="p-4 rounded-xl border border-[#DFDCD2] bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#DFDCD2] flex items-center justify-center text-emerald-700 shrink-0">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">Sidik Jari / Biometrik</h4>
                      <p className="text-xs text-muted">
                        Buka cepat dengan sensor perangkat
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.biometricEnabled}
                      disabled={!isConfigured || !biometricAvailable || isProcessing}
                      onChange={handleToggleBiometric}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-40"></div>
                  </label>
                </div>

                {!biometricAvailable && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Sensor biometrik belum terdeteksi atau tidak didukung pada peramban ini.
                  </p>
                )}
                {!isConfigured && biometricAvailable && (
                  <p className="text-[11px] text-muted italic">
                    Harap aktifkan 6 digit PIN terlebih dahulu untuk menggunakan biometrik.
                  </p>
                )}
              </div>

              {/* Auto-Lock Timeout Setting */}
              {isConfigured && (
                <div className="p-4 rounded-xl border border-[#DFDCD2] bg-white space-y-2">
                  <div className="flex items-center gap-2.5 text-ink font-bold text-sm">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Kunci Otomatis Saat Ditinggal
                  </div>
                  <p className="text-xs text-muted">
                    Waktu sebelum layar terkunci otomatis saat beralih aplikasi atau tab:
                  </p>

                  <select
                    value={config.autoLockTimeoutMinutes}
                    onChange={(e) => updateTimeout(parseInt(e.target.value, 10))}
                    className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[#DFDCD2] bg-[#FAF9F5] text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value={0}>Segera (Saat pindah tab / minimalkan aplikasi)</option>
                    <option value={1}>Setelah 1 menit di latar belakang</option>
                    <option value={5}>Setelah 5 menit di latar belakang (Rekomendasi)</option>
                    <option value={15}>Setelah 15 menit</option>
                    <option value={-1}>Hanya saat jendela browser ditutup</option>
                  </select>
                </div>
              )}

              {/* Quick Lock Now Button */}
              {isConfigured && (
                <button
                  type="button"
                  onClick={handleLockNow}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF9F5] hover:bg-[#ECE9DF] border border-[#DFDCD2] text-xs font-bold text-ink flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <Lock className="w-4 h-4 text-emerald-700" />
                  Kunci Layar Sekarang
                </button>
              )}
            </>
          ) : (
            /* PIN Setup / Verification Flow */
            <div className="space-y-4">
              <div className="text-center py-2">
                <h3 className="text-sm font-bold text-ink">
                  {step === 'enter_new_pin' && 'Masukkan 6 Digit PIN Baru'}
                  {step === 'confirm_new_pin' && 'Konfirmasi 6 Digit PIN Baru'}
                  {step === 'verify_current_to_disable' && 'Masukkan PIN Saat Ini'}
                </h3>
                <p className="text-xs text-muted mt-1">
                  {step === 'enter_new_pin' && 'Gunakan kombinasi angka yang mudah Anda ingat.'}
                  {step === 'confirm_new_pin' && 'Masukkan kembali PIN yang sama untuk verifikasi.'}
                  {step === 'verify_current_to_disable' &&
                    'Konfirmasi PIN Anda untuk menonaktifkan kunci layar.'}
                </p>
              </div>

              {/* PIN input box */}
              <div className="flex justify-center my-4">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    step === 'enter_new_pin'
                      ? newPin
                      : step === 'confirm_new_pin'
                      ? confirmPin
                      : currentPin
                  }
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    if (step === 'enter_new_pin') setNewPin(val)
                    else if (step === 'confirm_new_pin') setConfirmPin(val)
                    else setCurrentPin(val)
                    setErrorMessage('')
                  }}
                  autoFocus
                  placeholder="------"
                  className="w-48 text-center text-3xl tracking-widest font-mono font-bold py-2 border-b-2 border-emerald-600 focus:outline-none bg-transparent text-ink"
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-semibold text-rose-600 text-center flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {errorMessage}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetInternalState}
                  disabled={isProcessing}
                  className="flex-1 py-2 text-xs font-bold text-muted hover:text-ink rounded-xl border border-[#DFDCD2] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isProcessing}
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  {isProcessing
                    ? 'Memproses...'
                    : step === 'enter_new_pin'
                    ? 'Lanjut'
                    : 'Simpan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
