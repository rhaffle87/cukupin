'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share2, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'cukupin_install_prompt_dismissed_at'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if running as installed standalone PWA
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    setIsStandalone(isRunningStandalone)
    if (isRunningStandalone) return

    // Check if previously dismissed within 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < SEVEN_DAYS_MS) {
      return
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(ua)
    const isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios')

    if (isAppleDevice && isSafari) {
      setIsIOS(true)
      // Slight delay so user sees dashboard first
      const timer = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android / Chromium beforeinstallprompt handler
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true)
      return
    }

    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
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
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors"
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
                className="px-3.5 py-1.5 bg-[#1E3249] hover:bg-[#152333] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {isIOS ? (showIOSGuide ? 'Mengerti' : 'Cara Pasang') : 'Pasang Sekarang'}
              </button>
              <button
                onClick={dismiss}
                className="px-2.5 py-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
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
