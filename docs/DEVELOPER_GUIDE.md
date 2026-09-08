# Cukupin™ Developer Onboarding & Engineering Handbook

Panduan teknis bagi perekayasa perangkat lunak untuk mengembangkan, menguji, dan memelihara aplikasi Cukupin™.

---

## 1. Panduan Memulai (Zero-to-Hero Quickstart)

### 1.1. Prasyarat Sistem
- **Node.js**: Versi `>= 18.18.0` (Direkomendasikan Node.js LTS v20 atau v22).
- **Package Manager**: `npm` atau `pnpm`.
- **Git**: Versi terbaru.
- **Python**: Versi `3.10+` (Diperlukan jika menjalankan test suite E2E Playwright).
- **Peramban Modern**: Chrome / Firefox / Safari / Edge dengan dukungan Service Worker & PWA.

### 1.2. Langkah Instalasi Cepat
```bash
# 1. Clone repositori
git clone https://github.com/rhaffle87/cukupin-v0.git
cd cukupin-v0

# 2. Pasang dependensi
npm install

# 3. Buat berkas environment lokal
cp .env.example .env.local

# 4. Jalankan server pengembangan
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

> [!TIP]
> **Guest & Standalone Local Mode**:
> Jika Anda belum memiliki akun Supabase, Cukupin™ tetap dapat dijalankan penuh di `http://localhost:3000`! Edge reverse proxy (`proxy.ts`) dan sistem finance data secara otomatis mendeteksi ketiadaan kredensial dan beralih ke **Mode Lokal (LocalStorage + In-Memory Mock)**, sehingga seluruh fitur transaksi, grafik, dan laporan tetap dapat diuji.

---

## 2. Struktur Direktori Proyek

```text
cukupin-v0/
├── app/                        # Next.js 16 App Router (Rute & Halaman)
│   ├── (protected)/            # Rute terproteksi sesi (Dashboard, Transaksi, Laporan, Goals, Wishlist)
│   ├── api/cron/               # Endpoint cron terjadwal (Otomatisasi Tagihan Rutin)
│   ├── auth/login/             # Halaman autentikasi (Magic Link & Kata Sandi)
│   ├── legal/                  # Halaman kepatuhan (Syarat Ketentuan & Privasi)
│   ├── error.tsx               # Client Error Boundary global
│   ├── not-found.tsx           # Halaman 404 kustom bergaya Quiet Ledger
│   ├── layout.tsx              # Root Layout (Fonts, Metadata, Telemetri, Provider)
│   └── globals.css             # Desain sistem Quiet Ledger & token warna Tailwind
├── components/                 # Komponen Antarmuka Reusable
│   ├── analytics/              # Komponen analitik dengan gating persetujuan cookie
│   ├── auth/                   # Layar login & register dengan fallback guest dev
│   ├── finance/                # Modul inti finansial (Form, Tabel, Grafik, Dialog, Laporan)
│   ├── layout/                 # Shell navigasi desktop & mobile bottom bar
│   ├── pwa/                    # Pendaftaran Service Worker & prompt instalasi 7-day cooldown
│   ├── security/               # Layar kunci PIN 6 digit (Overlay) & modal konfigurasi biometrik
│   ├── seo/                    # Structured data Schema.org JSON-LD
│   └── ui/                     # Primitives UI (Modal, Brand, Eyebrow, StatCard, CookieConsent)
├── context/                    # React Context Global (FinanceContext, ScreenLockContext)
├── docs/                       # Dokumentasi Arsitektur, Basis Data, Keamanan, & Panduan Dev
├── hooks/                      # Custom Hooks (useFinanceData, useAutoRecurringBills)
├── lib/                        # Utilitas Logika Bisnis & Infrastruktur Data
│   ├── analytics.ts            # Perekam event kustom terproteksi
│   ├── backup.ts               # Mesin cadangan & pemulihan JSON v2.0 divalidasi Zod
│   ├── database.types.ts       # Definisi tipe TypeScript skema Supabase
│   ├── finance.ts              # Kalkulasi matematika 50/30/20, saldo, & sanitasi CSV
│   ├── offlineQueue.ts         # Antrean sinkronisasi aksi offline (Offline-First)
│   ├── rateLimit.ts            # Sliding-window rate limiter & DDoS mitigation (RFC headers)
│   ├── recurringBillsWorker.ts # Evaluasi dan eksekusi batch otomatisasi tagihan jatuh tempo
│   ├── resourceBudget.ts       # Pagination math, monthly bounds, & simulasi kapasitas free tier
│   ├── security/               # SHA-256 + salt PIN hashing & WebAuthn biometrik
│   ├── constants/              # Konstanta kunci storage, metadata, & navigasi
│   └── validations/            # Skema validasi Zod untuk form & data entry
├── public/                     # Aset statis, ikon PWA, dan Service Worker (sw.js)
├── supabase/                   # Konfigurasi CLI & skrip migrasi PostgreSQL SQL
├── tests/                      # Suite pengujian otomatis Vitest & Playwright
├── vercel.json                 # Konfigurasi Vercel Daily Cron (/api/cron/recurring-bills)
├── proxy.ts                    # Next.js 16 Edge Reverse Proxy & Session Refresher
└── next.config.mjs             # Konfigurasi Next.js, Security Headers, & CSP
```

---

## 3. Sistem Desain: "Quiet Ledger"

Cukupin™ menggunakan filosofi desain **Quiet Ledger** (buku besar finansial yang tenang, hangat, dan berwibawa):

### 3.1. Palet Token Warna
- `--paper`: `#f7f6f0` — Latar belakang permukaan hangat ramah mata.
- `--card`: `#fffefb` — Kartu putih gading berbatas tegas.
- `--ink`: `#1e3249` — Tipografi biru tinta navy elegan.
- `--green`: `#3e8f68` — Hijau ledger klasik untuk surplus & pemasukan.
- `--coral`: `#d98362` — Jingga koral tenang untuk pengeluaran.
- `--blue`: `#315dcb` — Aksen kobalt untuk navigasi dan aksi primer.
- `--line`: `#e8e7e0` — Garis batas pembatas halus.

### 3.2. Tipografi
- **Headings & Display**: `Fraunces` (`--font-display` Google Serif) dengan karakter hangat editorial.
- **Body & Controls**: `DM Sans` (`--font-sans`) untuk keterbacaan antarmuka, navigasi, dan tombol.
- **Financial Numbers & Metrics**: `Inter` (`--font-numeric`) dengan `font-variant-numeric: tabular-nums lining-nums` serta font feature settings `'tnum' 1, 'cv05' 1, 'cv11' 1` untuk perataan kolom moneter yang stabil, presisi, dan proporsional.
- **Technical Numbers & Codes**: `JetBrains Mono` (`--font-mono`) dengan `'zero' 1` (slashed zero) untuk nomor kartu tersamar (`•••• •••• •••• 2026`), kata kunci konfirmasi (`HAPUS`), counter badge, dan token teknis.

---

## 4. Alur Pengujian & Validasi Kualitas (TDAI)

Sebelum melakukan commit atau pull request, selalu jalankan segitiga validasi kualitas:

```bash
# 1. Jalankan pengujian unit otomatis (135 tests across 13 suites)
npm test

# 2. Periksa kesesuaian tipe TypeScript (harus 0 error)
npx tsc --noEmit

# 3. Jalankan pengujian build produksi
npm run build

# 4. Jalankan pengujian browser end-to-end (6 user journeys)
npm run test:e2e
```

### Cakupan Pengujian di `tests/`
Pengujian unit dan komponen menggunakan **Vitest** dengan konfigurasi di `vitest.config.mts`:
- `tests/rateLimit.test.ts`: 6 tests kuota sliding-window, multi-IP isolation, header RFC, dan reset.
- `tests/resourcesAndLimits.test.ts`: 16 tests model payload byte, matematika paginasi, dan simulasi egress bulanan.
- `tests/security.test.ts`: 16 tests kriptografi (salt, SHA-256 PIN hashing, WebAuthn, auto-lock timeout).
- `tests/recurringWorker.test.ts`: 8 tests evaluasi tanggal jatuh tempo & eksekusi batch otomatisasi tagihan.
- `tests/installPrompt.test.ts`: 6 tests pembatasan frekuensi instalasi mingguan (7-day cooldown gate).
- `tests/finance.test.ts`: 27 tests kalkulasi keuangan (totals, 50/30/20, daily safe spend, pace target tabungan, CSV sanitasi).
- `tests/validations.test.ts`: 19 tests skema Zod (transaksi, target tabungan, wishlist, tagihan, budget).
- `tests/offlineQueue.test.ts`: 5 tests antrean sinkronisasi offline.
- `tests/backup.test.ts`: 6 tests generator & validator berkas cadangan JSON v2.0.
- `tests/components/ui.test.tsx`: 11 tests komponen antarmuka primitive (Modal, StatCard, CookieConsent).
- `tests/components/financeWidgets.test.tsx`: 7 tests widget finansial (CategoryBudget, RecurringBills).
- `tests/flows/guestModeAndStorage.test.ts`: 5 tests flow mode lokal tamu & ketahanan storage.
- `tests/flows/dataLifecycle.test.ts`: 3 tests alur cadangkan & pulihkan data.
- `tests/e2e/test_user_flows.py`: 6 user journeys Playwright (Desktop & Mobile).
- `tests/e2e/test_security_and_recurring.py`: Regression Playwright untuk alur kunci PIN & visual verification.

---

## 5. Standar Kode & Konvensi

1. **Komponen React**:
   - Selalu gunakan `'use client'` jika komponen menggunakan state, event listener, atau hooks.
   - Bungkus komponen list padat dengan `React.memo` jika menerima props kompleks untuk menjaga performa rendering 60 FPS.
2. **Form & Kontrol Input**:
   - Pertahankan tinggi minimum **44px** (`min-height: 44px` atau `h-11`) dan padding minimum `10px 14px` untuk memenuhi standar keramahan layar sentuh (*touch target ergonomis*).
3. **Koneksi Supabase**:
   - Jangan pernah hardcode URL atau Token di dalam komponen.
   - Gunakan `createClient()` dari `@/lib/supabase/client` untuk komponen peramban.
   - Jangan pernah mengekspos `SUPABASE_SERVICE_ROLE_KEY` pada bundle klien.
