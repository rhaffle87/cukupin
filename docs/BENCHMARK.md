# Cukupin™ Performance, Egress & Resource Capacity Benchmarks (BENCHMARK.md)

Dokumen ini menyajikan data tolok ukur empiris (*empirical benchmarks*), data pengukuran byte aktual, kalkulasi matematis kapasitas transfer database (*outbound egress*), serta pengujian batasan komputasi (*latency & timeout constraints*) untuk aplikasi Cukupin™ pada arsitektur hybrid **Next.js 16 (Vercel)** dan **PostgreSQL (Supabase)**.

Data diperoleh secara otomatis melalui pengeksekusian tolok ukur pada berkas [`scripts/run-benchmarks.js`](../scripts/run-benchmarks.js) dan rangkaian pengujian [`tests/resourcesAndLimits.test.ts`](../tests/resourcesAndLimits.test.ts).

---

## 1. Analisis Ukuran Payload Data (Data Footprint Benchmarks)

Setiap entitas data di Cukupin™ dirancang secara minimalis tanpa redundansi bidang JSON untuk menekan ukuran transfer per kueri.

### 1.1. Ukuran Baris Data Individual
Hasil pengukuran byte UTF-8 aktual menggunakan `calculatePayloadBytes` dan kompresi `zlib`:

| Entitas Data | Contoh Record | Ukuran JSON Mentah (Bytes) | Ukuran Terkompresi Gzip (Bytes) |
| :--- | :--- | :--- | :--- |
| **Transaksi (`transactions`)** | ID, amount, description, date, method, note | **~240 – 300 B** | **~85 – 110 B** |
| **Target Tabungan (`saving_goals`)** | ID, name, target, current, deadline | **~180 – 220 B** | **~70 – 90 B** |
| **Daftar Impian (`wishlist`)** | ID, name, price, url, priority | **~160 – 210 B** | **~65 – 80 B** |
| **Tagihan Rutin (`recurring_bills`)**| ID, name, amount, due_day, frequency, last_logged | **~190 – 240 B** | **~75 – 95 B** |
| **Pagu Anggaran (`category_budgets`)**| ID, category, monthly_limit, created_at | **~140 – 180 B** | **~55 – 70 B** |

---

## 2. Tolok Ukur Skalabilitas Payload: Unpaginated vs Paginated

Kueri tanpa paginasi (`SELECT * FROM transactions`) membebani jaringan secara linier seiring bertambahnya riwayat keuangan pengguna. Sebaliknya, Cukupin™ mengunci kueri awal pada 25 transaksi terakhir (`calculatePaginationRange(1, 25)`).

### 2.1. Tabel Data Hasil Pengukuran Empiris
Data aktual dari 10 hingga 2.500 transaksi:

| Jumlah Transaksi dalam DB | Unpaginated Mentah (KB) | Unpaginated Gzip (KB) | Cukupin™ Paginated (KB) | Paginated Gzip (KB) | Penghematan Bandwidth (%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **10 Transaksi** | 2,95 KB | 0,52 KB | **2,95 KB** | 0,52 KB | **0,0%** (Muat dalam 1 halaman) |
| **25 Transaksi** | 7,35 KB | 0,83 KB | **7,35 KB** | 0,83 KB | **0,0%** (1 halaman penuh) |
| **50 Transaksi** | 14,68 KB | 1,33 KB | **7,35 KB** | 0,83 KB | **49,9% Hemat** |
| **100 Transaksi** | 29,42 KB | 2,31 KB | **7,35 KB** | 0,83 KB | **75,0% Hemat** |
| **250 Transaksi** | 73,79 KB | 5,27 KB | **7,35 KB** | 0,83 KB | **90,0% Hemat** |
| **500 Transaksi** | 147,68 KB | 10,08 KB | **7,35 KB** | 0,83 KB | **95,0% Hemat** |
| **1.000 Transaksi** | 295,58 KB | 19,68 KB | **7,35 KB** | 0,83 KB | **97,5% Hemat** |
| **2.500 Transaksi** | 741,24 KB | 48,53 KB | **7,35 KB** | 0,83 KB | **99,0% Hemat** |

### 2.2. Grafik Visualisasi Pertumbuhan Ukuran Payload
![Grafik Skalabilitas Payload Cukupin](../public/benchmarks/benchmark_payload_scaling.png)

> [!TIP]
> **Analisis Grafik 1**:
> Pada kueri tanpa paginasi, kurva payload membumbung secara curam dari 2,95 KB hingga **741,24 KB (hampir 1 MB per kueri)**.
> Dengan arsitektur paginasi Cukupin™, kurva payload tetap konstan dan horizontal pada **7,35 KB**, menghasilkan penghematan transfer data sebesar **99,0%** pada akun jangka panjang.

---

## 3. Simulasi Matematis Egress Bulanan vs Kuota Supabase (5 GB)

Supabase Free Tier membatasi *outbound database egress* maksimal **5,0 GB (5.368.709.120 bytes) per bulan**. Kami menyimulasikan 5 skenario pertumbuhan pengguna menggunakan formula:

$$\text{Total Egress} = \text{Pengguna (MAU)} \times \frac{\text{Sesi}}{\text{Bulan}} \times \frac{\text{Kueri}}{\text{Sesi}} \times \text{Ukuran Payload Rata-rata}$$

### Parameter Skenario:
- Payload metadata pendukung (`goals`, `wishlist`, `bills`, `budgets`) = ~3.500 bytes.
- Rata-rata ukuran per transaksi = ~250 bytes.

### 3.1. Tabel Data Simulasi Egress

| Skenario Beban Kerja | Parameter Penggunaan | Total Kueri / Bulan | Unpaginated Egress (GB) | % Kuota Supabase 5GB | Cukupin™ Paginated (GB) | % Kuota Supabase 5GB | Status Kuota |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Solo Developer** | 1 user · 60 sesi · 4 kueri · 50 tx | 240 kueri | 0,004 GB | 0,1% | **0,002 GB** | <0,1% | **SAFE** |
| **2. Demo Kelas Akademik** | 30 user · 8 sesi · 5 kueri · 40 tx | 1.200 kueri | 0,015 GB | 0,3% | **0,011 GB** | 0,2% | **SAFE** |
| **3. Small Beta** | 150 user · 15 sesi · 6 kueri · 200 tx | 13.500 kueri | 0,673 GB | 13,5% | **0,123 GB** | 2,5% | **SAFE** |
| **4. Public Launch** | 500 user · 20 sesi · 6 kueri · 500 tx | 60.000 kueri | **7,180 GB** | **143,6% (BREACH)** | **0,545 GB** | **10,9%** | **SAFE** |
| **5. Scaleout SaaS** | 1.000 user · 25 sesi · 6 kueri · 600 tx | 150.000 kueri | **21,444 GB** | **428,9% (BREACH)** | **1,362 GB** | **27,2%** | **SAFE** |

### 3.2. Grafik Perbandingan Egress Bulanan
![Grafik Perbandingan Egress Bulanan](../public/benchmarks/benchmark_egress_comparison.png)

> [!IMPORTANT]
> **Analisis Grafik 2**:
> Pada skala **Public Launch (500 pengguna)**, aplikasi tanpa paginasi akan mengonsumsi **7,18 GB per bulan**, menembus batas 5 GB sebesar **143,6%**. Akun database Supabase akan otomatis dinonaktifkan di pertengahan bulan.
> Sebaliknya, implementasi Cukupin™ hanya mengonsumsi **0,545 GB (10,9% kuota)**, menyisakan margin keamanan sebesar **89,1%**. Bahkan pada skala **1.000 pengguna aktif**, konsumsi egress Cukupin™ hanya **1,36 GB (27,2%)**, tetap aman di bawah batas gratis.

---

## 4. Tolok Ukur Latensi & Batasan Waktu Eksekusi (10s Timeout Constraint)

Vercel Hobby menerapkan batas waktu eksekusi fungsi serverless mutlak sebesar **10.000 ms (10 detik)**.

### 4.1. Pengukuran Latensi Agregasi Matematika Klien (1.000 Iterasi)
Diuji pada kumpulan data 500 transaksi menggunakan modul Node.js `perf_hooks`:

| Operasi Agregasi Finansial | Waktu Rata-Rata (Avg) | Persentil 50 (Median) | Persentil 95 (p95) | Persentil 99 (p99) |
| :--- | :--- | :--- | :--- | :--- |
| **Kalkulasi Total (`totals`)** | **0,094 ms** | 0,066 ms | 0,180 ms | 0,578 ms |
| **Kategori Breakdown (`categoryBreakdown`)** | **0,199 ms** | 0,087 ms | 0,287 ms | 1,645 ms |
| **Aturan 50/30/20 (`budgetRule503020`)** | **0,031 ms** | 0,018 ms | 0,131 ms | 0,229 ms |

*Semua operasi agregasi selesai dalam waktu **sub-milidetik (<0,2 ms)**, memastikan antarmuka tetap responsif 60fps tanpa lagging.*

### 4.2. Latensi Sistem vs Batas 10 Detik Vercel

| Komponen / Operasi | Lingkungan Eksekusi | Durasi Rata-rata | Batas Maksimum | Margin Keamanan |
| :--- | :--- | :--- | :--- | :--- |
| **Agregasi Matematika Klien** | Client CPU (V8 Engine) | **0,12 ms** | 10.000 ms | **>99,99%** |
| **Sliding-Window Rate Limiter** | In-Memory Edge (`lib/rateLimit.ts`) | **0,03 ms** | 10.000 ms | **>99,99%** |
| **Edge Proxy Auth Middleware** | Next.js Edge (`proxy.ts`) | **25 ms** | 10.000 ms | **>99,75%** |
| **Kueri Supabase Terindeks** | PostgreSQL (Supabase) | **78 ms** | 10.000 ms | **>99,22%** |
| **Server Cron Tagihan Otomatis** | Vercel Serverless Function | **295 ms** | 10.000 ms | **>97,05%** |
| **Ekspor PDF & Rapor Grafis** | **Client-Side DOM & Canvas** | **0 ms (Serverless)** | 10.000 ms | **100% Bebas Risiko Timeout** |

### 4.3. Grafik Latensi Operasi vs Batas 10 Detik
![Grafik Latensi Operasi vs Batas 10 Detik](../public/benchmarks/benchmark_latency_breakdown.png)

> [!TIP]
> **Analisis Grafik 3**:
> Seluruh operasi berbasis serverless (`Edge Proxy`, `Supabase Query`, `Cron Route`) beroperasi dalam rentang **25 ms – 295 ms**, berada jauh di bawah garis merah batas 10.000 ms.
> Dengan mengeksekusi pembuatan PDF dan kartu rapor di browser pengguna (Client-Side), beban komputasi serverless adalah **0 ms**, meniadakan risiko kegagalan rendering akibat cold start atau koneksi lambat.

---

## 5. Ringkasan & Rekomendasi Arsitektur

1. **Efektivitas Paginasi**: Paginasi 25 baris menekan transfer data hingga **95–99%** pada akun dengan ratusan transaksi, menjadikan kuota 5 GB Supabase mampu menopang **hingga >1.000 pengguna aktif** tanpa biaya.
2. **Keamanan Timeout**: Arsitektur *client-side document generation* terbukti berhasil melindungi sistem dari batas keras 10 detik Vercel Hobby.
3. **Automasi Pemeliharaan**: Workflow GitHub Actions keep-alive ([`.github/workflows/supabase-keepalive.yml`](../.github/workflows/supabase-keepalive.yml)) menjaga database tetap aktif 24/7 dan mengeliminasi risiko penonaktifan otomatis akibat 7 hari tanpa aktivitas.

---

## 6. Perintah Menjalankan Benchmark Secara Mandiri

```bash
# Menjalankan micro-benchmark dan menghasilkan berkas data benchmark_results.json
node scripts/run-benchmarks.js

# Menghasilkan ulang grafik visual beresolusi tinggi (PNG)
python scripts/generate_benchmark_charts.py

# Menjalankan pengujian unit dan verifikasi matematis limit free tier
npx vitest run tests/resourcesAndLimits.test.ts
```
