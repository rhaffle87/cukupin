import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Home, ArrowLeft, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper text-ink selection:bg-green-soft selection:text-green">
      {/* Top Brand Bar */}
      <header className="flex w-full items-center justify-between border-b border-line/60 bg-paper/85 px-6 py-4 backdrop-blur-md md:px-12">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white font-display font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            C
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            Cukupin™<span className="text-green">.</span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-1.5 text-xs font-semibold text-ink shadow-xs hover:bg-black/5 transition-colors"
        >
          <LayoutDashboard size={14} className="text-green" />
          <span>Dashboard</span>
        </Link>
      </header>

      {/* Main 404 Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3.5 py-1 text-[11px] font-bold text-muted shadow-xs mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
            <span>Kode Galat 404 · Halaman Tersesat</span>
          </div>

          {/* Large Stylized Visual */}
          <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-3xl border border-line bg-card shadow-[0_12px_28px_rgba(30,50,73,0.06)]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-green-soft/30 via-transparent to-coral-soft/30 pointer-events-none" />
            <span className="font-display text-5xl font-extrabold tracking-tighter text-ink/80 select-none">
              4<span className="text-coral">0</span>4
            </span>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white shadow-md">
              <HelpCircle size={16} className="text-mint" />
            </div>
          </div>

          {/* Heading & Copy */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink mb-3">
            Waduh, jalurnya melenceng!
          </h1>
          <p className="text-xs sm:text-sm text-muted leading-relaxed mb-8">
            Halaman yang kamu tuju sepertinya tidak ada, sudah dipindahkan, atau kamu salah mengetik alamat URL. Jangan khawatir, saldo dan catatanmu tetap aman.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-bold !text-white shadow-sm hover:bg-ink/90 active:scale-95 transition-all"
            >
              <LayoutDashboard size={15} />
              <span>Buka Dashboard</span>
            </Link>
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-line bg-card px-5 py-2.5 text-xs font-semibold text-ink shadow-xs hover:bg-black/5 active:scale-95 transition-all"
            >
              <Home size={15} className="text-muted" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/60 py-6 text-center text-[11px] text-muted">
        <p>© {new Date().getFullYear()} Cukupin™. Catat santai, tahu arah uangmu.</p>
      </footer>
    </div>
  )
}
