# Cukupin

> **Catat santai, tahu arah uangmu.**  
> Aplikasi pencatatan keuangan pribadi dengan pendekatan *Quiet Ledger* — tenang, berfokus pada kebiasaan sehat, ramah privasi, dan mendukung penggunaan offline (PWA).

---

## ✨ Fitur Utama

- **Hero ATM / Debit Card**: Visualisasi saldo kas realtime dengan sentuhan kartu ATM elegan (chip emas EMV, indikator NFC, status aman/menipis).
- **Rapor Keuangan Cukupin (Wrapped & Scorecard)**: Penilaian kesehatan finansial 100 poin (Tingkat Tabungan, Kepatuhan Anggaran, Disiplin Catat, Rasio 50/30/20) dan kartu rapor yang dapat diunduh (PNG) untuk dibagikan.
- **Pola Pengeluaran 50/30/20**: Distribusi otomatis pengeluaran ke kategori Kebutuhan (*Needs*), Keinginan (*Wants*), dan Tabungan (*Savings*).
- **Tagihan Rutin & Pengingat**: Kelola pengeluaran berulang bulanan/tahunan dengan peringatan tagihan tertunda langsung di Dashboard.
- **Limit Anggaran Kategori**: Tetapkan batas belanja per kategori dengan indikator visual sisa/defisit anggaran.
- **Target Tabungan & Wishlist**: Rencanakan tabungan masa depan dan kontrol belanja impulsif dengan daftar impian.
- **PWA & Offline-First Resilience**: Tetap bisa mencatat saat tanpa internet; transaksi dan aksi otomatis disinkronkan kembali saat online.
- **Penyimpanan Lokal & Cloud**: Mendukung mode pengembang/tamu berbasis penyimpanan lokal serta integrasi Supabase PostgreSQL dengan Row-Level Security (RLS).
- **Impor & Ekspor Lengkap**: Impor data via CSV dan cadangkan/pulihkan seluruh data (5 entitas) via JSON.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: Vanilla CSS & Tailwind CSS v4 (*Quiet Ledger theme palette*)
- **Typography**: [DM Sans](https://fonts.google.com/specimen/DM+Sans), [Fraunces](https://fonts.google.com/specimen/Fraunces), dan [DM Mono](https://fonts.google.com/specimen/DM+Mono) via `next/font/google`
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL dengan RLS)
- **Charts & Visuals**: Recharts, Lucide Icons, html2canvas
- **Testing**: Vitest + jsdom

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat
- Node.js 18.17+ atau 20+
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
```
*(Catatan: Tanpa variabel ini, aplikasi tetap dapat dijalankan dalam mode lokal/offline).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

---

## 🧪 Pengujian (Testing)

Jalankan rangkaian unit test suite:
```bash
# Sekali jalan (CI mode)
npm run test

# Mode interaktif / watch
npm run test:watch
```

---

## 🗄️ Database & Supabase CLI

```bash
# Push migrasi ke database
npm run db:push

# Cek perbedaan skema lokal vs remote
npm run db:diff

# Lint skema SQL
npm run db:lint
```

Berkas migrasi skema tersimpan di direktori `supabase/migrations/`.

---

## 📄 Lisensi & Privasi

Aplikasi ini mematuhi prinsip perlindungan privasi data pribadi sesuai regulasi UU PDP No. 27/2022. Informasi hukum dan ketentuan layanan dapat diakses di `/legal/privacy` dan `/legal/terms`.

