# Supabase Deployment & GitHub Integration Guide

Panduan lengkap konfigurasi produksi, migrasi basis data, dan penyelesaian masalah GitHub Preview Branching untuk **Cukupin™**.

---

## 1. Penyelesaian Masalah: Supabase Preview Failing

### Mengapa Supabase GitHub Preview Gagal?
Saat menghubungkan repository GitHub ke project Supabase, Anda mungkin melihat error atau kegagalan check run:
> `Branching with GitHub integration: Upgrade to the Pro Plan to enable branching and automatically create preview branches for every pull request`

### Penjelasan Akar Masalah
Fitur **Supabase Database Branching** (membuat database preview terisolasi secara otomatis untuk setiap Pull Request) adalah fitur eksklusif pada **Supabase Pro Plan ($25/bulan)**. Pada **Free Plan**, setiap pull request yang dibuka akan mencoba men-trigger branch preview namun ditolak oleh platform karena batasan lisensi.

### Solusi untuk Pengguna Free Plan (Rekomendasi)
Jika menggunakan akun Supabase Free Tier:
1. Masuk ke **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Pilih project Anda.
3. Buka **Project Settings** (ikon gear di sidebar kiri bawah) > **Integrations** > **GitHub**.
4. Cari bagian **Branching with GitHub integration**.
5. Pastikan konfigurasi diatur sebagai berikut:
   - **Automatic branching**: Matikan / Nonaktifkan toggle (*Disabled*).
   - **Deploy to production**: Aktifkan (*Enabled*).
   - **Production branch name**: Set ke `main`.
6. Dengan konfigurasi ini:
   - PR ke GitHub tidak akan lagi memicu error preview database yang gagal.
   - Perubahan skema pada branch `main` tetap dapat dipantau dan disinkronkan langsung ke database produksi.

---

## 2. Cara Menjalankan Migrasi ke Supabase Produksi

Tersedia file migrasi konsolidasi lengkap yang siap dieksekusi dalam 1 kali klik:
`supabase/migrations/full_schema.sql`

### Langkah-langkah Eksekusi (1-Click SQL Editor):
1. Buka project Anda di **Supabase Dashboard**.
2. Klik tab **SQL Editor** di navigasi kiri (ikon `>_`).
3. Klik tombol **+ New Query**.
4. Salin seluruh isi file [`supabase/migrations/full_schema.sql`](../supabase/migrations/full_schema.sql).
5. Tempel ke dalam SQL Editor, lalu klik tombol **Run** (atau tekan `Ctrl + Enter`).
6. Pesan `Success. No rows returned` akan muncul menandakan 5 tabel, 20 RLS policies, 6 index performa, dan publikasi Realtime telah aktif sempurna.

---

## 3. Query Verifikasi Database di Supabase

Setelah menjalankan migrasi, jalankan query berikut di SQL Editor untuk memastikan semua tabel dan RLS aktif:

```sql
-- 1. Cek semua tabel publik Cukupin™
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
-- Expected output: category_budgets, recurring_bills, saving_goals, transactions, wishlist

-- 2. Cek status Row Level Security (RLS)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- Expected output: rowsecurity bernilai true untuk semua 5 tabel

-- 3. Cek publikasi Realtime
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
-- Expected output: category_budgets, recurring_bills, saving_goals, transactions, wishlist
```

---

## 4. Konfigurasi Autentikasi (Auth URL & Redirects)

Agar fitur login dan email konfirmasi Supabase bekerja mulus di localhost maupun Vercel:

1. Di Supabase Dashboard, buka **Authentication** > **URL Configuration**.
2. **Site URL**:
   - Isi dengan domain produksi utama Anda, misal: `https://cukupin.app` (atau domain `https://<project-name>.vercel.app`).
3. **Redirect URLs**:
   Tambahkan URL berikut ke dalam daftar redirect yang diizinkan (*Allowed Callback URLs*):
   - `http://localhost:3000/**` (untuk pengujian lokal)
   - `https://*.vercel.app/**` (untuk preview deployment Vercel)
   - `https://cukupin.app/**` (domain produksi)
4. Klik **Save Changes**.

---

## 5. Environment Variables di Vercel

Pastikan variabel lingkungan berikut telah ditambahkan di **Vercel Dashboard** > **Project Settings** > **Environment Variables**:

| Variable Key | Deskripsi | Sumber di Supabase |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL endpoint API project Anda | Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci publik aman browser (Anon/Public) | Project Settings > API > Project API keys (`anon` `public`) |

> [!TIP]
> Jangan pernah memasukkan `service_role` secret key ke dalam environment variable dengan prefix `NEXT_PUBLIC_`. Kunci `anon` sudah 100% aman karena dilindungi oleh Row Level Security (RLS) pada tingkat engine PostgreSQL.
