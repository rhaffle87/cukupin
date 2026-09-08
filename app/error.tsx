'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log unexpected runtime client error for debugging
    console.error('[Cukupin™ App Runtime Error]:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-12 text-ink">
      <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-[0_16px_36px_rgba(30,50,73,0.06)] animate-in fade-in duration-300">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-soft text-coral shadow-xs">
          <AlertOctagon size={28} />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft/50 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral mb-3">
          Terjadi Gangguan
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-ink mb-2">
          Ups, ada kendala teknis!
        </h1>
        <p className="text-xs text-muted leading-relaxed mb-6">
          Sistem mendeteksi galat tak terduga saat memuat halaman ini. Data dan catatan keuanganmu tetap aman di penyimpanan.
        </p>

        {error.digest && (
          <div className="mb-6 rounded-xl bg-paper p-2.5 text-[10px] font-mono text-muted border border-line/60 break-all select-all">
            Kode Galat: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Coba Muat Ulang</span>
          </button>
          <Link
            href="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line bg-card px-5 py-2.5 text-xs font-semibold text-ink shadow-xs hover:bg-black/5 active:scale-95 transition-all"
          >
            <Home size={14} className="text-muted" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
