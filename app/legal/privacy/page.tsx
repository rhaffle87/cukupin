import React from 'react'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileCheck2,
  Globe2,
  Lock,
  Mail,
  Scale,
  Server,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi - Cukupin',
  description: 'Kebijakan Privasi Cukupin. Komitmen perlindungan data pribadi sesuai UU PDP No. 27 Tahun 2022 dan prinsip GDPR. Tanpa akses rekening, tanpa penjualan data.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = '6 September 2026'

  const tocItems = [
    { id: 'landasan-hukum', title: '1. Landasan Hukum & Komitmen' },
    { id: 'data-yang-dikumpulkan', title: '2. Kategori Data yang Kami Kumpulkan' },
    { id: 'tujuan-pemrosesan', title: '3. Tujuan Pemrosesan Data' },
    { id: 'keamanan-data', title: '4. Lokasi, Keamanan & Enkripsi Data' },
    { id: 'pihak-ketiga', title: '5. Kebijakan Pihak Ketiga (Zero Data Sale)' },
    { id: 'hak-pengguna', title: '6. Hak Subjek Data (Hak Penuh Anda)' },
    { id: 'kuki-dan-analitik', title: '7. Kuki & Analitik Privasi' },
    { id: 'retensi-penghapusan', title: '8. Retensi & Penghapusan Permanen' },
    { id: 'privasi-anak', title: '9. Perlindungan Privasi Anak' },
    { id: 'perubahan-kebijakan', title: '10. Pembaruan Kebijakan' },
    { id: 'kontak-dpo', title: '11. Kontak Petugas Pelindungan Data (DPO)' },
  ]

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-green-soft selection:text-green">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Brand />
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/legal/terms"
              className="hidden sm:inline-flex text-muted hover:text-ink transition-colors"
            >
              Syarat & Ketentuan
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card px-3.5 py-2 text-ink shadow-2xs transition-all hover:bg-paper active:scale-95"
            >
              <ArrowLeft size={14} /> Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-line/60 bg-gradient-to-b from-card to-paper px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green-soft px-3.5 py-1 text-[10px] font-bold tracking-widest text-green uppercase mb-4">
            <ShieldCheck size={14} /> DOKUMEN HUKUM & PRIVASI · VERSI 1.2
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink leading-tight">
            Kebijakan Privasi Cukupin
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Data keuangan harian adalah informasi yang sangat personal. Kami merancang Cukupin dengan arsitektur <em>privacy-first</em>: tanpa meminta akses rekening bank, tanpa menghubungkan mutasi, dan tanpa pernah menjual data Anda kepada pihak ketiga.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-medium text-ink shadow-2xs">
              <Clock size={13} className="text-green" /> Pembaruan Terakhir: {lastUpdated}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-medium text-ink shadow-2xs">
              <Scale size={13} className="text-blue" /> Sesuai UU PDP No. 27/2022
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-medium text-ink shadow-2xs">
              <Globe2 size={13} className="text-green" /> Kompatibel Prinsip GDPR
            </span>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="mx-auto max-w-5xl mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-soft text-green mb-3">
              <Lock size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Tanpa Akses Bank</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Kami tidak pernah meminta nomor rekening, PIN, username e-banking, atau kode OTP perbankan Anda.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-soft text-blue mb-3">
              <Database size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Enkripsi Berlapis</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Data terisolasi dengan Row Level Security (RLS) di cloud Supabase dan dilindungi enkripsi transit TLS 1.3.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-soft text-coral mb-3">
              <CheckCircle2 size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Zero Data Sale</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Data transaksi dan pola belanja Anda 100% milik Anda. Tidak pernah diperjualbelikan kepada pengiklan mana pun.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-soft text-green mb-3">
              <Download size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Hak Portabilitas Penuh</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Unduh cadangan data Anda dalam format JSON, CSV, atau PDF kapan saja, dan hapus akun permanen dalam 1 klik.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Sticky Table of Contents (Desktop Sidebar) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 rounded-2xl border border-line bg-card p-6 shadow-2xs space-y-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-slate uppercase">DAFTAR ISI</p>
              <h2 className="font-display text-base font-bold text-ink mt-1">Navigasi Pasal</h2>
            </div>
            <nav className="space-y-1.5 text-xs">
              {tocItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg px-2.5 py-1.5 text-muted hover:bg-paper hover:text-ink transition-colors font-medium"
                >
                  {item.title}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-line/60">
              <div className="rounded-xl border border-green/30 bg-green-soft/40 p-3.5 text-[11px] text-muted">
                <strong className="block font-bold text-ink text-xs mb-1">Butuh Bantuan Privasi?</strong>
                Hubungi Petugas Pelindungan Data kami melalui email resmi:
                <a
                  href="mailto:privasi@cukupin.app"
                  className="mt-2 inline-flex items-center gap-1.5 font-bold text-green hover:underline"
                >
                  <Mail size={13} /> privasi@cukupin.app
                </a>
              </div>
            </div>
          </aside>

          {/* Detailed Legal Content */}
          <main className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-ink/90">
            
            {/* Section 1 */}
            <section id="landasan-hukum" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Scale size={16} /> PASAL 1
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                1. Landasan Hukum & Komitmen Kedaulatan Data
              </h2>
              <p>
                Kebijakan Privasi ini disusun sebagai bentuk transparansi dan kepatuhan hukum Cukupin (selanjutnya disebut &ldquo;<strong>Kami</strong>&rdquo; atau &ldquo;<strong>Layanan</strong>&rdquo;) terhadap peraturan perundang-undangan yang berlaku di Republik Indonesia, khususnya:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>
                  <strong className="text-ink">Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong>.
                </li>
                <li>
                  <strong className="text-ink">Undang-Undang Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE)</strong> beserta perubahannya.
                </li>
                <li>
                  Prinsip-prinsip perlindungan data global seperti <em>General Data Protection Regulation</em> (GDPR) dalam hal hak portabilitas dan hak penghapusan data.
                </li>
              </ul>
              <p>
                Kami bertindak sebagai <strong>Pengendali Data Pribadi (Data Controller)</strong> untuk data akun yang Anda daftarkan, dan memastikan seluruh aktivitas pemrosesan dilakukan secara sah, patut, transparan, dan terbatas pada tujuan yang telah disetujui.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-yang-dikumpulkan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Database size={16} /> PASAL 2
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                2. Kategori Data Pribadi yang Kami Kumpulkan
              </h2>
              <p>
                Cukupin menerapkan asas <strong>Minimalisasi Data (Data Minimization)</strong>. Kami hanya mengumpulkan data yang mutlak diperlukan untuk mengoperasikan fungsi aplikasi:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-line bg-paper/60 p-4">
                  <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
                    A. Data Identitas Akun (Wajib untuk Autentikasi)
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Alamat email dan kata sandi terenkripsi (di-hash menggunakan algoritma <em>bcrypt / argon2</em> oleh penyedia autentikasi Supabase). Kami tidak pernah menyimpan atau dapat membaca kata sandi Anda dalam bentuk teks terbuka (plain-text).
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-paper/60 p-4">
                  <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
                    B. Data Finansial Mandiri (Diinput Sendiri oleh Pengguna)
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Catatan nominal transaksi, kategori (misal: Makanan, Transportasi, Tagihan), deskripsi catatan, tanggal transaksi, metode pembayaran (opsional), target tabungan, dan daftar keinginan (wishlist).
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-paper/60 p-4">
                  <h4 className="font-display text-xs font-bold text-ink uppercase tracking-wide">
                    C. Data Teknis & Sesi (PWA & Kuki)
                  </h4>
                  <p className="mt-1 text-xs text-muted leading-relaxed">
                    Token otentikasi sesi (JWT) yang disimpan di local storage peramban Anda, status preferensi kuki, serta data analitik anonim (seperti jenis peramban dan kode negara) untuk memantau stabilitas sistem tanpa mengidentifikasi individu pengguna.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-coral/30 bg-coral-soft/40 p-4 text-xs">
                <strong className="block font-bold text-coral mb-1">Data yang TIDAK PERNAH Kami Minta atau Kumpulkan:</strong>
                Nomor kartu kredit/debit, kode CVV, username/PIN internet banking, kode OTP bank, saldo mutasi rekening bank otomatis, maupun data biometrik.
              </div>
            </section>

            {/* Section 3 */}
            <section id="tujuan-pemrosesan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <FileCheck2 size={16} /> PASAL 3
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                3. Tujuan Pemrosesan Data Pribadi
              </h2>
              <p>Data pribadi Anda diproses secara eksklusif untuk tujuan-tujuan berikut:</p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-muted">
                <li>
                  <strong className="text-ink">Penyediaan Layanan Inti:</strong> Melakukan kalkulasi matematis otomatis seperti <em>Budget Harian Aman (Daily Safe Spend)</em>, pembagian rasio anggaran 50/30/20, serta agregasi laporan bulanan.
                </li>
                <li>
                  <strong className="text-ink">Sinkronisasi Antar-Perangkat:</strong> Memungkinkan catatan pengeluaran Anda dapat diakses secara sinkron saat membuka Cukupin di peramban ponsel, tablet, maupun desktop.
                </li>
                <li>
                  <strong className="text-ink">Pencegahan Penyalahgunaan & Keamanan:</strong> Memverifikasi identitas pengguna saat masuk serta mencegah serangan brute-force dan aktivitas bot berbahaya.
                </li>
                <li>
                  <strong className="text-ink">Pemeliharaan & Peningkatan Kinerja:</strong> Mendiagnosis bug, menguji kecepatan rendering laporan, dan memastikan fitur Progressive Web App (PWA) bekerja optimal secara offline.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="keamanan-data" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Server size={16} /> PASAL 4
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                4. Lokasi Penyimpanan & Standar Keamanan Data
              </h2>
              <p>
                Kami menerapkan standar pengamanan teknis dan organisasional tingkat industri untuk melindungi data dari kebocoran, akses tanpa hak, atau manipulasi:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <strong className="block text-ink font-bold mb-1">Row Level Security (RLS)</strong>
                  Database PostgreSQL kami mengonfigurasi isolasi berbasis RLS. Setiap catatan transaksi hanya dapat dibaca dan dimodifikasi oleh pengguna pemilik token yang bersangkutan.
                </div>
                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <strong className="block text-ink font-bold mb-1">Enkripsi Transit TLS 1.3</strong>
                  Seluruh komunikasi data antara peramban Anda dan server Cukupin dilindungi enkripsi HTTPS menggunakan sertifikat TLS modern berderajat tinggi.
                </div>
                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <strong className="block text-ink font-bold mb-1">Infrastruktur Terpercaya</strong>
                  Data disimpan pada cloud database bersertifikasi SOC 2 Type II dan ISO 27001 (Supabase Inc.) dengan replikasi berkala dan proteksi firewall ketat.
                </div>
                <div className="rounded-xl border border-line bg-paper/50 p-4">
                  <strong className="block text-ink font-bold mb-1">Kemandirian Offline (PWA)</strong>
                  Saat beroperasi offline, data disimpan di IndexedDB / LocalStorage perangkat Anda sendiri tanpa dikirim ke jaringan luar sampai koneksi pulih.
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="pihak-ketiga" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <ShieldCheck size={16} /> PASAL 5
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                5. Kebijakan Pihak Ketiga & Jaminan Tanpa Penjualan Data
              </h2>
              <div className="rounded-xl border border-green/40 bg-green-soft/40 p-4 text-xs text-ink font-medium">
                <strong>Prinsip Utama:</strong> Kami tidak pernah menjual, menyewakan, memonetisasi, atau meminjamkan data pribadi dan catatan keuangan Anda kepada pihak ketiga mana pun untuk keperluan pemasaran atau periklanan.
              </div>
              <p>
                Data Anda hanya dapat diproses oleh penyedia layanan infrastruktur (Sub-processors) yang terikat kontrak kepatuhan privasi yang ketat:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>
                  <strong className="text-ink">Supabase Inc.</strong>: Penyedia database terenkripsi, penyimpanan aman, dan autentikasi pengguna.
                </li>
                <li>
                  <strong className="text-ink">Vercel Inc.</strong>: Penyedia hosting aplikasi web dan jaringan pengiriman konten (CDN) dengan analitik berbasis privasi tanpa pelacakan identitas individu.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="hak-pengguna" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <UserCheck size={16} /> PASAL 6
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                6. Hak Subjek Data Pribadi (Hak Anda)
              </h2>
              <p>
                Sesuai Bab VI UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi dan standar internasional GDPR, Anda memiliki hak-hak yang dijamin penuh:
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-green-soft text-green flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                  <p><strong className="text-ink">Hak Akses & Transparansi:</strong> Anda berhak melihat seluruh catatan transaksi, target, dan profil akun Anda secara langsung di dalam aplikasi.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-green-soft text-green flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                  <p><strong className="text-ink">Hak Pembetulan (Koreksi):</strong> Anda berhak mengubah atau mengoreksi data keuangan maupun nominal pengeluaran yang keliru sewaktu-waktu.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-green-soft text-green flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                  <p><strong className="text-ink">Hak Portabilitas Data:</strong> Anda berhak mengunduh seluruh data historis Anda dalam format terbuka seperti CSV, JSON, atau PDF melalui menu Transaksi dan Laporan.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-green-soft text-green flex items-center justify-center font-bold shrink-0 text-[10px]">4</span>
                  <p><strong className="text-ink">Hak Penghapusan (Right to Erasure):</strong> Anda berhak meminta penghapusan akun dan pemusnahan seluruh data terkait secara permanen dari server kami.</p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="kuki-dan-analitik" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Globe2 size={16} /> PASAL 7
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                7. Kuki (Cookies) & Kebijakan Analitik
              </h2>
              <p>
                Cukupin menggunakan kuki seminimal mungkin:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>
                  <strong className="text-ink">Kuki Esensial (Wajib):</strong> Digunakan semata-mata untuk menyimpan status masuk (session token) dan preferensi antarmuka pengguna. Tanpa kuki ini, Anda tidak dapat mengakses akun Anda.
                </li>
                <li>
                  <strong className="text-ink">Kuki Analitik (Opsional):</strong> Kami menggunakan Vercel Analytics yang mengumpulkan metrik performa secara teragregasi tanpa menyimpan alamat IP permanen atau pengenal lintas-situs (cross-site trackers). Anda dapat menerima atau menolak kuki analitik melalui banner persetujuan di situs web kami.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="retensi-penghapusan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Clock size={16} /> PASAL 8
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                8. Retensi dan Pemusnahan Data
              </h2>
              <p>
                Kami menyimpan data Anda selama akun Anda berstatus aktif. Jika Anda memutuskan untuk menghapus akun Anda:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-muted">
                <li>Seluruh transaksi, wishlist, dan target tabungan akan dihapus secara permanen dari database utama kami dalam waktu maksimal 14 (empat belas) hari kerja.</li>
                <li>Cadangan sistem berkala (automated backups) akan menimpa data yang telah dihapus dalam siklus rotasi penyimpanan maksimum 30 (tiga puluh) hari kalender.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="privasi-anak" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <ShieldCheck size={16} /> PASAL 9
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                9. Perlindungan Privasi Anak di Bawah Umur
              </h2>
              <p>
                Layanan Cukupin ditujukan bagi individu yang telah berusia minimal 18 tahun atau telah cakap melakukan perbuatan hukum menurut peraturan perundang-undangan di Indonesia. Jika orang tua atau wali mengetahui bahwa anak di bawah umur memberikan data pribadinya tanpa persetujuan, silakan hubungi kami untuk tindakan penghapusan segera.
              </p>
            </section>

            {/* Section 10 */}
            <section id="perubahan-kebijakan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Scale size={16} /> PASAL 10
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                10. Pembaruan dan Notifikasi Kebijakan
              </h2>
              <p>
                Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk mencerminkan penyempurnaan fitur atau kepatuhan terhadap regulasi baru. Setiap perubahan material akan diumumkan melalui pembaruan tanggal efektif di bagian atas halaman ini atau melalui pemberitahuan banner dalam aplikasi.
              </p>
            </section>

            {/* Section 11 */}
            <section id="kontak-dpo" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-green uppercase tracking-wider">
                <Mail size={16} /> PASAL 11
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                11. Saluran Resmi & Petugas Pelindungan Data (DPO)
              </h2>
              <p>
                Apabila Anda memiliki pertanyaan, keberatan, atau ingin mengajukan hak Anda terkait data pribadi (termasuk permintaan penghapusan akun permanen), Anda dapat menghubungi Petugas Pelindungan Data kami melalui saluran resmi:
              </p>
              
              <div className="rounded-xl border border-line bg-paper/60 p-5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Nama Layanan:</strong>
                  <span className="text-muted">Cukupin (Catat Santai)</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Email Khusus Privasi & DPO:</strong>
                  <a href="mailto:privasi@cukupin.app" className="font-bold text-green hover:underline">
                    privasi@cukupin.app
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Email Umum / Dukungan:</strong>
                  <a href="mailto:halo@cukupin.app" className="font-bold text-blue hover:underline">
                    halo@cukupin.app
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Waktu Respons:</strong>
                  <span className="text-muted">Maksimal 3 x 24 jam hari kerja</span>
                </div>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="border-t border-line/60 bg-paper py-8 text-center text-xs text-muted">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Cukupin. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-ink transition-colors">Beranda</Link>
            <Link href="/legal/terms" className="hover:text-ink transition-colors">Syarat & Ketentuan</Link>
            <a href="mailto:privasi@cukupin.app" className="hover:text-ink transition-colors">Hubungi Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
