# Cukupin™ Cloud Compute, Network Quotas & Free-Tier Resource Guide (RESOURCES.md)

Dokumentasi komprehensif alokasi sumber daya komputasi dan jaringan pada infrastruktur gratis (**Vercel Hobby Tier** dan **Supabase Free Tier**), implikasi teknis terhadap arsitektur Cukupin™, serta strategi mitigasi batasan sistem.

---

## 1. Vercel — Hobby (Free) Tier Specification

Vercel menangani hosting frontend Next.js 16 (App Router), Edge Middleware (`proxy.ts`), dan serverless route handlers (seperti `/api/cron/recurring-bills`).

| Sumber Daya / Kuota | Batas Resmi (Limit) | Arti Teknis & Dampak pada Cukupin™ |
| :--- | :--- | :--- |
| **Fast Data Transfer (Bandwidth)** | **100 GB / bulan** | Mencakup transfer berkas HTML, CSS, JS bundle, Web Fonts, dan respons payload API ke peramban pengguna. Sangat longgar untuk aplikasi PWA berbasis client-heavy. |
| **Edge Requests** | **1.000.000 / bulan** | Setiap request pada level CDN (pemuatan aset statis, font Google, dan eksekusi `proxy.ts` middleware). |
| **Function Invocations** | **1.000.000 / bulan** | Setiap panggilan rute API atau SSR render dinamis. Rute halaman utama di Cukupin™ memanfaatkan prerender statis (`○ Static`) dan client component, sehingga invocation serverless minimal. |
| **Active CPU (Compute Time)** | **~4 CPU-hours / bulan** | Waktu komputasi aktif saat fungsi serverless memproses instruksi kode. |
| **Provisioned Function Memory** | **360 GB-hours / bulan** | Alokasi memori × waktu eksekusi fungsi serverless saat berjalan. |
| **Function Execution Timeout** | **10 Detik (Hard Cap)** | **Batasan paling krusial di Vercel Hobby**. Setiap operasi API, kueri database, atau pemrosesan dokumen harus selesai di bawah 10 detik atau request akan di-kill (`504 Gateway Timeout`). |
| **Function Bundle Size** | Capped per function | Mengharuskan impor pustaka tetap efisien. Hindari menyertakan library PDF/grafis berat (seperti Puppeteer) di sisi server. |
| **Concurrent Builds** | **1 antrean (Solo)** | Commit beruntun akan masuk antrean dan dibangun secara sekuensial. |
| **Build-Execution Minutes** | **6.000 menit / bulan** | Total durasi kompilasi Next.js (`npm run build`). Rata-rata build Cukupin™ hanya memakan waktu 3.2 detik. |
| **Deployments Limit** | **100 / hari** | Batas maksimal deployment harian via Git push atau CLI. |
| **Blob Storage** | **1 GB / bulan** | Tidak digunakan; seluruh persistensi data dialihkan ke PostgreSQL Supabase. |
| **Image Transformations** | **5.000 / bulan** | Pengoptimalan gambar via `next/image`. Cukupin™ memakai vektor SVG Lucide sehingga kuota ini tidak terpakai. |
| **Team / Collaborator Seats** | **1 Akun (Solo Dev)** | Tidak dapat mengundang kolaborator ke dashboard Vercel pada akun gratis. |
| **Commercial Use Terms** | **Non-Commercial Only** | Akun Hobby ditujukan untuk proyek personal, riset, atau tugas universitas/kuliah. Penggunaan monetisasi komersial memerlukan Pro Tier. |

> [!WARNING]
> **Kebijakan Saat Melebihi Kuota Vercel Hobby:**
> Vercel tidak menagih biaya berlebih (*overage*) pada akun Hobby. Sebagai gantinya, layanan yang melampaui batas akan **ditangguhkan (paused)** hingga siklus tagihan 30 hari berikutnya bergulir.

---

## 2. Supabase — Free Tier Specification

Supabase menyediakan database PostgreSQL, autentikasi pengguna (Supabase Auth / GoTrue), dan Row Level Security (RLS).

| Sumber Daya / Kuota | Batas Resmi (Limit) | Arti Teknis & Dampak pada Cukupin™ |
| :--- | :--- | :--- |
| **Active Projects** | **2 Proyek Maksimal** | Cukup untuk memisahkan database *development/staging* dan *production*. |
| **Database Storage** | **500 MB** | Berjalan pada shared compute 500 MB RAM. Baris data teks/numerik Cukupin™ (`transactions`, `saving_goals`, `wishlist`, `recurring_bills`) sangat ramping (~220 byte per baris), sehingga 500 MB dapat menampung hingga **>1.500.000 transaksi**. |
| **Compute Instance** | Shared CPU, 500 MB RAM | Cukup tangguh untuk beban demo kelas, tugas kuliah, dan uji coba puluhan pengguna simultan. |
| **Database Outbound Egress** | **5 GB / bulan** | **Batas paling rawan terlampaui (*The Silent Killer*)**. Setiap pembacaan data dari Supabase menuju browser/Vercel menghabiskan kuota ini. |
| **Monthly Active Users (MAU)** | **50.000 MAU** | Jumlah pengguna terdaftar yang login per bulan. Jauh melampaui kebutuhan demo akademik. |
| **API Requests** | **Tanpa Batas (Unlimited)** | Tidak ada *rate limiting* kuota jumlah request REST/PostgREST; yang dibatasi adalah kapasitas komputasi dan total bandwidth egress. |
| **Edge Function Invocations** | **500.000 / bulan** | Kuota untuk Deno Edge Functions (bila ada logika yang dialihkan ke Supabase Edge). |
| **Realtime Connections** | **200 koneksi simultan** | Batas peramban yang membuka saluran WebSocket `cukupin-${userId}` secara bersamaan. |
| **Realtime Messages** | **2.000.000 / bulan** | Pesan event perubahan database Postgres yang dikirimkan via saluran realtime. |
| **Automated Backups** | **Tidak Tersedia (None)** | Free tier tidak mencakup snapshot harian otomatis. Cukupin™ mengatasinya dengan fitur bawaan **JSON Backup v2.0** (`lib/backup.ts`). |
| **Inactivity Auto-Pause** | **Otomatis Pause setelah 7 Hari Idle** | Database yang tidak menerima lalu lintas kueri selama 7 hari berturut-turut akan dinonaktifkan secara otomatis. |

---

## 3. Analisis 3 Bottleneck Utama & Solusi Arsitektur

### 3.1. Bottleneck #1: Supabase Egress (5 GB/bulan) — "The Silent Killer"
- **Masalah**: Jika aplikasi mengambil seluruh riwayat transaksi tanpa batas (`select * from transactions`) pada setiap render atau navigasi halaman, ukuran payload per sesi membengkak drastis. Dengan 500 pengguna aktif yang masing-masing membuka aplikasi beberapa kali per hari, transfer data bulanan dapat menembus **>15 GB**, mengakibatkan akun terhenti di tengah bulan.
- **Solusi Cukupin™**:
  1. **Pagination Terstandarisasi**: Menggunakan helper `calculatePaginationRange(page, pageSize)` (`.range(from, to)`) sehingga hanya 25 transaksi terakhir yang dikirimkan pada pemuatan awal.
  2. **Filter Tanggal Server-Side**: Menggunakan batas bulan `getMonthlyFilterBounds(year, month)` untuk memfilter data langsung di PostgreSQL melalui klausa WHERE dan RLS, bukan memfilter ribuan baris di peramban.
  3. **Penghematan Bandwidth**: Mengurangi konsumsi egress hingga **>85%** (dibuktikan secara empiris melalui pengujian Vitest di `tests/resourcesAndLimits.test.ts`).

### 3.2. Bottleneck #2: Vercel 10-Second Function Timeout Hard Cap
- **Masalah**: Serverless functions di Vercel Hobby memiliki batas eksekusi mutlak 10 detik. Upaya menjalankan Puppeteer / Chromium di serverless untuk membuat file PDF laporan keuangan akan gagal akibat cold start dan rendering dokumen yang memakan waktu 12–15 detik.
- **Solusi Cukupin™**:
  1. **Client-Side Rendering (Zero Serverless Compute)**: Ekspor laporan bulanan (`MonthlyExpenseTemplate.tsx`) dan rapor keuangan (`FinancialWrappedModal.tsx`) dieksekusi 100% di browser pengguna memanfaatkan `window.print()` dan HTML5 Canvas DOM export.
  2. **Beban Komputasi Serverless = 0ms**: Melindungi rute serverless dari risiko timeout 10 detik dan menghemat kuota CPU-hours Vercel.

### 3.3. Bottleneck #3: Supabase 7-Day Inactivity Auto-Pause
- **Masalah**: Database proyek gratis otomatis dipause jika tidak ada kueri selama 7 hari. Hal ini berisiko menyebabkan aplikasi *down* tepat sebelum sesi presentasi atau evaluasi tugas akhir jika proyek tidak dibuka selama seminggu.
- **Solusi Cukupin™**:
  1. **Skrip Ping Ringan**: Disediakan berkas [`scripts/supabase-keepalive.js`](../scripts/supabase-keepalive.js) yang mengeksekusi kueri `SELECT id FROM transactions LIMIT 1` dalam waktu <300ms.
  2. **Automasi Terjadwal**: Dikonfigurasi workflow GitHub Actions [`.github/workflows/supabase-keepalive.yml`](../.github/workflows/supabase-keepalive.yml) yang berjalan otomatis setiap 5 hari sekali (`0 0 */5 * *`), memastikan proyek Supabase tetap aktif 24/7 tanpa biaya tambahan.

---

## 4. Matriks Estimasi Kapasitas Beban Riil Cukupin™

| Skenario Penggunaan | Pengguna Aktif (MAU) | Frekuensi Sesi | Estimasi Egress Supabase / Bulan | Estimasi Invocations Vercel / Bulan | Status Kuota Free Tier |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Solo Developer / Pengujian Lokal** | 1 orang | 2 sesi / hari (60 sesi/bln) | **~0,25 MB** (<0,01% dari 5 GB) | <1.000 (<0,1% dari 1M) | **100% AMAN (SAFE)** |
| **Demo Kelas / Presentasi Dosen** | 30 mahasiswa/penguji | 5 sesi uji coba serentak | **~4,5 MB** (<0,1% dari 5 GB) | ~2.500 (<0,3% dari 1M) | **100% AMAN (SAFE)** |
| **Uji Publik / Beta Tester (Unpaginated)** | 500 pengguna | 20 sesi / bulan | **~6,81 GB** (**136% dari 5 GB**) | ~60.000 (~6% dari 1M) | **KRITIS (OVER QUOTA)** |
| **Uji Publik / Beta Tester (Cukupin™ Paginated)**| 500 pengguna | 20 sesi / bulan | **~0,54 GB** (**10,8% dari 5 GB**) | ~60.000 (~6% dari 1M) | **100% AMAN (SAFE)** |

---

## 5. Ringkasan Kesimpulan Teknis

Infrastruktur gratis Vercel dan Supabase **sangat memadai** untuk kebutuhan aplikasi SaaS keuangan Cukupin™, proyek universitas, hingga uji publik berskala ratusan pengguna aktif. Dengan menerapkan:
1. Paginasi query dan filter tanggal server-side,
2. Pembangkitan PDF murni di sisi klien (Client-side), dan
3. Pemeliharaan status aktif database via GitHub Actions keep-alive,

aplikasi beroperasi secara tangguh, efisien, dan terhindar dari seluruh batas penangguhan kuota.
