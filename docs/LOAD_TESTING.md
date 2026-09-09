# Cukupin™ Load, Stress & Capacity Testing Guide (LOAD_TESTING.md)

Dokumentasi resmi arsitektur pengujian beban (*load testing*), uji lonjakan (*spike/stress testing*), dan uji ketahanan (*endurance/soak testing*) menggunakan **k6** dan **Node.js Native Engine** untuk aplikasi **Cukupin™**.

---

## 1. Pendahuluan & Sasaran Pengujian (Objectives & SLOs)

Sebagai aplikasi SaaS pencatatan keuangan pribadi dan mikro, Cukupin™ harus menjamin ketersediaan tinggi (*high availability*), responsivitas instan (<200 ms), serta kebal terhadap serangan banjir request (*DDoS / brute-force*) pada rute API publik.

### 1.1. Service Level Objectives (SLOs) Cukupin™
| Metrik | Target SLO Produksi | Toleransi Beban Puncak (Spike) | Keterangan |
| :--- | :--- | :--- | :--- |
| **Throughput (RPS)** | **> 200 req/s** | **> 800 req/s** | Kapasitas throughput request per detik |
| **Latency p(95)** | **< 150 ms** | **< 400 ms** | 95% request wajib selesai di bawah batas ini |
| **Latency p(99)** | **< 300 ms** | **< 800 ms** | 99% request wajib selesai di bawah batas ini |
| **Error Rate (5xx)** | **< 0,05%** | **< 0,5%** | Batas toleransi galat server internal |
| **Edge Throttling** | **HTTP 429** | **HTTP 429** | Flood request wajib di-throttle dengan header `Retry-After` |

---

## 2. Struktur Rangkaian Uji Beban (`tests/load/`)

```text
tests/load/
├── common.js                 # Konfigurasi bersama (Base URL, Headers, Threshold Profiles, Summary Reporter)
├── smoke_test.js             # Smoke Test: Uji kelayakan dasar (3 VUs, 30 detik)
├── average_load_test.js      # Load Test: Simulasi trafik harian (100 VUs, 5 menit)
├── spike_stress_test.js      # Stress Test: Lonjakan trafik ekstrem / breaking point (500 VUs)
├── rate_limit_test.js        # Throttling Test: Verifikasi ketahanan DDoS & status HTTP 429
└── run-simulated-load.js     # Standalone Runner: Eksekusi uji beban langsung via Node.js
```

---

## 3. Rincian Skenario Pengujian k6

### 3.1. Skenario 1: Smoke Test (`tests/load/smoke_test.js`)
- **Tujuan**: Verifikasi fungsionalitas dan kesehatan seluruh rute utama di bawah beban minimal sebelum uji skala penuh dijalankan.
- **Konfigurasi**: 3 Virtual Users (VU) selama 30 detik.
- **Target Endpoint**: `/`, `/auth/login`, `/legal/privacy`, `/manifest.webmanifest`.
- **Ambang Batas (Threshold)**: `p(95) < 150 ms`, `http_req_failed == 0%`.
- **Cara Menjalankan**:
  ```bash
  npm run test:load:k6:smoke
  # atau
  k6 run tests/load/smoke_test.js
  ```

---

### 3.2. Skenario 2: Average Load Test (`tests/load/average_load_test.js`)
- **Tujuan**: Mensimulasikan pola lalu lintas jam sibuk normal (misalnya pagi hari saat pengguna mengecek saldo atau malam hari saat mencatat pengeluaran harian).
- **Profil Tahapan (Stages)**:
  1. *Ramp-up*: 0 ke 50 VUs (1 menit).
  2. *Sustained Peak*: 100 VUs stabil (3 menit).
  3. *Ramp-down*: 100 ke 0 VUs (1 menit).
- **Target Endpoint**: Navigasi halaman, pembacaan aset CSS/Font, dan verifikasi Security Headers (CSP, HSTS).
- **Ambang Batas (Threshold)**: `p(95) < 200 ms`, `p(99) < 400 ms`, `http_req_failed < 0.1%`.
- **Cara Menjalankan**:
  ```bash
  npm run test:load:k6:average
  # atau
  k6 run tests/load/average_load_test.js
  ```

---

### 3.3. Skenario 3: Spike & Stress Test (`tests/load/spike_stress_test.js`)
- **Tujuan**: Menguji ketahanan sistem saat terjadi lonjakan masif mendadak (misalnya saat hari gajian atau rilis fitur viral *Financial Wrapped* ke media sosial), serta mendeteksi titik jenuh (*breaking point*).
- **Profil Tahapan (Stages)**:
  1. *Baseline Ramp*: 0 ke 100 VUs (30 detik).
  2. *Sudden Spike*: 100 ke 500 VUs (1 menit).
  3. *Peak Saturation*: 500 VUs bertahan (1 menit).
  4. *Recovery*: Turun kembali ke 100 VUs (30 detik).
  5. *Cooldown*: 0 VUs (30 detik).
- **Karakteristik**: *Think-time* dipercepat (0,2 – 1,2 detik per request) untuk menciptakan burst throughput tinggi.
- **Ambang Batas (Threshold)**: `p(95) < 500 ms`, `p(99) < 1.200 ms`, `http_req_failed < 1.0%`.
- **Cara Menjalankan**:
  ```bash
  npm run test:load:k6:spike
  # atau
  k6 run tests/load/spike_stress_test.js
  ```

---

### 3.4. Skenario 4: Rate Limiting & DDoS Shield Test (`tests/load/rate_limit_test.js`)
- **Tujuan**: Menguji efektivitas modul sliding-window rate limiter (`lib/rateLimit.ts`) pada Edge Proxy (`proxy.ts`) dan endpoint cron (`/api/cron/recurring-bills`).
- **Mekanisme**: Mengirimkan semburan request berfrekuensi sangat tinggi (50 ms interval) dari alamat IP statis (`198.51.100.42`).
- **Ekspektasi Verifikasi**:
  1. Permintaan awal (hingga 12 request) diterima dengan status `200` atau `401`.
  2. Setelah kuota 12 request/menit tercapai, Edge Proxy / Route Handler wajib menolak request berikutnya dengan status **`HTTP 429 Too Many Requests`**.
  3. Header respons wajib menyertakan telemetri:
     - `X-RateLimit-Limit: 12`
     - `X-RateLimit-Remaining: 0`
     - `X-RateLimit-Reset: <detik>`
     - `Retry-After: <detik>`
- **Cara Menjalankan**:
  ```bash
  npm run test:load:k6:rate-limit
  # atau
  k6 run tests/load/rate_limit_test.js
  ```

---

### 3.5. Skenario 5: Standalone Load Simulator (Node.js Native)
- **Tujuan**: Memberikan kemampuan pengujian beban instan bagi pengembang tanpa memerlukan instalasi binary `k6`.
- **Fitur**:
  - Menggunakan native Node.js HTTP/HTTPS client dan `perf_hooks`.
  - Mengukur min, max, avg, p50, p90, p95, dan p99 latency.
  - Menghitung Throughput (RPS) aktual dan tingkat kegagalan (*error rate*).
- **Cara Menjalankan**:
  ```bash
  # Menjalankan dengan default 20 concurrency dan 200 total requests
  npm run test:load

  # Atau kustomisasi parameter via environment variables
  CONCURRENCY=50 TOTAL_REQUESTS=1000 npm run test:load
  ```

---

## 4. Panduan Pemasangan k6 (Installation Guide)

Untuk menjalankan skrip `k6 run tests/load/*`, pasang k6 pada sistem operasi Anda:

### 4.1. Windows
```powershell
# Opsi A: Menggunakan Windows Package Manager (Winget - Bawaan Windows 11)
winget install k6 --source winget

# Opsi B: Menggunakan Chocolatey
choco install k6

# Opsi C: Menggunakan Scoop
scoop install k6
```

### 4.2. macOS
```bash
brew install k6
```

### 4.3. Linux (Ubuntu / Debian)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### 4.4. Docker Container (Universal)
```bash
docker run --rm -i --net="host" grafana/k6 run - < tests/load/smoke_test.js
```

---

## 5. Pengujian Terhadap Server Target (Staging / Produksi)

Secara default, skrip mengarah ke `http://localhost:3000`. Untuk menguji lingkungan staging atau produksi Vercel:

```bash
# Menjalankan load test terhadap domain produksi Vercel
BASE_URL=https://cukupin.app k6 run tests/load/average_load_test.js

# Menjalankan smoke test terhadap preview deployment
BASE_URL=https://cukupin-preview.vercel.app k6 run tests/load/smoke_test.js
```

> [!CAUTION]
> **Peringatan Uji Beban di Produksi:**
> Jangan menjalankan uji beban ekstrim (>500 VUs) secara terus menerus pada infrastruktur Vercel Hobby atau Supabase Free Tier karena berisiko menghabiskan kuota bulanan gratis (Fast Data Transfer & Function Invocations). Gunakan lingkungan lokal atau staging untuk stress testing mendalam.

---

## 6. Integrasi CI/CD (GitHub Actions Load Regression Workflow)

Tambahkan workflow `.github/workflows/load-test.yml` untuk memverifikasi performa secara berkala:

```yaml
name: Automated Performance & Load Testing

on:
  push:
    branches: [main]
  schedule:
    # Berjalan mingguan setiap hari Minggu pukul 02:00 UTC
    - cron: '0 2 * * 0'

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Next.js Production Bundle
        run: npm run build

      - name: Start Production Server
        run: npm run start &
        env:
          PORT: 3000

      - name: Wait for Server Readiness
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Execute Node.js Simulated Load Test
        run: npm run test:load
        env:
          CONCURRENCY: 25
          TOTAL_REQUESTS: 500

      - name: Setup k6
        uses: grafana/setup-k6-action@v1

      - name: Run k6 Smoke Test
        run: k6 run tests/load/smoke_test.js

      - name: Run k6 Rate Limit Validation Test
        run: k6 run tests/load/rate_limit_test.js
```

---

## 7. Rangkuman & Pedoman Pemecahan Masalah (Troubleshooting)

1. **Tingkat Galat 429 Muncul di Load Test Biasa:**
   - Jika endpoint API publik mengembalikan 429 pada uji beban pengguna normal, periksa apakah seluruh VU membagikan IP yang sama (misal saat pengujian lokal dari mesin tunggal).
   - Di lingkungan produksi, request datang dari ribuan IP unik sehingga kuota 60 req/menit per IP sangat leluasa.
2. **Lonjakan Latensi p(99) di Atas 1 Detik:**
   - Periksa apakah database PostgreSQL Supabase mengalami koneksi jenuh (*connection pooling exhaustion*).
   - Pastikan kueri selalu menggunakan composite index dan dibatasi oleh `.range(from, to)` paginasi.
3. **Pemuatan Aset Statis Lambat:**
   - Pastikan caching CDN Vercel aktif (header `Cache-Control: public, max-age=31536000, immutable` pada folder `_next/static/`).
