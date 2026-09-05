'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Coins,
  FileSpreadsheet,
  HeartHandshake,
  Lock,
  PieChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Apakah Cukupin benar-benar gratis?',
      a: 'Ya, Cukupin 100% gratis digunakan tanpa biaya langganan, tanpa masa percobaan berbayar, dan tanpa fitur tersembunyi. Kamu bisa langsung menggunakan semua fitur tanpa batas.',
    },
    {
      q: 'Apakah Cukupin meminta akses ke rekening bank saya?',
      a: 'Tidak sama sekali. Cukupin tidak meminta nomor rekening, PIN, atau kata sandi bank. Kamu mencatat pengeluaran secara mandiri demi keamanan dan privasi penuh.',
    },
    {
      q: 'Apa itu fitur Budget Harian Aman?',
      a: 'Budget Harian Aman membagi sisa saldomu dengan sisa hari dalam bulan berjalan secara otomatis, sehingga kamu langsung tahu batas uang yang aman dibelanjakan tiap hari.',
    },
    {
      q: 'Apakah Cukupin bisa digunakan di smartphone?',
      a: 'Bisa. Cukupin adalah Progressive Web App (PWA) yang bisa langsung dipasang di ponsel Android maupun iPhone tanpa perlu unduh dari App Store yang berat.',
    },
    {
      q: 'Bagaimana keamanan data keuangan saya?',
      a: 'Semua data transaksi dan akunmu dienkripsi menggunakan standar keamanan cloud modern dengan aturan proteksi data ketat. Data tidak dijual ke pihak ketiga.',
    },
    {
      q: 'Bisakah saya mengekspor data pengeluaran?',
      a: 'Bisa. Kamu bisa mengunduh riwayat transaksi dan format buku kas bulanan ke dalam format PDF siap cetak atau file CSV untuk dibuka di spreadsheet kapan saja.',
    },
  ]

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-green-soft selection:text-green">
      <JsonLd />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-line/60 bg-paper/85 px-6 py-3.5 backdrop-blur-md md:px-12">
        <Brand />
        <nav className="hidden items-center gap-6 text-xs font-semibold text-muted md:flex" aria-label="Navigasi Utama">
          <a href="#masalah" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Masalah</a>
          <a href="#fitur" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Fitur</a>
          <a href="#perbandingan" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Perbandingan</a>
          <a href="#faq" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Tanya Jawab</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-xs font-bold text-muted hover:text-ink transition-colors px-2 py-1 focus-visible:ring-2 focus-visible:ring-green rounded-md">
            Masuk
          </Link>
          <Link
            href="/auth/login"
            className="flex items-center justify-center rounded-xl bg-ink px-4 py-2 text-xs font-bold !text-white shadow-sm transition-all hover:bg-ink/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-green"
          >
            Mulai Sekarang
          </Link>
        </div>
      </header>

      {/* Hero Section with AEO Extraction Block */}
      <section className="relative overflow-hidden px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-soft/60 blur-[100px] md:h-[520px] md:w-[520px]" />

        <div className="mx-auto max-w-4xl flex flex-col items-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green/20 bg-green-soft px-3.5 py-1 text-[11px] font-bold tracking-widest text-green uppercase shadow-xs transition-transform hover:scale-105">
            <Sparkles size={13} /> Catat santai, tahu arah uangmu
          </span>

          <h1 className="font-display text-[2.35rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-[3.25rem] md:text-[3.85rem] lg:text-[4.2rem]">
            Yang penting bukan banyaknya.<br />
            <em className="text-green not-italic">Yang penting cukup.</em>
          </h1>

          {/* AEO Extraction Sentence (Strictly 25-40 words for AI citations & SERP snippets) */}
          <blockquote className="my-6 max-w-2xl rounded-2xl border border-green/25 bg-green-soft/40 px-5 py-4 text-left text-xs sm:text-sm leading-relaxed text-ink shadow-xs">
            <strong className="block text-[11px] uppercase tracking-wider text-green font-bold mb-1">
              Tentang Cukupin
            </strong>
            Cukupin adalah aplikasi pencatat keuangan harian gratis yang dirancang santai dan sederhana untuk memantau uang masuk, pengeluaran harian, dan budget aman tanpa rumus rumit atau integrasi bank yang membingungkan.
          </blockquote>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-2">
            <Link
              href="/auth/login"
              className="group flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-ink px-7 text-sm font-bold !text-white shadow-xl shadow-ink/15 transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-green"
            >
              Coba Sekarang, Gratis
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a
              href="#cara-kerja"
              className="group flex h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-card px-6 text-sm font-bold text-ink transition-all hover:bg-paper active:scale-98 focus-visible:ring-2 focus-visible:ring-green"
            >
              Lihat Cara Kerja
              <ArrowDown size={14} className="text-muted transition-transform duration-200 group-hover:translate-y-0.5" />
            </a>
          </div>

          {/* Micro Social Proof & Security Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <ShieldCheck size={16} className="text-green" /> 100% Gratis & Tanpa Iklan
            </span>
            <span className="text-line">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Lock size={15} className="text-blue" /> Tanpa Akses Rekening Bank
            </span>
            <span className="text-line">•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Smartphone size={15} className="text-coral" /> Bisa di HP & Laptop (PWA)
            </span>
          </div>
        </div>
      </section>

      {/* Problem Section (PAS Framework: Problem & Agitate) */}
      <section id="masalah" className="border-t border-line/60 bg-paper px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">MASALAH UMUM</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              Kenapa atur uang sering bikin malas dan pusing?
            </h2>
            <p className="mt-3 text-sm text-muted">
              Hampir semua orang punya niat mengatur keuangan. Tapi mayoritas berhenti di tengah jalan bukan karena tidak disiplin, melainkan karena sistem yang dipakai terlalu merepotkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-[20px] border border-line bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft text-coral font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Aplikasi Lain Terlalu Ribet</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Minta akses mutasi bank, verifikasi kode OTP berulang kali, dan punya puluhan menu kompleks yang sebenarnya nggak pernah kamu butuhkan.
              </p>
            </div>

            <div className="rounded-[20px] border border-line bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft text-coral font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Takut Cek Saldo Akhir Bulan</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Merasa nggak beli barang aneh-aneh, tapi uang gaji tiba-tiba habis begitu saja karena kebocoran halus harian yang tidak sempat terpantau.
              </p>
            </div>

            <div className="rounded-[20px] border border-line bg-card p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft text-coral font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Spreadsheet Melelahkan</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Niat awal pakai Excel atau Notion rapi. Tapi begitu harus buka laptop dan ketik rumus cuma buat segelas es kopi, niat itu langsung menguap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section (The Bridge) */}
      <section className="border-t border-line/60 bg-white/[0.4] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[28px] border border-line bg-ink p-8 md:p-14 text-white relative overflow-hidden">
            <div className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full border border-white/10" />
            <div className="relative z-10 max-w-xl">
              <p className="text-[10px] font-bold tracking-widest text-[#B9C6BD] uppercase">SOLUSI CUKUPIN</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Cukup catat sebentar.<br />
                <em className="text-[#BEE6CF] not-italic">Tahu batas amanmu tiap hari.</em>
              </h2>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#C0CBC4]">
                Cukupin membuang semua kerumitan finansial yang berlebihan. Kamu hanya perlu mencatat apa yang keluar dan masuk, lalu sistem otomatis memberi tahu berapa budget aman yang boleh kamu belanjakan hari ini.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-ink shadow-md transition-all hover:bg-[#F0F1EA] active:scale-95 focus-visible:ring-2 focus-visible:ring-green"
                >
                  Mulai Sekarang Gratis <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features as Benefits */}
      <section id="fitur" className="border-t border-line/60 bg-paper px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">FITUR UTAMA</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              Dibuat praktis untuk rutinitas harianmu
            </h2>
            <p className="mt-3 text-sm text-muted">
              Fitur yang benar-benar kamu gunakan setiap hari, tanpa gimmick dan tanpa tombol berlebihan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Feature 1 */}
            <div className="rounded-[22px] border border-line bg-card p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-soft text-green mb-4">
                <Zap size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Deteksi Kategori Otomatis</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Ketik "kopi", "makan siang", atau "bensin", kategori langsung terpilih otomatis. Kamu selesai mencatat dalam 3 detik tanpa perlu scroll menu panjang.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-[22px] border border-line bg-card p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-soft text-blue mb-4">
                <Wallet size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Budget Harian Aman (Daily Safe Spend)</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Menghitung sisa saldo dibagi sisa hari di bulan ini secara otomatis. Kamu langsung tahu batas maksimal belanja hari ini agar tidak kehabisan uang di akhir bulan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-[22px] border border-line bg-card p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-soft text-coral mb-4">
                <PieChart size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Pola Pengeluaran 50/30/20</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Memisahkan pos kebutuhan pokok (makan, tagihan, transportasi) dengan pos keinginan gaya hidup agar pengeluaran tetap terkontrol tanpa merasa tersiksa.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-[22px] border border-line bg-card p-6 shadow-xs transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-soft text-green mb-4">
                <Coins size={20} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">Wishlist Anti-Belanja Impulsif</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Tampung barang yang pengen kamu beli di wishlist dulu. Tunda beberapa hari agar kamu bisa berpikir jernih sebelum checkout barang yang sebenarnya tidak perlu.
              </p>
            </div>

            {/* Feature 5 (Full Width) */}
            <div className="md:col-span-2 rounded-[22px] border border-line bg-card p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="max-w-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-soft text-blue mb-4">
                  <FileSpreadsheet size={20} />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-ink">
                  Format Laporan Bulanan Siap Cetak & PDF
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Butuh rekapitulasi rapi untuk arsip pribadi atau evaluasi keuangan bersama pasangan? Ekspor laporan bulanan lengkap dengan running total ke PDF bersih atau file CSV kapan saja.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="shrink-0 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold !text-white hover:bg-ink/90 active:scale-95 transition-all"
              >
                Coba Fiturnya Sekarang
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="border-t border-line/60 bg-white/[0.5] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">CARA KERJA</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              Tiga langkah santai menuju keuangan yang tenang
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-start rounded-2xl border border-line bg-card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white mb-4">
                1
              </span>
              <h3 className="font-display text-base font-bold text-ink">Catat dalam 3 Detik</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Buka Cukupin dari home screen HP. Masukkan nominal dan nama pengeluaran saat kamu baru saja selesai transaksi.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-line bg-card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green text-xs font-bold text-white mb-4">
                2
              </span>
              <h3 className="font-display text-base font-bold text-ink">Lihat Budget Harian Aman</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Dashboard langsung menghitung sisa saldo dan batas belanja aman per hari secara real-time.
              </p>
            </div>

            <div className="flex flex-col items-start rounded-2xl border border-line bg-card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue text-xs font-bold text-white mb-4">
                3
              </span>
              <h3 className="font-display text-base font-bold text-ink">Santai Sampai Akhir Bulan</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Nggak ada lagi kepanikan tanggal tua. Kamu selalu tahu posisi keuanganmu dengan tenang dan terkendali.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Comparison Table */}
      <section id="perbandingan" className="border-t border-line/60 bg-paper px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">PERBANDINGAN JUJUR</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              Bagaimana Cukupin dibanding alternatif lain?
            </h2>
            <p className="mt-3 text-sm text-muted">
              Kami percaya transparansi. Ini perbedaan nyata antara Cukupin, aplikasi perbankan konvensional, dan catatan manual di Excel.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-line bg-card shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-paper/80">
                  <th scope="col" className="p-4 font-bold text-ink">Kriteria</th>
                  <th scope="col" className="p-4 font-bold text-green bg-green-soft/40">Cukupin</th>
                  <th scope="col" className="p-4 font-bold text-muted">Aplikasi Bank & Fintech</th>
                  <th scope="col" className="p-4 font-bold text-muted">Excel & Buku Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink text-left">Biaya Aplikasi</th>
                  <td className="p-4 text-green font-bold bg-green-soft/20">100% Gratis & Tanpa Iklan</td>
                  <td className="p-4 text-muted">Gratis dengan iklan atau langganan</td>
                  <td className="p-4 text-muted">Gratis</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink text-left">Akses Rekening & OTP</th>
                  <td className="p-4 text-green font-bold bg-green-soft/20">Tidak Butuh (Privasi Penuh)</td>
                  <td className="p-4 text-coral">Wajib hubung akun bank & OTP</td>
                  <td className="p-4 text-muted">Tidak Butuh</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink text-left">Kecepatan Catat Harian</th>
                  <td className="p-4 text-green font-bold bg-green-soft/20">&lt; 3 Detik (Auto Kategori)</td>
                  <td className="p-4 text-muted">Lambat (Banyak menu)</td>
                  <td className="p-4 text-muted">Repot (Perlu buka laptop)</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink text-left">Fitur Budget Aman Harian</th>
                  <td className="p-4 text-green font-bold bg-green-soft/20">Tersedia Otomatis</td>
                  <td className="p-4 text-muted">Jarang Ada</td>
                  <td className="p-4 text-muted">Harus bikin rumus manual</td>
                </tr>
                <tr>
                  <th scope="row" className="p-4 font-semibold text-ink text-left">Sinkronisasi Otomatis Bank</th>
                  <td className="p-4 text-muted bg-green-soft/20">
                    Tidak ada <span className="text-[10px] text-muted block font-normal">(Mengutamakan kesadaran mencatat mandiri)</span>
                  </td>
                  <td className="p-4 text-green font-semibold">Ada otomatis</td>
                  <td className="p-4 text-muted">Tidak ada</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <section className="border-t border-line/60 bg-white/[0.4] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">TESTIMONI PENGGUNA</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              Cerita santai dari mereka yang sudah mencoba
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <p className="text-xs leading-relaxed text-ink italic">
                "Dulu malas banget catat pengeluaran karena aplikasi lain ribet harus bikin akun berbelit-belit. Di Cukupin tampilannya adem, cepet, dan nggak ada iklan sama sekali."
              </p>
              <div className="mt-4 pt-4 border-t border-line/60">
                <strong className="block text-xs font-bold text-ink">Dian P.</strong>
                <small className="text-[10px] text-muted">Freelance Illustrator, Bandung</small>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <p className="text-xs leading-relaxed text-ink italic">
                "Fitur Budget Harian Aman beneran nolong banget buat saya. Begitu tahu sisa budget harian Rp 45 ribu, langsung otomatis ngerem jajan yang nggak penting."
              </p>
              <div className="mt-4 pt-4 border-t border-line/60">
                <strong className="block text-xs font-bold text-ink">Rizky A.</strong>
                <small className="text-[10px] text-muted">Product Specialist, Jakarta</small>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-card p-6 shadow-xs flex flex-col justify-between">
              <p className="text-xs leading-relaxed text-ink italic">
                "Wishlist-nya ngebantu banget nahan godaan flash sale marketplace. Barang yang masuk wishlist ternyata 80% nggak beneran saya butuhin."
              </p>
              <div className="mt-4 pt-4 border-t border-line/60">
                <strong className="block text-xs font-bold text-ink">Sarah N.</strong>
                <small className="text-[10px] text-muted">Mahasiswi, Surabaya</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section with Schema-ready items */}
      <section id="faq" className="border-t border-line/60 bg-paper px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">PERTANYAAN UMUM</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-ink">
              Ada yang ingin kamu tanyakan?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Jawaban singkat dan jelas seputar cara kerja, privasi, dan fitur Cukupin.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border border-line bg-card overflow-hidden transition-colors shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left text-xs sm:text-sm font-bold text-ink focus-visible:outline-none"
                  aria-expanded={openFaq === i}
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-muted transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180 text-green' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs sm:text-sm leading-relaxed text-muted border-t border-line/40 pt-3 animate-in fade-in duration-200">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="border-t border-line/60 bg-paper px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-[28px] bg-ink p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl">
            {/* Background Rings */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 shadow-[0_0_0_40px_rgba(255,255,255,0.02)]" />

            <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#BEE6CF] uppercase">
                MULAI HARI INI
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Nggak perlu nunggu awal bulan buat mulai tenang soal uang.
              </h2>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#C0CBC4] max-w-md">
                Catat santai pengeluaran pertamamu sekarang. Gratis, tanpa perlu sambung rekening, dan langsung bisa dipakai dalam hitungan detik.
              </p>
              <Link
                href="/auth/login"
                className="mt-8 group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-8 text-sm font-bold text-ink shadow-lg transition-all hover:bg-[#F0F1EA] active:scale-95 focus-visible:ring-2 focus-visible:ring-green"
              >
                Coba Cukupin Sekarang, Gratis
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="border-t border-line/60 bg-paper px-6 py-10 md:px-12 text-xs text-muted">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Brand compact />
            <p className="text-[11px] text-muted mt-1">
              Catat santai, tahu arah uangmu. Tanpa rumus rumit.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#masalah" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Masalah</a>
            <a href="#fitur" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Fitur</a>
            <a href="#perbandingan" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Perbandingan</a>
            <a href="#faq" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">FAQ</a>
            <Link href="/legal/privacy" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Kebijakan Privasi</Link>
            <Link href="/legal/terms" className="hover:text-ink transition-colors focus-visible:ring-2 focus-visible:ring-green rounded-md px-1">Syarat & Ketentuan</Link>
          </div>
        </div>
        <div className="mx-auto max-w-5xl mt-8 pt-6 border-t border-line/40 text-center sm:text-left text-[11px] text-muted flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>&copy; {new Date().getFullYear()} cukupin. Hak cipta dilindungi.</p>
          <p className="text-[10px]">Pencatatan keuangan mandiri tanpa repot.</p>
        </div>
      </footer>
    </div>
  )
}
