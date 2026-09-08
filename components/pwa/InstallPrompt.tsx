'use client'

/**
 * PWA Install Prompt Banner
 *
 * Prompts eligible mobile/desktop users to install Cukupin as a standalone PWA.
 *
 * Frequency Constraint:
 * - Pops up AT MOST 1 time every week (7-day cooldown enforced via localStorage).
 * - Immediately records display timestamp upon appearance so page transitions do NOT re-trigger it.
 * - Suppressed permanently if installed or running in standalone mode.
 *
 * Note: Strictly NO raw unicode emojis.
 */

import { useEffect, useState } from 'react'
import { Download, X, Share2, Smartphone } from 'lucide-react'

export const INSTALL_PROMPT_LAST_SHOWN_KEY = 'cukupin_install_prompt_last_shown_at'
export const INSTALL_PROMPT_DISMISS_KEY = 'cukupin_install_prompt_dismissed_at'
export const INSTALL_PROMPT_INSTALLED_KEY = 'cukupin_pwa_installed'
export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Safely detect if running as an installed standalone PWA across browsers/environments
 */
export function checkIsRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const mediaMatches =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(display-mode: standalone)')?.matches

    const navStandalone =
      (window.navigator as unknown as { standalone?: boolean })?.standalone === true

    const isAndroidApp =
      typeof document !== 'undefined' &&
      Boolean(document.referrer?.includes('android-app://'))

    return Boolean(mediaMatches || navStandalone || isAndroidApp)
  } catch {
    return false
  }
}

/**
 * Evaluates whether the install prompt is eligible to pop up.
 * Returns true only if at least 7 days have elapsed since it was last shown or dismissed.
 */
export function shouldShowInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false

  // 1. Check if running as installed standalone PWA
  if (checkIsRunningStandalone()) return false

  // 2. Check if already marked as installed
  if (localStorage.getItem(INSTALL_PROMPT_INSTALLED_KEY) === 'true') {
    return false
  }

  // 3. Enforce 7-day cooldown from either last shown or last dismissed
  const lastShownStr = localStorage.getItem(INSTALL_PROMPT_LAST_SHOWN_KEY)
  const dismissedStr = localStorage.getItem(INSTALL_PROMPT_DISMISS_KEY)

  const lastShownAt = lastShownStr ? parseInt(lastShownStr, 10) : 0
  const dismissedAt = dismissedStr ? parseInt(dismissedStr, 10) : 0
  const mostRecentTimestamp = Math.max(lastShownAt, dismissedAt)

  if (mostRecentTimestamp > 0 && Date.now() - mostRecentTimestamp < SEVEN_DAYS_MS) {
    return false
  }

  return true
}

/**
 * Record that the install prompt has been presented to the user
 */
export function recordInstallPromptShown(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, Date.now().toString())
}

/**
 * Record that the install prompt was dismissed by the user
 */
export function recordInstallPromptDismissed(): void {
  if (typeof window === 'undefined') return
  const nowStr = Date.now().toString()
  localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, nowStr)
  localStorage.setItem(INSTALL_PROMPT_DISMISS_KEY, nowStr)
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Quick initial check for 7-day frequency gate
    if (!shouldShowInstallPrompt()) {
      return
    }

    const runningStandalone = checkIsRunningStandalone()
    setIsStandalone(runningStandalone)
    if (runningStandalone) return

    // Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(ua)
    const isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios')

    if (isAppleDevice && isSafari) {
      setIsIOS(true)
      // Slight delay so user sees dashboard first
      const timer = setTimeout(() => {
        if (shouldShowInstallPrompt()) {
          setVisible(true)
          recordInstallPromptShown()
        }
      }, 3000)
      return () => clearTimeout(timer)
    }

    // Android / Chromium beforeinstallprompt handler
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      if (shouldShowInstallPrompt()) {
        setVisible(true)
        recordInstallPromptShown()
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    recordInstallPromptDismissed()
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
      localStorage.setItem(INSTALL_PROMPT_INSTALLED_KEY, 'true')
    } else {
      dismiss()
    }
    setDeferredPrompt(null)
  }

  if (!visible || isStandalone) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-[#F7F6F0] border border-[#E8E7E0] rounded-2xl shadow-xl p-4 text-[#1E3249] overflow-hidden">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3E8F68] via-[#BEE6CF] to-[#1E3249]" />

        <button
          onClick={dismiss}
          aria-label="Tutup promo pemasangan"
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E7E0] flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5 text-[#3E8F68]" />
          </div>

          <div className="flex-1 pr-4">
            <div className="text-xs font-mono font-semibold tracking-wider text-[#3E8F68] uppercase">
              PWA Cukupin™
            </div>
            <h4 className="font-serif font-bold text-sm text-[#1E3249] mt-0.5">
              Pasang di Layar Utama
            </h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Catat keuangan lebih cepat, bekerja offline, dan tanpa download dari app store.
            </p>

            {showIOSGuide && (
              <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-[#E8E7E0] text-[11px] text-stone-700 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1E3249]">1.</span> Ketuk ikon Bagikan{' '}
                  <Share2 className="w-3.5 h-3.5 text-[#315DCB] inline mx-0.5" /> di bilah bawah Safari.
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#1E3249]">2.</span> Gulir ke bawah, pilih{' '}
                  <span className="font-semibold text-[#1E3249]">"Tambah ke Layar Utama"</span>.
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 bg-[#1E3249] hover:bg-[#152333] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {isIOS ? (showIOSGuide ? 'Mengerti' : 'Cara Pasang') : 'Pasang Sekarang'}
              </button>
              <button
                onClick={dismiss}
                className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
