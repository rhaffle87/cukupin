'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Protected route error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral/10 text-coral mb-4">
        <AlertCircle size={24} />
      </div>
      <h2 className="font-display text-xl font-bold text-ink">Ada sedikit kendala</h2>
      <p className="mt-2 max-w-md text-sm text-muted">
        Gagal memuat data keuanganmu. Coba segarkan halaman atau klik tombol di bawah.
      </p>
      <button
        onClick={() => reset()}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-ink/90 transition-all active:scale-95"
      >
        <RefreshCw size={14} /> Coba lagi
      </button>
    </div>
  )
}
