# Cukupin™

> **Catat santai, tahu arah uangmu.**  
> Aplikasi pencatatan keuangan pribadi dengan pendekatan *Quiet Ledger* — tenang, berfokus pada kebiasaan sehat, ramah privasi, dan mendukung penggunaan offline (PWA).

---

## Fitur Utama

- **Hero ATM / Debit Card**: Visualisasi saldo kas realtime dengan sentuhan kartu ATM elegan (chip emas EMV, indikator NFC, status aman/menipis, dan nomor kartu tersamar).
- **Rapor Keuangan Cukupin™ (Wrapped & Scorecard)**: Penilaian kesehatan finansial 100 poin (Tingkat Tabungan, Kepatuhan Anggaran, Disiplin Catat, Rasio 50/30/20) dan kartu rapor yang dapat diunduh (PNG) untuk dibagikan.
- **Pola Pengeluaran 50/30/20**: Distribusi otomatis pengeluaran ke kategori Kebutuhan (*Needs*), Keinginan (*Wants*), dan Tabungan (*Savings*).
- **Tagihan Rutin & Pengingat Otomatis**: Kelola pengeluaran berulang bulanan/tahunan dengan peringatan tagihan tertunda dan otomatisasi batch di serverless cron (`/api/cron/recurring-bills`).
- **Limit Anggaran Kategori**: Tetapkan batas belanja per kategori dengan indikator visual sisa/defisit anggaran.
- **Target Tabungan & Wishlist**: Rencanakan tabungan masa depan dan kontrol belanja impulsif dengan daftar impian.
- **Kunci Layar PIN & Biometrik**: Proteksi privasi lokal dengan 6 digit PIN (Salted SHA-256 via Web Crypto) dan autentikasi biometrik WebAuthn (Touch ID / Face ID / Windows Hello).
- **Edge Rate Limiting & Throttling**: Proteksi DDoS dan brute-force berbasis algoritma *sliding-window* pada Edge Proxy Next.js 16 (`proxy.ts`).
- **PWA & Offline-First Resilience**: Tetap bisa mencatat saat tanpa internet; transaksi dan aksi otomatis disinkronkan kembali saat online melalui antrean lokal (`offlineQueue`).
- **Penyimpanan Lokal & Cloud**: Mendukung mode pengembang/tamu berbasis penyimpanan lokal (`local-dev-user`) serta integrasi Supabase PostgreSQL dengan Row-Level Security (RLS).
- **Sistem Cadangan & Pemulihan (Disaster Recovery)**: Impor data via CSV (dengan mitigasi injeksi formula OWASP) dan cadangkan/pulihkan seluruh data via JSON v2.0 tervalidasi skema Zod.
- **Halaman Galat & 404 Kustom**: Antarmuka 404 dan *error boundary* yang ramah, informatif, dan terintegrasi dengan palet desain Cukupin™.

---

## Pusat Dokumentasi Teknis (Engineering Docs)

Dokumentasi arsitektur dan operasional lengkap tersedia di direktori [`docs/`](./docs):

- [**Arsitektur Sistem (ARCHITECTURE.md)**](./docs/ARCHITECTURE.md) — Desain sistem high-level, edge proxy, rate limiting, state management, & observabilitas.
- [**Skema Basis Data (DATABASE_SCHEMA.md)**](./docs/DATABASE_SCHEMA.md) — Diagram ERD, spesifikasi tabel, RLS, indeks performa, & publikasi realtime.
- [**Audit Keamanan (SECURITY_AUDIT.md)**](./docs/SECURITY_AUDIT.md) — Pemodelan ancaman (STRIDE), mitigasi OWASP Top 10, CSP, rate limiting, & kepatuhan UU PDP.
- [**Alur Data & API (API_AND_DATA_FLOW.md)**](./docs/API_AND_DATA_FLOW.md) — Arsitektur alur data, antrean offline-first, backup payload v2.0, & pipeline CSV.
- [**Panduan Developer (DEVELOPER_GUIDE.md)**](./docs/DEVELOPER_GUIDE.md) — Panduan onboarding developer, setup lokal tanpa Supabase, TDD Vitest (135 tests), & konvensi kode.
- [**Panduan Deploy Supabase (SUPABASE_DEPLOYMENT.md)**](./docs/SUPABASE_DEPLOYMENT.md) — Panduan migrasi 1-klik, konfigurasi branch preview, & variabel produksi.
- [**Alokasi Sumber Daya & Kuota Cloud (RESOURCES.md)**](./docs/RESOURCES.md) — Rincian batas gratis Vercel & Supabase, analisis bottleneck, & mitigasi kuota.
- [**Tolok Ukur Performa & Egress (BENCHMARK.md)**](./docs/BENCHMARK.md) — Pengukuran byte payload, simulasi egress bulanan, & uji timeout 10 detik.
- [**Uji Beban, Stres & Kapasitas k6 (LOAD_TESTING.md)**](./docs/LOAD_TESTING.md) — Skenario k6 (smoke, average, spike stress, rate limit) & runner native Node.js.
- [**Proposal Business Plan (Cukupin™ Proposal)**](./docs/proposal/Proposal%20Bisnis%20Cukupin%20(Financial%20Tracker).md) — Proposal bisnis, analisis TOWS, unit economics, target pasar & roadmap ([Versi PDF](./docs/proposal/Proposal%20Bisnis%20Cukupin%20(Financial%20Tracker).pdf)).

---

## Tech Stack & Infrastruktur

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: Tailwind CSS v3.4.17 & Vanilla CSS (*Quiet Ledger theme tokens & design system*)
- **Typography**:
  - **Body & Controls**: [DM Sans](https://fonts.google.com/specimen/DM+Sans) (`--font-sans`)
  - **Headings & Display**: [Fraunces](https://fonts.google.com/specimen/Fraunces) (`--font-display`)
  - **Financial Numbers & Metrics**: [Inter](https://fonts.google.com/specimen/Inter) (`--font-numeric`) dengan `tabular-nums lining-nums` (`cv05`, `cv11`, `tnum`)
  - **Technical Numbers & Codes**: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (`--font-mono`) dengan slashed zero (`zero`)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL dengan Row-Level Security)
- **Edge Shielding & Throttling**: Sliding-Window Rate Limiter di Next.js 16 Edge Proxy (`proxy.ts`)
- **Analytics & Observability**: [Vercel Analytics](https://vercel.com/analytics) & [Vercel Speed Insights](https://vercel.com/docs/speed-insights) (*privacy consent-gated*)
- **Charts & Visuals**: Recharts (Cursor-following tooltip with boundary clamping), Lucide Icons, canvas-confetti, html-to-image
- **Testing**: Vitest + jsdom (135 unit, component, rate limit & flow tests across 13 suites), Python Playwright (6 E2E user journeys), & k6 / Node.js Load Testing Suite

---

## Memulai (Getting Started)

### 1. Prasyarat
- Node.js 18.18+ atau 20+
- npm / pnpm / yarn

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin berkas template dan sesuaikan variabel Supabase:
```bash
cp .env.example .env.local
```

Isi variabel:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
CRON_SECRET=your-secure-cron-token
```
*(Catatan: Tanpa variabel ini, aplikasi tetap dapat dijalankan penuh dalam mode lokal/offline).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

---

## Pengujian (Testing)

Jalankan rangkaian pengujian otomatis:
```bash
# Unit, Component, Flow, Security & Rate Limit Tests (Vitest - 135 tests)
npm test

# Mode interaktif / watch
npm run test:watch

# End-to-End Browser Journeys (Playwright - 6 user journeys)
npm run test:e2e

# Uji Beban & Latensi Mandiri (Simulated Load Runner)
npm run test:load

# Rangkaian Uji Beban k6
npm run test:load:k6:smoke       # Smoke Test (3 VUs, 30s)
npm run test:load:k6:average     # Average Load (100 VUs, 5m)
npm run test:load:k6:spike       # Spike Stress Test (500 VUs)
npm run test:load:k6:rate-limit  # Rate Limiter / DDoS Test (HTTP 429)
```

---

## Database & Supabase CLI

```bash
# Push migrasi ke database
npm run db:push

# Cek perbedaan skema lokal vs remote
npm run db:diff

# Lint skema SQL
npm run db:lint
```

Berkas migrasi skema tersimpan di direktori `supabase/migrations/` (termasuk `full_schema.sql` untuk instalasi 1-klik di Supabase SQL Editor).

---

## Privasi, Keamanan & Regulasi

Aplikasi ini dibangun dengan kepatuhan penuh terhadap standar perlindungan privasi data pribadi **UU PDP No. 27/2022** dan prinsip **GDPR**:
- **Hak Penghapusan Data (Pasal 39)**: Pengguna memiliki akses mandiri untuk menghapus seluruh catatan keuangan (*hard-delete*) secara permanen dengan konfirmasi ketik `HAPUS`.
- **Persetujuan Pelacakan**: Telemetri Vercel Analytics dan Speed Insights hanya diaktifkan jika pengguna memberikan persetujuan melalui banner cookie (`beforeSend` gating).
- **Keamanan HTTP & DDoS**: Dilengkapi HSTS (`max-age=63072000`), CSP ketat, proteksi anti-Clickjacking (`DENY`), dan Edge Rate Limiting di `proxy.ts`.

Informasi hukum dan ketentuan layanan dapat diakses di `/legal/privacy` dan `/legal/terms`.

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](./LICENSE).

## Keamanan

Untuk pelaporan kerentanan atau isu keamanan, silakan baca [SECURITY.md](./SECURITY.md).

