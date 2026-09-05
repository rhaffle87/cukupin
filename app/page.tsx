import React from 'react'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'
import { ArrowRight, ShieldCheck, Sparkles, PieChart } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink selection:bg-green-soft selection:text-green">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-line/50 bg-paper/80 px-6 py-4 backdrop-blur-md md:px-12">
        <Brand />
        <nav className="flex items-center gap-3 md:gap-4">
          <Link href="/auth/login" className="text-sm font-semibold text-muted hover:text-ink transition-colors">
            Masuk
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center rounded-xl bg-ink px-4 py-2 text-sm font-bold !text-white shadow-lg shadow-ink/10 transition-all hover:scale-[0.98] hover:bg-ink/90 active:scale-95"
          >
            Daftar
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-24 text-center md:pb-32 md:pt-32">
          {/* Background Decorative Blur */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-soft/50 blur-[100px]" />

          <span className="mb-6 flex items-center gap-2 rounded-full border border-green/20 bg-green-soft px-4 py-1.5 text-[10px] font-bold tracking-widest text-green shadow-sm uppercase">
            <Sparkles size={12} /> Catat santai, tahu arah uangmu
          </span>

          <h1 className="max-w-4xl font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-ink md:text-[4.5rem]">
            Yang penting bukan banyaknya.<br />
            <em className="text-green not-italic">Yang penting cukup.</em>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted md:text-xl">
            Bantu kamu pantau uang masuk dan keluar tiap bulan. Simpel, santai, dan nggak bikin pusing.
          </p>

          <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row">
            <Link
              href="/auth/login"
              className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-ink px-8 text-base font-bold !text-white shadow-xl shadow-ink/15 transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0"
            >
              Coba sekarang — gratis
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-16 flex flex-col items-center justify-center gap-4 text-sm text-muted sm:flex-row sm:gap-6">
            <div className="flex -space-x-3">
              {['R', 'S', 'A', 'M'].map((letter, i) => (
                <div key={i} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-paper text-xs font-bold text-white shadow-sm ${i === 0 ? 'bg-green' : i === 1 ? 'bg-blue' : i === 2 ? 'bg-coral' : 'bg-ink'}`}>
                  {letter}
                </div>
              ))}
            </div>
            <p>
              Cocok buat kamu yang pengen <strong className="text-ink">tahu ke mana uang pergi</strong>,<br className="hidden sm:block" /> tanpa rumus atau spreadsheet yang ribet.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper px-6 py-12 text-center text-sm text-muted">
        <div className="mb-6 flex justify-center gap-6">
          <Link href="/legal/privacy" className="hover:text-ink transition-colors">Kebijakan Privasi</Link>
          <Link href="/legal/terms" className="hover:text-ink transition-colors">Syarat & Ketentuan</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} cukupin. All rights reserved.</p>
      </footer>
    </div>
  )
}
