'use client'

import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { STORAGE_KEYS } from '@/lib/constants/site'

export function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)
    if (!consent) {
      // Delay showing the banner slightly for better UX
      const timer = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'accepted')
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto flex w-full max-w-2xl flex-col gap-4 rounded-[20px] border border-line bg-card/95 p-5 shadow-[0_20px_40px_rgba(30,50,73,0.1)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-6 animate-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div className="flex-1">
          <h3 className="mb-1.5 font-display text-lg font-bold text-ink">Privasi & Cookie</h3>
          <p className="text-xs leading-relaxed text-muted md:text-sm">
            Kami pakai cookie secukupnya biar web berjalan lancar dan bantu kami ningkatin fitur Cukupin secara anonim.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button 
            onClick={decline} 
            className="flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold text-muted transition-colors hover:bg-black/5 hover:text-ink md:flex-none"
          >
            Tolak
          </button>
          <button 
            onClick={accept} 
            className="flex flex-1 items-center justify-center rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-ink/10 transition-all hover:-translate-y-0.5 hover:bg-ink/90 md:flex-none"
          >
            Terima
          </button>
          <button 
            onClick={decline} 
            className="hidden rounded-full p-2 text-muted transition-colors hover:bg-black/5 hover:text-ink md:flex" 
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
