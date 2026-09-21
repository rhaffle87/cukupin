# -*- coding: utf-8 -*-
"""
generate_proposal.py
Canonical builder for Cukupin™ Business Plan Proposal:
1. 'docs/proposal/Proposal Bisnis Cukupin (Financial Tracker).md'
2. 'docs/proposal/proposal_preview.html'
3. 'docs/proposal/Proposal Bisnis Cukupin (Financial Tracker).pdf'

Features:
- Standard Oxford College of Marketing TOWS Matrix (clear, non-cluttered, executive)
- Clean mathematical formula callout cards with proper fractions and zero escape corruptions
- 100% verified real academic & institutional citations (DOI, ISBN, official links)
- Organized asset references pointing to docs/proposal/assets/
"""

import os
import sys
import markdown
from playwright.sync_api import sync_playwright

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROPOSAL_DIR = os.path.join(BASE_DIR, "docs", "proposal")
MD_PATH = os.path.join(PROPOSAL_DIR, "Proposal Bisnis Cukupin (Financial Tracker).md")
HTML_PATH = os.path.join(PROPOSAL_DIR, "proposal_preview.html")
PDF_PATH = os.path.join(PROPOSAL_DIR, "Proposal Bisnis Cukupin (Financial Tracker).pdf")
ASSETS_DIR = os.path.join(PROPOSAL_DIR, "assets")
abs_assets_url = "file:///" + ASSETS_DIR.replace("\\", "/") + "/"

MD_CONTENT = r"""# PROPOSAL BUSINESS PLAN
# CUKUPIN™
### Aplikasi Manajemen dan Pencatatan Arus Kas Pribadi & Usaha Mikro Berbasis Web & Mobile (PWA) yang Cepat, Hening, dan Mengutamakan Privasi Pengguna

---

**Mata Kuliah:**  
Kewirausahaan Berbasis Teknologi  

**Dosen Pengampu:**  
Muchammad Nurif, SE.MT  

**Disusun Oleh:**  
**Rafli Alif Ihza Hartono**  
NRP 5048231003  

**Program Studi Teknik Telekomunikasi**  
**Departemen Teknik Elektro**  
**Fakultas Teknologi Elektro dan Informatika Cerdas (FTEIC)**  
**Institut Teknologi Sepuluh Nopember (ITS)**  
**Surabaya**  
**2026**

<div style="page-break-after: always;"></div>

---

## EXECUTIVE SUMMARY

Perkembangan ekonomi digital di Indonesia mengalami lonjakan eksponensial dalam beberapa tahun terakhir. Berdasarkan data Bank Indonesia, transaksi pembayaran digital melalui Quick Response Code Indonesian Standard (QRIS) dan dompet digital (*e-wallet*) telah menjangkau puluhan juta pengguna dan mencatatkan miliaran transaksi per tahun. Kemudahan pembayaran nirsentuh (*cashless*) tersebut, di satu sisi, memberikan efisiensi luar biasa bagi aktivitas harian. Namun, di sisi lain, kemudahan transaksi digital memicu fenomena penurunan *pain of paying* (sensasi beban saat mengeluarkan uang fisik), yang berujung pada kebocoran anggaran mikroskopis (*phantom expenses* dan *latte factor*). Masyarakat sering kali mendapati saldo tabungan habis sebelum akhir bulan tanpa mengetahui ke mana dana tersebut mengalir.

Survei Nasional Literasi dan Inklusi Keuangan (SNLKI) oleh Otoritas Jasa Keuangan (OJK) bersama Badan Pusat Statistik (BPS) menunjukkan realitas penting: indeks inklusi keuangan Indonesia telah melampaui 85%, namun indeks literasi keuangan riil masih tertahan di kisaran 49%. Hal ini membuktikan bahwa masyarakat memiliki akses mudah ke berbagai fasilitas pembayaran digital dan pinjaman daring (*paylater* maupun pinjol), namun belum memiliki kebiasaan atau alat bantu pencatatan arus kas yang sehat.

Aplikasi pencatat keuangan yang saat ini beredar di pasar umumnya memiliki empat kendala fundamental yang menghambat konsistensi pengguna:
1. **Beban Iklan Invasif:** Kemunculan iklan *banner* dan video berulang (*pop-up*) yang mengganggu fokus serta menurunkan kenyamanan pengguna saat ingin mencatat pengeluaran harian.
2. **Kompleksitas Berlebih (*Bloatware*):** Antarmuka yang rumit dengan puluhan menu membingungkan serta permintaan izin privasi berlebihan (akses kontak, panggilan, pesan singkat, dan lokasi gawai).
3. **Ketergantungan Internet Penuh (*Cloud-Locked*):** Aplikasi gagal dibuka atau mengalami *loading* lama saat pengguna berada di area bersinyal lemah atau kehabisan paket data, sehingga momen pencatatan tertunda dan akhirnya terlupakan (*record friction*).
4. **Buku Kas Manual yang Rentan:** Pencatatan konvensional di buku tulis rentan hilang, rusak, serta tidak mampu menyajikan grafik analitik otomatis dan simulasi target tabungan.

Menjawab tantangan tersebut, kami menghadirkan **Cukupin™**, sebuah aplikasi pencatat dan pengelola keuangan harian dengan filosofi **"Quiet Ledger"** (Buku Kas yang Hening, Bersih, dan Menenangkan). Cukupin™ dirancang untuk dapat digunakan dengan waktu input di bawah 5 detik (*sub-5-second entry*), bebas dari segala bentuk iklan komersial (*zero ads*), beroperasi secara instan tanpa ketergantungan sinyal internet (*offline-first Progressive Web App*), serta menjamin kerahasiaan data finansial pengguna seutuhnya.

Dari sisi keberlanjutan bisnis, Cukupin™ mengadopsi model **Freemium Berimbang**. Fitur inti pencatatan, anggaran bulanan, dan mode *offline* disediakan gratis tanpa batas waktu bagi seluruh masyarakat. Sementara itu, model monetisasi bertumpu pada langganan **Cukupin™ Pro** seharga **Rp 89.000 / tahun** (ekuivalen hanya Rp 7.416 / bulan) atau **Rp 12.000 / bulan**, yang menyasar pengguna yang membutuhkan multi-rekening tanpa batas, target tabungan kustom, laporan visual mendalam, serta ekspor pembukuan terstruktur (CSV dan PDF) untuk pelaporan SPT atau pembukuan usaha mikro.

Dengan struktur biaya operasional yang sangat efisien (*lean tech startup*), Cukupin™ memiliki margin kontribusi sebesar **95,05%** per pengguna Pro. Analisis titik impas (*Break-Even Point* / BEP) diproyeksikan tercapai pada angka **880 pengguna berbayar per tahun** (atau omzet tahunan Rp 78.320.000). Modal awal investasi sebesar **Rp 40.000.000** diproyeksikan kembali secara penuh (*Payback Period*) pada **bulan ke-14 hingga ke-16** operasional komersial. Proposal ini memaparkan secara komprehensif analisis kelayakan pasar, perumusan strategi SWOT & TOWS, segmentasi pelanggan, keunggulan bersaing terhadap kompetitor, serta cetak biru finansial jangka menengah Cukupin™.

<div style="page-break-after: always;"></div>

---

## KATA PENGANTAR

### Assalamu’alaikum Warahmatullahi Wabarakatuh, Salam Sejahtera bagi Kita Semua

Puji dan syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa, karena berkat limpahan rahmat, petunjuk, dan karunia-Nya, penyusunan dokumen rancangan usaha bertajuk **Proposal Business Plan: “Cukupin™ (Smart Personal & Micro-Business Financial Tracker)”** ini dapat diselesaikan dengan baik, sistematis, dan tepat waktu.

Proposal bisnis ini disusun untuk memenuhi tugas mata kuliah **Kewirausahaan Berbasis Teknologi** pada Program Studi Teknik Telekomunikasi, Departemen Teknik Elektro, Fakultas Teknologi Elektro dan Informatika Cerdas (FTEIC), Institut Teknologi Sepuluh Nopember (ITS) Surabaya. Dokumen ini menjadi wujud nyata pengaplikasian ilmu kepemimpinan, strategi kewirausahaan, serta inovasi teknologi informasi dalam menjawab permasalahan riil yang dihadapi oleh masyarakat perkotaan, generasi muda, dan pelaku usaha mikro di Indonesia. Era transformasi digital tidak hanya membuka peluang efisiensi bertransaksi, tetapi juga memunculkan tantangan baru terkait perilaku konsumtif dan ketidaksiapan literasi keuangan harian. Kehadiran Cukupin™ dirancang untuk menjembatani kesenjangan tersebut melalui pendekatan teknologi yang membumi, cepat, serta berpihak pada privasi dan ketenangan pengguna.

Kami menyampaikan apresiasi dan ucapan terima kasih yang sebesar-besarnya kepada:
1. **Bapak Muchammad Nurif, SE.MT** selaku Dosen Pengampu mata kuliah Kewirausahaan Berbasis Teknologi yang senantiasa memberikan bimbingan kritis, masukan metodologis, dan arahan strategis dalam penyusunan studi kelayakan bisnis ini.
2. Segenap sivitas akademika Departemen Teknik Elektro dan FTEIC Institut Teknologi Sepuluh Nopember (ITS) yang telah memfasilitasi iklim riset dan inovasi technopreneurship yang kondusif.
3. Para responden awal, pengguna fase uji coba (*beta testers*), rekan-rekan mahasiswa ITS, dan pelaku usaha mikro di sekitar kampus yang telah bersedia memberikan umpan balik berharga mengenai kendala pencatatan keuangan harian yang mereka rasakan.

Penyusun menyadari sepenuhnya bahwa proposal bisnis ini masih memiliki ruang untuk penyempurnaan di masa mendatang seiring dengan dinamika industri teknologi finansial. Oleh karena itu, penyusun sangat terbuka terhadap kritik, saran konstruktif, serta dialog strategis demi perbaikan dan kesiapan komersialisasi produk secara lebih luas.

Semoga proposal bisnis Cukupin™ ini dapat memberikan kontribusi pemikiran yang bermanfaat bagi dunia akademis, praktisi bisnis rintisan (*startup*), serta masyarakat luas dalam mewujudkan tatanan kehidupan finansial yang lebih tertib, bijak, dan berkelanjutan.

### Wassalamu’alaikum Warahmatullahi Wabarakatuh.

**Surabaya, 2026**  
*Rafli Alif Ihza Hartono & Tim Pengembang Cukupin™*

<div style="page-break-after: always;"></div>

---

## DAFTAR ISI

* **EXECUTIVE SUMMARY** .......................................................................................................... ii
* **KATA PENGANTAR** ............................................................................................................... iii
* **DAFTAR ISI** ........................................................................................................................... iv
* **BAB I PENDAHULUAN** ......................................................................................................... 1
  * 1.1 Latar Belakang Masalah ................................................................................................... 1
  * 1.2 Rumusan Masalah ............................................................................................................ 3
  * 1.3 Visi dan Misi Usaha .......................................................................................................... 3
  * 1.4 Tujuan Penyusunan Proposal ............................................................................................ 4
  * 1.5 Manfaat Penyusunan Proposal .......................................................................................... 4
* **BAB II PERENCANAAN BISNIS & STRATEGIS** ................................................................... 6
  * 2.1 Nilai Tambah & Solusi Produk (*Value Proposition*) ......................................................... 6
  * 2.2 Analisis SWOT (Kekuatan, Kelemahan, Peluang, Ancaman) ............................................ 8
  * 2.3 Matriks TOWS (Formulasi Strategi Terpadu) .................................................................... 9
  * 2.4 Aspek Pasar & Pemasaran (STP & Bauran Pemasaran 4P) ............................................. 11
  * 2.5 Aspek Operasional & Alur Penggunaan (*Product & Customer Journey*) ......................... 14
  * 2.6 Analisis Kompetitor & Keunggulan Bersaing (*Competitive Moat*) ................................... 16
  * 2.7 Analisis Organisasi & Sumber Daya Manusia .................................................................. 18
* **BAB III PERENCANAAN KEUANGAN & KELAYAKAN USAHA** .......................................... 20
  * 3.1 Modal Awal Usaha (CapEx) ............................................................................................. 20
  * 3.2 Biaya Tetap Operasional (Fixed OpEx) ............................................................................ 21
  * 3.3 Biaya Variabel (Variable Cost) .......................................................................................... 21
  * 3.4 Model Monetisasi & Penetapan Harga (*Pricing Strategy*) .............................................. 22
  * 3.5 Penentuan Harga Pokok Penjualan (HPP) & Margin Kontribusi ........................................ 23
  * 3.6 Proyeksi Arus Kas & Laba Rugi 2 Tahun .......................................................................... 24
  * 3.7 Analisis Titik Impas (BEP Unit & BEP Rupiah) ................................................................. 25
  * 3.8 Analisis Periode Pengembalian Modal (Payback Period / PBP) ........................................ 26
* **BAB IV PENUTUP** ................................................................................................................. 27
  * 4.1 Kesimpulan ..................................................................................................................... 27
  * 4.2 Saran & Rekomendasi Tindak Lanjut ................................................................................ 28
* **DAFTAR PUSTAKA** .............................................................................................................. 29
* **LAMPIRAN** ........................................................................................................................... 30
  * Lampiran A: Value Proposition Canvas (VPC) ...................................................................... 30
  * Lampiran B: Business Model Canvas (BMC - 9 Blok Osterwalder) ........................................ 31
  * Lampiran C: Desain Antarmuka & Tangkapan Layar Aplikasi Cukupin™ ............................... 32

<div style="page-break-after: always;"></div>

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang

Perkembangan teknologi finansial di Indonesia telah mengubah lanskap transaksi masyarakat secara fundamental. Keberadaan ekosistem pembayaran nirsentuh, seperti QRIS (Quick Response Code Indonesian Standard) yang diprakarsai Bank Indonesia, serta menjamurnya dompet digital seperti GoPay, OVO, ShopeePay, dan DANA, telah menciptakan kenyamanan bertransaksi yang belum pernah terjadi sebelumnya. Berdasarkan laporan resmi Bank Indonesia (2024), volume transaksi QRIS tumbuh lebih dari 150% secara tahunan dengan nilai transaksi mencapai ratusan triliun rupiah, didorong oleh adopsi masif dari puluhan juta *merchant* UMKM di seluruh nusantara.

Di balik efisiensi tersebut, perubahan metode pembayaran dari uang tunai ke saldo digital membawa dampak psikologis yang signifikan terhadap perilaku belanja masyarakat. Dalam kajian ekonomi perilaku (*behavioral economics*) yang dipelopori oleh Prelec & Loewenstein (1998) serta Thaler (1999), uang fisik menghadirkan efek psikologis yang disebut *pain of paying* (sensasi berat atau enggan ketika melepaskan uang kertas secara langsung). Ketika transaksi berganti menjadi pemindaian kode QR atau satu ketukan tombol di ponsel pintar, sensasi psikologis tersebut menghilang (*frictionless spending*). Akibatnya, masyarakat sangat rentan mengalami fenomena **kebocoran anggaran mikroskopis (*phantom expenses* / *latte factor*)**—pengeluaran-pengeluaran kecil yang tampaknya tidak berarti (seperti jajan kopi harian, biaya pesan-antar makanan, biaya admin transfer, atau tagihan langganan digital yang terlupakan) namun secara kumulatif menghabiskan 25% hingga 40% dari total pendapatan bulanan.

Fenomena ini diperparah oleh kesenjangan antara inklusi keuangan dan literasi keuangan. Publikasi Otoritas Jasa Keuangan (OJK, 2024) melalui Survei Nasional Literasi dan Inklusi Keuangan (SNLKI) mencatat bahwa indeks inklusi keuangan Indonesia telah mencapai 85,1%, namun indeks literasi keuangannya baru berada pada level 49,68%. Artinya, sebagian besar masyarakat memiliki sarana untuk membelanjakan uang secara digital dan mengakses produk pinjaman daring (*paylater* maupun pinjol), namun tidak memiliki kapasitas atau alat bantu yang disiplin untuk mengelola, mencatat, dan merencanakan arus kas mereka sendiri.

Kendati kesadaran masyarakat mengenai pentingnya hidup hemat (*frugal living*) dan pencatatan kas semakin meningkat, solusi aplikasi pencatat keuangan yang saat ini tersedia di pasar belum mampu memberikan kenyamanan yang optimal bagi masyarakat umum. Sebagian besar aplikasi pencatat keuangan di pasar memiliki berbagai kelemahan mendasar:

1. **Monetisasi Agresif Berbasis Iklan:** Aplikasi gratisan di Play Store atau App Store dipenuhi oleh iklan *pop-up*, iklan spanduk, hingga tawaran pinjaman online yang sangat mengganggu. Pengguna yang awalnya ingin mencatat pengeluaran secara cepat justru terdistraksi oleh penawaran komersial yang berisik.
2. **Friksi Pencatatan yang Lambat:** Aplikasi yang beredar saat ini membutuhkan waktu lebih dari 15 hingga 30 detik hanya untuk membuka aplikasi dan mencatat satu transaksi karena banyaknya menu, animasi promosi, dan proses pemuatan (*loading*) yang berat. Akibatnya, pengguna malas mencatat saat sedang berada di kasir atau di perjalanan, hingga akhirnya catatan terlupakan.
3. **Ketergantungan Kuota dan Koneksi Internet:** Sebagian besar aplikasi modern bergantung penuh pada peladen awan (*cloud server*). Ketika pengguna berada di lokasi dengan sinyal lemah (misalnya di basement parkir, pasar tradisional, atau daerah minim sinyal), aplikasi tidak dapat dibuka atau catatan transaksi gagal tersimpan.
4. **Kekhawatiran terhadap Privasi Data Finansial:** Banyak aplikasi meminta izin akses perangkat yang tidak relevan, seperti akses ke kontak telepon, riwayat SMS, dan galeri foto. Masyarakat modern semakin sadar dan waspada terhadap potensi penyalahgunaan atau kebocoran data transaksi pribadi mereka.
5. **Kelemahan Buku Kas Fisik:** Di sisi lain, buku kas tulis manual masih digunakan oleh jutaan pedagang mikro dan individu tradisional. Meskipun bebas iklan, buku kas fisik sangat rentan hilang, rusak terkena cairan, menyita waktu untuk proses rekapitulasi manual di akhir bulan, serta tidak dapat memberikan visualisasi tren pengeluaran.

Berangkat dari problematika riil tersebut, hadirlah **Cukupin™**. Cukupin™ didesain sebagai platform pencatatan keuangan pribadi dan usaha mikro berbasis web dan peramban ponsel pintar (*Progressive Web App* / PWA) yang mengedepankan prinsip **kecepatan, kesederhanaan, dan kedaulatan data**. Melalui pendekatan antarmuka yang bersih dan bebas iklan, Cukupin™ memungkinkan siapa pun mencatat arus kas masuk dan keluar dalam waktu kurang dari 5 detik, dapat diakses dalam kondisi luring (*offline*), serta menyajikan laporan keuangan visual yang mendalam tanpa membocorkan privasi pengguna ke pihak ketiga.

---

### 1.2 Rumusan Masalah

Berdasarkan latar belakang yang telah dipaparkan, rumusan masalah dalam proposal perencanaan bisnis ini dirumuskan sebagai berikut:

1. Bagaimana merancang aplikasi pencatat keuangan yang mampu meminimalkan friksi pencatatan harian (*sub-5-second entry*) agar pengguna dapat konsisten mengelola arus kas pribadi dan usaha mikro?
2. Bagaimana formulasi strategi pengembangan dan keunggulan bersaing Cukupin™ dengan memanfaatkan analisis SWOT dan Matriks TOWS terhadap lanskap kompetitor yang ada?
3. Siapa saja target segmen pasar yang paling potensial menyerap layanan Cukupin™ di Indonesia, dan bagaimana strategi bauran pemasaran (4P) yang tepat untuk menjangkaunya?
4. Bagaimana kelayakan model finansial Cukupin™ dalam mencapai titik impas (*Break-Even Point*) dan periode pengembalian modal (*Payback Period*) melalui skema *Freemium* yang transparan tanpa bergantung pada iklan invasif?

---

### 1.3 Visi dan Misi Usaha

#### Visi Perusahaan
Menjadi platform manajemen arus kas harian terdepan di Indonesia yang paling dipercaya, hening, dan mudah diakses oleh seluruh lapisan masyarakat dalam mewujudkan kemandirian finansial yang sehat dan berkelanjutan (*financial peace of mind*).

#### Misi Usaha
1. **Menyediakan Antarmuka Bebas Friksi:** Mengembangkan aplikasi pencatatan keuangan yang dapat diakses dengan cepat, ringan, intuitif, dan sepenuhnya bebas dari iklan komersial yang mengganggu.
2. **Menjamin Kedaulatan Privasi Pengguna:** Menerapkan standar pengamanan data lokal di perangkat pengguna dengan enkripsi modern, memastikan tidak ada data transaksi pribadi yang dieksploitasi untuk kepentingan komersial pihak ketiga.
3. **Mendorong Inklusi & Literasi Finansial:** Menyajikan laporan arus kas dan penetapan batas anggaran (*budgeting*) yang mudah dipahami oleh masyarakat awam tanpa memerlukan latar belakang ilmu akuntansi formal.
4. **Membangun Ekosistem Usaha yang Berkelanjutan:** Menghadirkan skema bisnis *Freemium* yang adil dan terjangkau bagi pengguna individu maupun pelaku UMKM mikro.

---

### 1.4 Tujuan Penyusunan Proposal

Tujuan dari penyusunan proposal rencana bisnis ini adalah sebagai berikut:
1. **Menguji Kelayakan Konsep Produk:** Memvalidasi premis bahwa aplikasi pencatat keuangan tanpa iklan dengan model *offline-first PWA* memiliki ceruk pasar yang solid dan bersedia membayar (*willingness to pay*) di Indonesia.
2. **Merumuskan Strategi Eksekusi Bisnis:** Memetakan langkah strategis komprehensif, mulai dari pengembangan produk, penetrasi pasar melalui bauran pemasaran 4P, hingga antisipasi ancaman persaingan melalui matriks TOWS.
3. **Menyusun Rencana Keuangan Terukur:** Menghitung kebutuhan modal awal (CapEx), biaya operasional (OpEx), penentuan struktur harga, titik impas (BEP), serta proyeksi arus kas 2 tahun ke depan guna menarik minat investor dan mitra strategis.
4. **Membuka Peluang Kolaborasi:** Menjadi dokumen rujukan formal dalam menjajaki kemitraan dengan komunitas melek finansial, institusi pendidikan seperti Institut Teknologi Sepuluh Nopember (ITS), inkubator bisnis teknologi, dan lembaga inklusi keuangan nasional.

---

### 1.5 Manfaat Penyusunan Proposal

Penyusunan proposal bisnis ini memberikan serangkaian manfaat nyata bagi berbagai pemangku kepentingan:

* **Bagi Konsumen / Pengguna:**  
  Mendapatkan instrumen pencatatan keuangan harian yang menenangkan, cepat, dan aman. Pengguna dapat menghentikan kebocoran anggaran mikroskopis (*latte factor*), memantau tagihan berulang, dan merealisasikan target tabungan jangka menengah secara terukur.
* **Bagi Pelaku Usaha Mikro (UMKM):**  
  Membantu wirausahawan kecil memisahkan antara uang pribadi dan modal perputaran usaha secara praktis, tanpa harus membeli perangkat lunak akuntansi perusahaan yang mahal dan rumit.
* **Bagi Tim Pengembang & Akademisi:**  
  Menerapkan prinsip rekayasa perangkat lunak hemat sumber daya (*lean software engineering*) dan metodologi bisnis rintisan modern yang memadukan teori manajemen strategis dengan praktik nyata di industri teknologi informasi.
* **Bagi Ekosistem Keuangan Nasional:**  
  Turut menyukseskan Strategi Nasional Literasi Keuangan Indonesia (SNLKI) yang dicanangkan Otoritas Jasa Keuangan, dengan meningkatkan persentase masyarakat yang memiliki kendali dan pemahaman riil atas kondisi kesehatan finansial masing-masing.

<div style="page-break-after: always;"></div>

---

## BAB II: PERENCANAAN BISNIS & STRATEGIS

### 2.1 Nilai Tambah & Solusi Produk (*Value Proposition*)

Cukupin™ hadir bukan sekadar sebagai buku kas digital biasa, melainkan sebagai asisten kendali arus kas pribadi yang dirancang untuk mengatasi rasa lelah dan kejenuhan mental pengguna terhadap aplikasi modern yang penuh kebisingan visual (*app fatigue*). Filosofi dasar Cukupin™ bertumpu pada konsep **"Quiet Ledger"**—sebuah wadah pencatatan yang menghormati waktu, perhatian, dan privasi pengguna.

Tujuh pilar nilai tambah (*Core Value Proposition*) Cukupin™ meliputi:

1. **Pencatatan Secepat Kilat (*Sub-5-Second Entry*):**  
   Pengguna dapat membuka aplikasi dan menyelesaikan satu catatan transaksi (pengeluaran atau pemasukan) dalam waktu kurang dari 5 detik. Desain antarmuka mengutamakan tombol cepat angka besar (*numpad*) dan kategori yang dapat dipilih dalam satu kali ketukan, menghilangkan formulir bertingkat yang melelahkan.
2. **Bebas Iklan Seutuhnya (*100% Zero-Ad Environment*):**  
   Cukupin™ berkomitmen untuk tidak memasang iklan spanduk (*banner*), iklan video layar penuh (*interstitial ads*), ataupun iklan terselubung berupa tawaran pinjaman online. Pengalaman mencatat keuangan menjadi sangat bersih dan berwibawa.
3. **Arsitektur Luring Terdepan (*Offline-First PWA*):**  
   Cukupin™ dibangun menggunakan teknologi *Progressive Web App* modern. Aplikasi dapat diakses langsung dari peramban dan diinstal ke layar beranda ponsel tanpa perlu mengunduh berkas berukuran puluhan megabita dari toko aplikasi. Seluruh pencatatan tersimpan secara instan di memori lokal gawai dan akan otomatis tersinkronisasi saat terhubung ke jaringan internet.
4. **Manajemen Multi-Rekening & Dompet Digital:**  
   Pengguna dapat memantau saldo di berbagai kantong dana secara simultan: uang tunai (*cash*), rekening bank utama, rekening tabungan khusus, hingga dompet digital seperti GoPay, OVO, dan DANA. Pengguna juga dapat mencatat transfer antar-rekening tanpa memengaruhi laporan pengeluaran riil.
5. **Anggaran Dinamis & Peringatan Ambang Batas (*Smart Budgeting*):**  
   Pengguna dapat menetapkan batas anggaran belanja untuk setiap kategori (misalnya: Makanan, Transportasi, Hiburan). Cukupin™ memberikan indikator visual warna bertingkat (hijau, kuning, merah) yang memberi tahu pengguna jika pengeluaran sudah mendekati batas sebelum terjadi *overbudget*.
6. **Pelacak Target Tabungan & Dana Impian (*Goal Tracker*):**  
   Fitur ini memungkinkan pengguna membuat target tabungan tertentu (misalnya: Dana Darurat, Liburan, Beli Laptop, atau Modal Usaha) lengkap dengan persentase capaian dan estimasi waktu target terkumpul.
7. **Pengingat Tagihan Berulang (*Recurring Bills*) & Ekspor Instan:**  
   Pengguna tidak akan lagi terlambat membayar tagihan listrik, sewa kos, langganan internet, atau asuransi. Selain itu, seluruh rekapitulasi data keuangan dapat diekspor menjadi dokumen PDF berformat profesional atau berkas CSV/Excel dalam satu klik untuk kebutuhan analisis lanjutan atau pelaporan SPT pajak tahunan.

<div style="page-break-after: always;"></div>

---

### 2.2 Analisis SWOT (Kekuatan, Kelemahan, Peluang, Ancaman)

Untuk menyusun strategi bisnis yang komprehensif dan objektif, Cukupin™ dianalisis menggunakan kerangka kerja SWOT (*Strengths, Weaknesses, Opportunities, Threats*) yang mengevaluasi faktor internal dan eksternal perusahaan:

| Aspek Internal & Eksternal | Penjelasan Analisis Strategis Cukupin™ |
| :--- | :--- |
| **STRENGTHS (Kekuatan)** | 1. **Antarmuka Minimalis & Cepat:** Desain antarmuka modern, intuitif, dan responsif dengan waktu input <5 detik.<br>2. **Bebas Iklan Permanen (*Zero Ads*):** Kenyamanan dan fokus pengguna terlindungi tanpa gangguan iklan komersial.<br>3. **Teknologi PWA Hemat Ruang:** Tidak membebani memori ponsel (<5 MB), tidak perlu pembaruan manual di App Store/Play Store.<br>4. **Mode Luring Penuh (*Offline-First*):** Tetap dapat digunakan secara lancar tanpa kuota internet atau saat sinyal terputus.<br>5. **Kedaulatan Privasi Tinggi:** Data keuangan disimpan secara aman di perangkat lokal pengguna dengan opsi cadangan terenkripsi.<br>6. **Biaya Operasional Rendah (*Lean Infrastructure*):** Efisiensi komputasi awan yang menghasilkan margin laba kotor tinggi (>90%). |
| **WEAKNESSES (Kelemahan)** | 1. **Kesadaran Merek Awal (*Brand Awareness*):** Sebagai entitas baru, Cukupin™ belum memiliki nama besar dibanding pemain lama di industri fintech.<br>2. **Pencatatan Masih Berbasis Mandiri (*Manual Entry*):** Belum menyediakan integrasi otomatis dengan *open banking* perbankan di versi rintisan awal.<br>3. **Keterbatasan Anggaran Promosi Awal:** Modal pemasaran yang relatif kecil dibanding korporasi aplikasi keuangan bermodal ventura besar.<br>4. **Edukasi PWA di Konsumen Awam:** Sebagian pengguna di Indonesia masih terbiasa mencari aplikasi hanya melalui Google Play Store. |
| **OPPORTUNITIES (Peluang)** | 1. **Tren Gaya Hidup Sadar Finansial (*Mindful Spending* & *Frugal Living*):** Meningkatnya minat generasi muda untuk hidup hemat dan menghindari utang konsumtif.<br>2. **Kejenuhan Konsumen Terhadap Iklan (*Ad-Fatigue*):** Banyaknya ulasan negatif pengguna di Play Store terhadap aplikasi gratisan yang dipenuhi iklan pop-up.<br>3. **Ledakan Pengguna Transaksi Digital & QRIS:** Jutaan transaksi non-tunai harian membutuhkan alat kontrol arus kas yang mudah dan cepat.<br>4. **Pasar UMKM Mikro yang Masif:** Sekitar 65 juta pelaku usaha mikro di Indonesia membutuhkan pencatat kas sederhana tanpa pembukuan rumit.<br>5. **Dukungan Regulasi Literasi Keuangan:** Dorongan OJK dan Bank Indonesia dalam meningkatkan indeks literasi keuangan masyarakat. |
| **THREATS (Ancaman)** | 1. **Rendahnya Konsistensi Pengguna:** Risiko pengguna berhenti mencatat setelah beberapa hari karena faktor kebiasaan malas (*habit drop-off*).<br>2. **Fitur Pelacak Bawaan dari Bank Digital:** Beberapa bank digital mulai menyertakan fitur ringkasan pengeluaran internal di dalam aplikasi perbankan mereka.<br>3. **Aplikasi Sejenis Berskala Global:** Adanya aplikasi internasional yang sudah memiliki basis pengguna mapan (seperti Money Lover atau Spendee).<br>4. **Sensitivitas Pengguna terhadap Biaya Langganan:** Sebagian masyarakat masih enggan membayar aplikasi digital jika belum merasakan manfaat nyata. |

<div style="page-break-after: always;"></div>

---

### 2.3 Matriks TOWS (Formulasi Strategi Terpadu)

Berdasarkan pemetaan faktor internal dan eksternal di atas, disusun **Matriks TOWS** mengikuti kaidah standar *Oxford College of Marketing*. Model ini memetakan interaksi langsung antara Faktor Internal (*Internal Factors*) pada sumbu horizontal dan Faktor Eksternal (*External Factors*) pada sumbu vertikal guna menghasilkan strategi tindakan yang fokus, jelas, dan dapat dieksekusi:

<!-- TOWS MATRIX (OXFORD COLLEGE OF MARKETING FORMAT) -->
<div class="tows-wrapper">
  <div class="tows-layout">
    <!-- Top Bar: Internal Factors Banner -->
    <div class="header-internal">Internal Factors</div>

    <!-- Left Bar: External Factors Banner -->
    <div class="banner-external">External Factors</div>

    <!-- Top Left Corner Cell -->
    <div class="cell-corner">
      <div class="corner-title">CUKUPIN™</div>
      <div class="corner-sub">Analisis Matriks TOWS</div>
    </div>

    <!-- Row 1: Strengths & Weaknesses -->
    <div class="tows-block cell-strengths">
      <div class="tows-block-header">Strengths (S)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>S1:</strong> Input instan super cepat (&lt;5 detik).</li>
          <li><strong>S2:</strong> 100% Bebas iklan (Quiet Ledger).</li>
          <li><strong>S3:</strong> Ringan (&lt;5 MB PWA) hemat RAM gawai.</li>
          <li><strong>S4:</strong> Mode luring penuh (Offline-First).</li>
          <li><strong>S5:</strong> Privasi data terenkripsi lokal pengguna.</li>
        </ul>
      </div>
    </div>

    <div class="tows-block cell-weaknesses">
      <div class="tows-block-header">Weaknesses (W)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>W1:</strong> Brand awareness masih fase rintisan awal.</li>
          <li><strong>W2:</strong> Pencatatan mandiri (belum open-banking).</li>
          <li><strong>W3:</strong> Anggaran promosi berbayar terbatas.</li>
          <li><strong>W4:</strong> Sebagian pengguna awam belum paham PWA.</li>
        </ul>
      </div>
    </div>

    <!-- Row 2: Opportunities & SO & WO -->
    <div class="tows-block cell-opportunities">
      <div class="tows-block-header">Opportunities (O)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>O1:</strong> Booming gaya hidup <em>frugal living</em> Gen Z.</li>
          <li><strong>O2:</strong> Kejenuhan atas aplikasi sarat iklan pop-up.</li>
          <li><strong>O3:</strong> Ledakan jutaan transaksi QRIS harian.</li>
          <li><strong>O4:</strong> 65 Juta pelaku UMKM butuh buku kas simpel.</li>
        </ul>
      </div>
    </div>

    <div class="tows-block cell-so">
      <div class="tows-block-header">Strengths / Opportunities (SO)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>Kampanye "Catat Tenang Bebas Iklan":</strong> Tarik konsumen muda yang jenuh iklan dengan kecepatan &lt;5 detik (S1, S2 + O1, O2).</li>
          <li><strong>Penetrasi Kas UMKM Mikro QRIS:</strong> Posisikan Cukupin™ sebagai buku kas harian pedagang yang stabil tanpa internet (S4 + O3, O4).</li>
        </ul>
      </div>
    </div>

    <div class="tows-block cell-wo">
      <div class="tows-block-header">Weaknesses / Opportunities (WO)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>Konten Edukasi Finansial Organik:</strong> Produksi konten TikTok/Reels tentang kebocoran uang jajan tanpa bayar iklan (W1, W3 + O1, O2).</li>
          <li><strong>Tutorial Pasang PWA 5 Detik:</strong> Buat panduan singkat pasang web PWA langsung dari peramban tanpa toko aplikasi (W4 + O3).</li>
        </ul>
      </div>
    </div>

    <!-- Row 3: Threats & ST & WT -->
    <div class="tows-block cell-threats">
      <div class="tows-block-header">Threats (T)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>T1:</strong> Kebiasaan malas mencatat (habit drop-off).</li>
          <li><strong>T2:</strong> Fitur bawaan pelacak di aplikasi bank digital.</li>
          <li><strong>T3:</strong> Aplikasi tracker global berbayar mahal.</li>
          <li><strong>T4:</strong> Resistensi bayar langganan software.</li>
        </ul>
      </div>
    </div>

    <div class="tows-block cell-st">
      <div class="tows-block-header">Strengths / Threats (ST)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>Input Kilat Tangkal Malas Catat:</strong> Numpad instan memangkas keengganan mencatat di kasir (S1 + T1).</li>
          <li><strong>Pusat Rekening Netral:</strong> Menyatukan kas, semua bank, dan e-wallet dalam satu wadah aman (S5 + T2).</li>
          <li><strong>Harga Domestik Murah:</strong> Rp 89.000/thn jauh lebih hemat dari app global berkat lean cloud (S3 + T3, T4).</li>
        </ul>
      </div>
    </div>

    <div class="tows-block cell-wt">
      <div class="tows-block-header">Weaknesses / Threats (WT)</div>
      <div class="tows-block-body">
        <ul>
          <li><strong>Free-Tier Berkualitas Permanen:</strong> Sediakan fitur inti gratis selamanya untuk cegah churn pengguna (W1 + T4).</li>
          <li><strong>Pengingat Ramah (Smart Nudges):</strong> Notifikasi malam yang bersahabat demi menjaga konsistensi catat (W1 + T1).</li>
        </ul>
      </div>
    </div>

  </div>
</div>

<div style="page-break-after: always;"></div>

---

### 2.4 Aspek Pasar & Pemasaran

Keberhasilan komersialisasi Cukupin™ bertumpu pada ketajaman segmentasi pasar, penentuan target yang tepat (*Targeting*), penempatan posisi merek yang unik (*Positioning*), serta eksekusi bauran pemasaran (*Marketing Mix 4P*) yang terarah.

#### 1. Segmentasi Pasar (Market Segmentation)
* **Segmentasi Geografis:**  
  Fokus tahap awal ditujukan pada masyarakat perkotaan dan sub-perkotaan di wilayah aglomerasi metropolitan Indonesia (Jabodetabek, Surabaya Raya, Bandung Raya, Semarang, Medan, Makassar, dan Yogyakarta). Wilayah-wilayah ini memiliki tingkat penetrasi pembayaran digital QRIS dan transaksi *cashless* tertinggi di Indonesia. Pada fase berikutnya, ekspansi menyasar seluruh kota tingkat II di pulau Jawa dan luar Jawa.
* **Segmentasi Demografis:**  
  * Usia: 18 hingga 35 tahun (didominasi Generasi Z dan Milenial).
  * Status: Mahasiswa tingkat akhir, lulusan baru (*fresh graduates*), pekerja kantoran awal karier (*first-jobbers*), pekerja lepas (*freelancers* / pekerja kreatif), serta pelaku wirausaha mikro / pemilik toko daring (*online shop* rumahan).
  * Tingkat Pendapatan: Rp 2.500.000 hingga Rp 15.000.000 per bulan.
* **Segmentasi Psikografis:**  
  * Individu yang memiliki aspirasi untuk mencapai stabilitas finansial, mendambakan hidup teratur (*mindful living*), dan resah melihat gaji bulanan cepat habis tanpa jejak.
  * Konsumen yang menghargai kesederhanaan, privasi digital, serta estetika visual modern, dan merasa risih terhadap aplikasi yang dipenuhi iklan komersial murahan.
* **Segmentasi Perilaku (Behavioral):**  
  * Pengguna aktif gawai pintar (*smartphone centric*) yang melakukan transaksi pembayaran non-tunai sedikitnya 2–5 kali dalam sehari.
  * Pernah mencoba mencatat keuangan di buku fisik atau aplikasi lain, namun berhenti di tengah jalan karena merasa prosesnya terlalu rumit dan memakan waktu.

#### 2. Sasaran Pasar (Targeting)
* **Segmen Utama (Primary Target):**  
  *First-Jobbers* dan Pekerja Muda (usia 21–29 tahun) yang baru memiliki penghasilan mandiri, mulai menghadapi berbagai pos pengeluaran hidup nyata (sewa hunian, tagihan bulanan, gaya hidup sosial), dan membutuhkan alat kendali anggaran agar tidak terjerat gaya hidup konsumtif atau utang cicilan *paylater*.
* **Segmen Sekunder (Secondary Target):**  
  Pekerja Lepas (*Freelancer*) dan Pengusaha Mikro yang memiliki arus kas tidak tetap, di mana mereka sangat membutuhkan pencatatan praktis untuk memisahkan keuangan rumah tangga dengan modal usaha tanpa harus mengoperasikan perangkat lunak akuntansi perusahaan yang mahal.

#### 3. Penempatan Posisi Produk (Positioning)
Cukupin™ memposisikan dirinya di benak konsumen sebagai:  
> **"Buku Kas Pribadi Paling Cepat, Hening, dan Cukup untuk Kebutuhan Anda — Tanpa Iklan, Tanpa Ribet, Cukup Sekali Catat, Finansial Terkendali."**

Cukupin™ tidak ingin menjadi aplikasi perbankan yang rumit, melainkan menjadi sahabat setia pencatat keuangan harian yang memberikan ketenangan pikiran (*peace of mind*) bagi penggunanya.

#### 4. Bauran Pemasaran (Marketing Mix 4P)

##### a. Produk (Product)
* Aplikasi Cukupin™ menghadirkan antarmuka berbasis web dan aplikasi terpasang PWA (*Progressive Web App*) yang dapat berjalan mulus di perangkat Android, iOS, maupun komputer jinjing (laptop/PC).
* Dilengkapi dengan fitur unggulan: pencatatan transaksi <5 detik, multi-rekening, anggaran kategori dinamis, visualisasi grafik arus kas, pelacak target tabungan (*goals*), manajemen tagihan berkala (*recurring bills*), dan proteksi kunci keamanan PIN / biometrik gawai.
* Desain visual dirancang dengan prinsip modern *clean aesthetics*, kontras tinggi yang ramah mata (*high readability*), serta palet warna yang menenangkan psikologis pengguna.

##### b. Harga (Price)
Cukupin™ menerapkan kebijakan harga yang sangat ramah di kantong masyarakat Indonesia dengan skema *Freemium*:
* **Paket Free (Gratis Selamanya):**  
  Biaya Rp 0. Akses penuh pencatatan transaksi tanpa batas, mode luring (*offline*), 2 akun rekening, 5 kategori dinamis, dan ringkasan anggaran bulanan standar.
* **Paket Cukupin™ Pro (Tahunan):**  
  **Rp 89.000 / tahun** (ekuivalen hanya Rp 7.416 per bulan). Pengguna mendapatkan akun rekening tak terbatas, target tabungan tak terbatas, ekspor laporan keuangan profesional berformat CSV dan PDF tanpa batasan, kustomisasi kategori mendalam, serta sinkronisasi awan terenkripsi.
* **Paket Cukupin™ Pro (Bulanan):**  
  **Rp 12.000 / bulan** bagi pengguna yang ingin mencoba fitur Pro dengan komitmen jangka pendek yang sangat terjangkau.
* **Paket Pay-per-Export (Opsional):**  
  **Rp 5.000 per unduhan** bagi pengguna paket gratis yang sewaktu-waktu hanya membutuhkan satu berkas ekspor laporan PDF/Excel resmi untuk keperluan pelaporan pajak atau pengajuan kredit.

##### c. Saluran Distribusi (Place)
* Cukupin™ didistribusikan secara instan melalui situs resmi (`cukupin.id` / `cukupin.app`). Pengguna tidak perlu membuka toko aplikasi resmi yang menghabiskan memori gawai; cukup membuka tautan web, lalu menekan tombol *"Tambahkan ke Layar Utama / Install App"*, dan Cukupin™ langsung terpasang seperti aplikasi bawaan ponsel dalam hitungan detik.
* Pemanfaatan jaringan distribusi lokal ini memangkas friksi instalasi (*zero install barrier*) serta menghemat kuota internet pengguna hingga 95% dibanding mengunduh aplikasi biasa.

##### d. Promosi (Promotion)
* **Pemasaran Konten Edukatif (Content Marketing):**  
  Membuat serial konten pendek di TikTok, Instagram Reels, dan YouTube Shorts yang mengangkat topik riil kebocoran finansial anak muda (misalnya: *"Berapa pengeluaran kopi susumu setahun?"*, *"Cara memisahkan uang jajan dan uang modal olshop"*). Konten diakhiri dengan ajakan solusi praktis menggunakan Cukupin™.
* **Kampanye "Merdeka dari Iklan":**  
  Menonjolkan perbandingan visual langsung antara menggunakan aplikasi pencatat biasa yang penuh iklan pop-up berisik versus ketenangan dan kecepatan mencatat di Cukupin™.
* **Program Afiliasi & Referral Mahasiswa:**  
  Setiap pengguna yang berhasil mereferensikan 3 teman untuk mencoba Cukupin™ akan mendapatkan masa percobaan Cukupin™ Pro selama 1 bulan gratis.
* **Komunitas Sadar Finansial (*Community Advocacy*):**  
  Membangun kanal komunitas di Telegram dan Discord untuk saling berbagi tip hidup hemat (*frugal living*), perencanaan anggaran, dan pelaporan kesehatan finansial secara berkala.

<div style="page-break-after: always;"></div>

---

### 2.5 Aspek Operasional & Alur Penggunaan (*Product & Customer Journey*)

Pengembangan dan operasional Cukupin™ dirancang mengikuti standar rekayasa perangkat lunak modern yang mengutamakan keandalan, efisiensi sumber daya, dan kemudahan bagi pengguna akhir.

#### Alur Pengalaman Pengguna (Customer Journey Process Flow)

<!-- CUSTOMER JOURNEY HTML PROCESS FLOW -->
<div class="journey-container">
  <div class="journey-card">
    <div class="journey-step-num">01</div>
    <div class="journey-content">
      <div class="journey-title">Penemuan & Onboarding Cepat (&lt;1 Menit)</div>
      <div class="journey-desc">Pengguna membuka tautan web Cukupin™ dari media sosial atau peramban. Tanpa perlu unduhan puluhan MB, aplikasi langsung dapat diinstal ke layar utama ponsel (PWA) dengan satu ketukan.</div>
    </div>
  </div>

  <div class="journey-card">
    <div class="journey-step-num">02</div>
    <div class="journey-content">
      <div class="journey-title">Inisialisasi Kantong Dana & Anggaran</div>
      <div class="journey-desc">Memasukkan saldo awal akun kas dompet tunai, rekening bank utama, dan dompet digital (GoPay/OVO). Menetapkan ambang batas anggaran bulanan per pos kebutuhan penting.</div>
    </div>
  </div>

  <div class="journey-card">
    <div class="journey-step-num">03</div>
    <div class="journey-content">
      <div class="journey-title">Pencatatan Harian Secepat Kilat (&lt;5 Detik)</div>
      <div class="journey-desc">Setiap selesai bertransaksi di kasir atau memindai QRIS, pengguna membuka Cukupin™, mengetik nominal di tombol angka besar, memilih kategori (misal: Makan Siang), lalu selesai. Berfungsi 100% luring.</div>
    </div>
  </div>

  <div class="journey-card">
    <div class="journey-step-num">04</div>
    <div class="journey-content">
      <div class="journey-title">Pemantauan Anggaran & Peringatan Proaktif</div>
      <div class="journey-desc">Melihat grafik real-time dan indikator warna batas belanja kategori. Pengguna menerima peringatan visual halus jika pos pengeluaran mendekati 80% sebelum terjadi <em>overbudget</em>.</div>
    </div>
  </div>

  <div class="journey-card">
    <div class="journey-step-num">05</div>
    <div class="journey-content">
      <div class="journey-title">Alokasi Tabungan & Ekspor Laporan Bulanan</div>
      <div class="journey-desc">Menyalurkan sisa surplus kas bulanan ke fitur Target Tabungan (Goals). Mengunduh ringkasan pembukuan resmi berformat PDF atau spreadsheet CSV dalam 1-klik untuk pelaporan atau evaluasi bisnis.</div>
    </div>
  </div>
</div>

#### Standar Operasional Pemeliharaan & Kualitas Layanan
1. **Kecepatan Respons Antarmuka:** Waktu rendering halaman Cukupin™ dijaga secara ketat di bawah 1 detik (*sub-second load time*) berkat penyimpanan berkas statis lokal di peramban pengguna.
2. **Ketersediaan Layanan (*Uptime Reliability*):** Infrastruktur sinkronisasi peladen awan ditargetkan mencapai ketersediaan minimal 99,9% per tahun, memastikan data pengguna dapat disinkronkan kapan pun tanpa kendala.
3. **Penyimpanan Data Lokal (*Data Sovereignity*):** Semua transaksi dienkripsi di penyimpanan lokal peramban (*IndexedDB*). Jika pengguna memilih untuk tidak melakukan sinkronisasi awan, data 100% tetap berada di ponsel pengguna, memberikan jaminan keamanan mutlak dari kebocoran data eksternal.

<div style="page-break-after: always;"></div>

---

### 2.6 Analisis Kompetitor & Keunggulan Bersaing (*Competitive Moat*)

Pasar aplikasi pengelola keuangan di Indonesia dihuni oleh berbagai alternatif solusi, mulai dari cara konvensional hingga aplikasi buatan pengembang mancanegara. Untuk membuktikan posisi keunggulan Cukupin™, dilakukan analisis perbandingan langsung berdasarkan lima parameter kunci:

| Parameter Evaluasi | Buku Kas Fisik / Kertas | Dompet Digital (GoPay / OVO bawaan) | Aplikasi Finansial Global Beriklan | **CUKUPIN™** |
| :--- | :--- | :--- | :--- | :--- |
| **Kecepatan Input Transaksi** | Lambat (>30 detik, butuh alat tulis). | Otomatis tapi hanya melacak transaksi di dalam dompet tersebut. | Lambat (15–25 detik karena tertahan iklan & loading). | **Sangat Cepat (<5 detik, numpad terdedikasi).** |
| **Beban Iklan & Distraksi** | Bebas iklan. | Banyak promo & banner komersial yang mendorong konsumsi. | Penuh iklan pop-up, video berulang, & banner. | **100% Bebas Iklan Permanen (Zero-Ads).** |
| **Cakupan Akun Keuangan** | Tergantung ketelitian tulis tangan manual. | Terisolasi (hanya mencatat saldo e-wallet miliknya sendiri). | Mendukung multi-akun namun dibatasi pada versi gratis. | **Menyatukan Kas, Semua Bank, & E-Wallet dalam 1 wadah netral.** |
| **Kemandirian Jaringan (Offline)** | 100% luring (kertas). | Wajib ada jaringan internet & server aktif. | Sebagian besar macet atau error jika offline. | **Offline-First PWA (100% lancar walau tanpa sinyal internet).** |
| **Ukuran Aplikasi di Memori** | Fisik (buku tulis). | Sangat besar (100 MB – 250 MB). | Besar (40 MB – 80 MB, memori cache terus membengkak). | **Sangat Ringan (<5 MB, tidak membebani memori ponsel).** |
| **Keamanan & Privasi Data** | Rawan hilang atau dibaca orang lain. | Terikat pada regulasi platform ekosistem besar. | Mengharuskan pendaftaran email, izin SMS & kontak gawai. | **Kedaulatan Data Lokal (Enkripsi aman, tanpa izin aneh).** |
| **Biaya Berlangganan Pro** | Gratis (biaya beli buku). | Gratis (namun mendorong konsumsi belanja). | Mahal (Rp 350.000 – Rp 600.000 / tahun). | **Sangat Terjangkau (Hanya Rp 89.000 / tahun).** |

#### Tembok Pertahanan Keunggulan Bersaing (Competitive Moat) Cukupin™
1. **Zero-Ad Sacred Space:** Sementara kompetitor mengorbankan kenyamanan pengguna demi uang receh iklan banner pihak ketiga, Cukupin™ mempertahankan ruang pencatatan yang tenang dan elegan. Komitmen ini membangun loyalitas serta kepercayaan pengguna secara mendalam (*high consumer brand love*).
2. **Extreme Speed Advantage:** Fitur input <5 detik memecahkan masalah nomor satu kegagalan pencatatan keuangan di dunia, yaitu kebiasaan menunda mencatat akibat antarmuka yang lambat.
3. **Platform Independence (PWA Edge):** Cukupin™ tidak terikat pada kebijakan komisi 30% dari Google Play Store atau Apple App Store karena beroperasi sebagai aplikasi web progresif independen. Hal ini memungkinkan Cukupin™ menawarkan harga langganan Pro yang jauh lebih murah kepada masyarakat Indonesia.

<div style="page-break-after: always;"></div>

---

### 2.7 Analisis Organisasi & Sumber Daya Manusia

Untuk memastikan jalannya operasional bisnis dan pengembangan produk secara profesional dan terukur, Cukupin™ dikelola oleh struktur organisasi fungsional yang ramping namun efektif (*lean team structure*):

<!-- ORG STRUCTURE HTML CARDS -->
<div class="org-container">
  <div class="org-leader-card">
    <div class="org-badge ceo-badge">CHIEF EXECUTIVE OFFICER (CEO) & PRODUCT LEAD</div>
    <div class="org-name">Rafli Alif Ihza Hartono</div>
    <div class="org-dept">Teknik Telekomunikasi — Institut Teknologi Sepuluh Nopember (ITS)</div>
    <div class="org-desc">Bertanggung jawab atas penetapan visi strategis jangka panjang, riset kebutuhan pasar (product-market fit), perancangan antarmuka & pengalaman pengguna (UI/UX), serta kepemimpinan eksekutif dan kemitraan strategis.</div>
  </div>

  <div class="org-grid">
    <div class="org-sub-card">
      <div class="org-badge cto-badge">CHIEF TECHNOLOGY OFFICER (CTO)</div>
      <div class="org-title">Lead Software & Security Engineer</div>
      <div class="org-desc">Mengawasi rekayasa perangkat lunak PWA, keandalan sinkronisasi offline-first, arsitektur database, enkripsi keamanan lokal pengguna, serta benchmarking performa beban sistem.</div>
    </div>
    <div class="org-sub-card">
      <div class="org-badge cmo-badge">CHIEF MARKETING OFFICER (CMO)</div>
      <div class="org-title">Growth & Community Lead</div>
      <div class="org-desc">Memimpin strategi pemasaran konten edukasi finansial di media sosial (TikTok, Instagram), manajemen komunitas sadar hemat (frugal living), kemitraan kampus, dan program rujukan pengguna.</div>
    </div>
    <div class="org-sub-card">
      <div class="org-badge cfo-badge">CHIEF FINANCIAL OFFICER (CFO)</div>
      <div class="org-title">Finance & Legal Operations</div>
      <div class="org-desc">Mengelola perputaran arus kas operasional, integrasi sistem pembayaran digital (payment gateway QRIS/VA), kepatuhan legalitas hukum usaha, dan perlindungan HAKI merek dagang Cukupin™.</div>
    </div>
  </div>
</div>

<div style="page-break-after: always;"></div>

---

## BAB III: PERENCANAAN KEUANGAN & KELAYAKAN USAHA

Perencanaan keuangan Cukupin™ disusun berdasarkan prinsip transparansi, kehati-hatian (*prudence*), dan efisiensi modal (*lean capital deployment*). Perhitungan berikut merinci kebutuhan investasi awal, biaya operasional, penetapan harga, margin kontribusi, analisis titik impas (*Break-Even Point*), serta proyeksi laba rugi dan masa pengembalian modal.

---

### 3.1 Modal Awal Usaha (CapEx / Capital Expenditure)

Modal awal dibutuhkan untuk mempersiapkan sarana prasarana pengembangan sistem, perizinan legalitas, infrastruktur dasar, serta riset pasar awal sebelum peluncuran komersial:

| No | Komponen Kebutuhan Investasi Awal | Alokasi Dana (Rp) | Keterangan & Rincian |
| :---: | :--- | :---: | :--- |
| 1 | Pengadaan Perangkat Keras Pengujian (Gawai Uji Multi-Platform) | Rp 16.000.000 | 2 unit perangkat uji (Android & iOS) untuk validasi performa PWA. |
| 2 | Biaya Legalitas Perusahaan, Pendaftaran Usaha, & Notaris | Rp 6.500.000 | Pengurusan akta badan usaha, NPWP, dan izin operasional dasar. |
| 3 | Pendaftaran Hak Kekayaan Intelektual (HAKI Merek Dagang & Cipta) | Rp 4.500.000 | Pendaftaran kelas merek dagang "Cukupin™" di Kemenkumham RI. |
| 4 | Pengadaan Domain Premium `.id`, Lisensi Pengembang, & SSL | Rp 3.000.000 | Kepemilikan domain `cukupin.id` multi-tahun dan sertifikasi keamanan. |
| 5 | Cadangan Kas Pengembangan Awal & Riset Pengguna (*User Testing*) | Rp 10.000.000 | Insentif responden survei, biaya prototipe awal, dan dana darurat. |
| **TOTAL** | **MODAL AWAL INVESTASI (CapEx)** | **Rp 40.000.000** | *Modal ekuitas mandiri pendiri dan pendanaan awal rintisan.* |

---

### 3.2 Biaya Tetap Operasional (Fixed OpEx)

Biaya tetap merupakan pengeluaran rutin bulanan dan tahunan yang wajib dikeluarkan terlepas dari besarnya jumlah transaksi pengguna:

| No | Komponen Biaya Tetap | Biaya per Bulan (Rp) | Biaya per Tahun (Rp) | Keterangan |
| :---: | :--- | :---: | :---: | :--- |
| 1 | Peladen Awal & Basis Data Terkelola (Cloud Server) | Rp 1.200.000 | Rp 14.400.000 | Klaster database Supabase & server edge PWA. |
| 2 | Pemeliharaan Domain, Lisensi Software, & Keamanan | Rp 500.000 | Rp 6.000.000 | Monitoring sistem, firewall, & backup terjadwal. |
| 3 | Tunjangan Dasar Operasional Tim Inti (4 Personil) | Rp 3.000.000 | Rp 36.000.000 | Alokasi pulsa, internet, dan operasional awal tim. |
| 4 | Anggaran Pemasaran Konten & Komunitas Organik | Rp 1.500.000 | Rp 18.000.000 | Produksi konten edukasi & operasional komunitas. |
| **TOTAL** | **BIAYA TETAP OPERASIONAL (Fixed Cost)** | **Rp 6.200.000** | **Rp 74.400.000** | *Dasar perhitungan titik impas operasional tahunan.* |

---

### 3.3 Biaya Variabel (Variable Cost)

Biaya variabel adalah beban biaya yang timbul dan bertambah secara proporsional sesuai dengan peningkatan jumlah pengguna berbayar (*Cukupin™ Pro*):

| No | Komponen Biaya Variabel | Biaya per Pengguna Pro / Thn (Rp) | Keterangan |
| :---: | :--- | :---: | :--- |
| 1 | Biaya Gerbang Pembayaran (*Payment Gateway Fee* per transaksi) | Rp 2.900 | Rata-rata biaya transaksi perpanjangan langganan via VA / QRIS. |
| 2 | Kuota Komputasi Awan Tambahan & Penyimpanan Cadangan | Rp 1.000 | Kapasitas cadangan berkas terenkripsi per pengguna aktif. |
| 3 | Alokasi Layanan Bantuan Pengguna (*Customer Support*) | Rp 500 | Biaya sistem tiket bantuan dan notifikasi email sistem. |
| **TOTAL** | **BIAYA VARIABEL PER PENGGUNA (v)** | **Rp 4.400 / Tahun** | *Sangat rendah berkat arsitektur lokal yang hemat data.* |

---

### 3.4 Model Monetisasi & Penetapan Harga (*Pricing Strategy*)

Cukupin™ menetapkan harga langganan yang sangat kompetitif dan disesuaikan dengan daya beli masyarakat Indonesia:

* **Tarif Langganan Cukupin™ Pro (Tahunan): Rp 89.000 / tahun**  
  Memberikan akses penuh tanpa batas ke semua fitur premium, ekuivalen hanya Rp 7.416 per bulan (kurang dari harga satu gelas es teh manis per bulan).
* **Tarif Langganan Cukupin™ Pro (Bulanan): Rp 12.000 / bulan**  
  Pilihan fleksibel bagi pengguna yang ingin membayar secara berkala.
* **Fitur Tambahan Pay-per-Export: Rp 5.000 / unduhan**  
  Khusus pengguna paket gratis yang membutuhkan laporan keuangan formal sesekali.

---

### 3.5 Penentuan HPP & Margin Kontribusi

Dalam bisnis produk digital berbasis perangkat lunak (*Software as a Service* / SaaS), Harga Pokok Penjualan (HPP) variabel dihitung dari biaya langsung yang melekat pada setiap penyediaan akun berbayar.

<!-- MATH FORMULA CARD 1 -->
<div class="math-box">
  <div class="math-box-title">FORMULA MARGIN KONTRIBUSI PER PENGGUNA PRO</div>
  <div class="math-row">
    <span class="math-label">Harga Jual Langganan Tahunan (P) :</span>
    <span class="math-val">Rp 89.000</span>
  </div>
  <div class="math-row">
    <span class="math-label">Biaya Variabel per Pengguna (v) :</span>
    <span class="math-val">Rp 4.400</span>
  </div>
  <div class="math-calc-line">
    <strong>Margin Kontribusi</strong> = P &minus; v = Rp 89.000 &minus; Rp 4.400 = 
    <span class="math-highlight">Rp 84.600</span>
  </div>
  <div class="math-calc-line" style="margin-top: 8px;">
    <strong>Rasio Margin Kontribusi</strong> = 
    <span class="math-fraction">
      <span class="math-num">Rp 84.600</span>
      <span class="math-den">Rp 89.000</span>
    </span>
    &times; 100% = 
    <span class="math-highlight-green">95,05%</span>
  </div>
</div>

Tingginya rasio margin kontribusi (95,05%) membuktikan bahwa model bisnis Cukupin™ sangat sehat, efisien, dan memiliki skalabilitas tinggi (*highly scalable*) karena penambahan pengguna baru hanya membutuhkan biaya marjinal yang sangat minim.

---

### 3.6 Proyeksi Arus Kas & Laba Rugi 2 Tahun

Berikut merupakan simulasi proyeksi keuangan tahun pertama dan tahun kedua berdasarkan skenario pertumbuhan adopsi pengguna berbayar secara konservatif dan moderat:

| Pos Keuangan / Kinerja Operasional | Tahun ke-1 (Target 1.500 User Pro) | Tahun ke-2 (Target 4.500 User Pro) |
| :--- | :---: | :---: |
| **Pendapatan Langganan Tahunan Cukupin™ Pro** | Rp 133.500.000 | Rp 400.500.000 |
| **Pendapatan Fitur Pay-per-Export & Lainnya** | Rp 7.500.000 | Rp 22.500.000 |
| **TOTAL PENDAPATAN USAHA (Gross Revenue)** | **Rp 141.000.000** | **Rp 423.000.000** |
| Biaya Variabel Langsung (HPP SaaS) | (Rp 6.600.000) | (Rp 19.800.000) |
| **LABA KOTOR (Gross Profit)** | **Rp 134.400.000** | **Rp 403.200.000** |
| *Margin Laba Kotor (%)* | *95,32%* | *95,32%* |
| Biaya Tetap Peladen & Infrastruktur Cloud | (Rp 14.400.000) | (Rp 24.000.000) |
| Biaya Tetap Pemeliharaan & Domain | (Rp 6.000.000) | (Rp 9.000.000) |
| Biaya Operasional & Tunjangan Tim Inti | (Rp 36.000.000) | (Rp 72.000.000) |
| Biaya Pemasaran Konten & Komunitas | (Rp 18.000.000) | (Rp 36.000.000) |
| Total Biaya Tetap Operasional | (Rp 74.400.000) | (Rp 141.000.000) |
| **LABA BERSIH SEBELUM PAJAK (EBT)** | **Rp 60.000.000** | **Rp 262.200.000** |
| Pajak Penghasilan UMKM (0,5% dari Omzet) | (Rp 705.000) | (Rp 2.115.000) |
| **LABA BERSIH SETELAH PAJAK (Net Profit)** | **Rp 59.295.000** | **Rp 260.085.000** |
| *Net Profit Margin (%)* | *42,05%* | *61,48%* |

<div style="page-break-after: always;"></div>

---

### 3.7 Analisis Titik Impas (BEP / Break-Even Point)

Analisis titik impas dihitung untuk mengetahui batas minimum jumlah pelanggan berbayar dan nilai omzet yang harus diraih Cukupin™ agar seluruh biaya tetap tahunan tertutup secara sempurna:

<!-- MATH FORMULA CARD 2 -->
<div class="math-box">
  <div class="math-box-title">FORMULA ANALISIS TITIK IMPAS (BREAK-EVEN POINT)</div>
  
  <div style="margin-bottom: 8px;">
    <strong>1. Titik Impas dalam Satuan Unit (Jumlah Pelanggan Pro Tahunan):</strong>
  </div>
  <div class="math-calc-line">
    <strong>BEP (Unit)</strong> = 
    <span class="math-fraction">
      <span class="math-num">Total Biaya Tetap Tahunan (FC)</span>
      <span class="math-den">Harga Jual per Unit (P) &minus; Biaya Variabel per Unit (v)</span>
    </span>
  </div>
  <div class="math-calc-line" style="margin-top: 6px;">
    <strong>BEP (Unit)</strong> = 
    <span class="math-fraction">
      <span class="math-num">Rp 74.400.000</span>
      <span class="math-den">Rp 89.000 &minus; Rp 4.400</span>
    </span>
    = 
    <span class="math-fraction">
      <span class="math-num">Rp 74.400.000</span>
      <span class="math-den">Rp 84.600</span>
    </span>
    = 
    <span class="math-highlight-green">879,43 &approx; 880 Pengguna Pro</span>
  </div>

  <div style="margin-top: 14px; margin-bottom: 8px;">
    <strong>2. Titik Impas dalam Nilai Nominal Rupiah:</strong>
  </div>
  <div class="math-calc-line">
    <strong>BEP (Rupiah)</strong> = BEP (Unit) &times; Harga Jual per Unit = 880 &times; Rp 89.000 = 
    <span class="math-highlight">Rp 78.320.000 / Tahun</span>
  </div>
</div>

Artinya, Cukupin™ hanya membutuhkan **880 pelanggan Pro aktif per tahun** (atau rata-rata hanya 74 pelanggan baru per bulan) untuk mencapai titik impas operasional, dengan target omzet tahunan sebesar Rp 78.320.000. Angka ini sangat realistis untuk dicapai di tengah jutaan basis pengguna transaksi digital di Indonesia.

---

### 3.8 Analisis Periode Pengembalian Modal (Payback Period / PBP)

Payback Period mengukur seberapa cepat modal investasi awal (CapEx sebesar Rp 40.000.000) dapat tertutup kembali melalui akumulasi arus kas bersih operasional:

<!-- MATH FORMULA CARD 3 -->
<div class="math-box">
  <div class="math-box-title">FORMULA PERIODE PENGEMBALIAN MODAL (PAYBACK PERIOD)</div>
  <div class="math-row">
    <span class="math-label">Total Modal Investasi Awal (CapEx) :</span>
    <span class="math-val">Rp 40.000.000</span>
  </div>
  <div class="math-row">
    <span class="math-label">Arus Kas Bersih Tahun ke-1 (Net Cashflow) :</span>
    <span class="math-val">Rp 59.295.000 (Rata-rata Rp 4.941.250 / bulan)</span>
  </div>
  <div class="math-calc-line" style="margin-top: 10px;">
    <strong>PBP</strong> = 
    <span class="math-fraction">
      <span class="math-num">Total Modal Investasi Awal</span>
      <span class="math-den">Rata-rata Arus Kas Bersih Bulanan</span>
    </span>
    = 
    <span class="math-fraction">
      <span class="math-num">Rp 40.000.000</span>
      <span class="math-den">Rp 4.941.250 / bulan</span>
    </span>
    &approx; 
    <span class="math-highlight-green">8,1 Bulan Operasional Stabil</span>
  </div>
</div>

Dengan memperhitungkan kurva adopsi pengguna pada kuartal pertama yang masih dalam tahap perintisan (*ramp-up period*), modal investasi awal diproyeksikan tertutup secara penuh pada **bulan ke-14 hingga ke-16** sejak peluncuran komersial Cukupin™. Hal ini membuktikan bahwa proyek bisnis Cukupin™ memiliki tingkat kelayakan finansial yang sangat menarik bagi para pemodal dan pemangku kepentingan.

<div style="page-break-after: always;"></div>

---

## BAB IV: PENUTUP

### 4.1 Kesimpulan

Berdasarkan seluruh hasil analisis permasalahan, perumusan strategi, evaluasi pasar, dan pemodelan finansial yang telah dipaparkan dalam proposal bisnis ini, dapat diambil beberapa kesimpulan pokok sebagai berikut:

1. **Relevansi Masalah yang Kuat:**  
   Ledakan transaksi pembayaran digital melalui QRIS dan dompet digital di Indonesia telah menciptakan fenomena kebocoran anggaran mikroskopis (*phantom expenses*). Kesenjangan antara tingginya inklusi keuangan (85%) dan rendahnya literasi pencatatan keuangan (49%) membuktikan adanya kebutuhan mendesak akan alat bantu pencatatan arus kas yang mudah dan disiplin.
2. **Solusi Produk yang Tepat Sasaran:**  
   Cukupin™ hadir memecahkan akar keengganan masyarakat mencatat keuangan melalui konsep *Quiet Ledger*: pencatatan super cepat (<5 detik), 100% bebas dari gangguan iklan komersial, beroperasi lancar secara luring (*offline-first PWA*), ringan di memori gawai (<5 MB), serta menjamin kerahasiaan dan privasi data finansial pengguna seutuhnya.
3. **Peluang Pasar yang Luas:**  
   Segmen generasi muda (*first-jobbers*, mahasiswa, pekerja lepas) dan jutaan pelaku usaha mikro rumahan merupakan ceruk pasar potensial yang mendambakan aplikasi bersih tanpa distraksi. Strategi bauran pemasaran 4P yang bertumpu pada konten edukasi viral dan kemudahan pemasangan PWA 1-klik memberikan keunggulan kompetitif yang solid dibanding kompetitor konvensional.
4. **Kelayakan Finansial yang Solid:**  
   Dengan rasio margin kontribusi mencapai 95,05%, Cukupin™ hanya memerlukan 880 pengguna Pro per tahun untuk mencapai titik impas operasional (BEP Rupiah Rp 78.320.000). Modal investasi awal sebesar Rp 40.000.000 diproyeksikan kembali secara penuh (*Payback Period*) dalam waktu 14 hingga 16 bulan operasional komersial.

---

### 4.2 Saran & Rekomendasi Tindak Lanjut

Demi merealisasikan kesuksesan rencana bisnis ini secara berkelanjutan, dirumuskan saran dan rekomendasi tindak lanjut bagi tim manajemen dan pemangku kepentingan:

1. **Konsistensi terhadap Kebijakan Bebas Iklan (*Zero-Ads Commitment*):**  
   Manajemen harus senantiasa mempertahankan integritas aplikasi yang bersih dari iklan pihak ketiga, karena inilah nilai diferensiasi fundamental yang membangun kepercayaan dan cinta konsumen terhadap merek Cukupin™.
2. **Fokus pada Retensi Pengguna (*Habit Building*):**  
   Pengembangan fitur selanjutnya perlu memprioritaskan mekanisme motivasi halus (*gamification & smart nudges*), seperti ringkasan mingguan apresiatif ("Kamu berhasil berhemat 15% minggu ini!"), demi menjaga konsistensi pencatatan pengguna agar tidak terjadi *drop-off*.
3. **Eksplorasi Kerjasama Lembaga Edukasi:**  
   Disarankan untuk menjalin kolaborasi strategis dengan lingkungan akademik kampus seperti Institut Teknologi Sepuluh Nopember (ITS), komunitas mahasiswa, perencana keuangan independen (*financial planner*), dan inkubator UMKM guna memperluas literasi pencatatan keuangan sekaligus memperbesar basis pengguna rujukan secara organik.
4. **Pemantauan Arus Kas yang Disiplin:**  
   Manajemen keuangan harus terus menjaga efisiensi biaya infrastruktur peladen (*lean operational cost*) seiring bertambahnya basis pengguna, guna memastikan proyeksi laba bersih dan target pengembalian modal tetap tercapai sesuai jadwal yang telah direncanakan.

<div style="page-break-after: always;"></div>

---

## DAFTAR PUSTAKA

Seluruh literatur, rujukan data, dan publikasi yang dicantumkan dalam proposal bisnis ini telah diverifikasi validitas akademis dan bukti sumber resminya:

1. **Bank Indonesia.** (2019). *Peraturan Bank Indonesia Nomor 21/18/PBI/2019 tentang Implementasi Standar Nasional Quick Response Code untuk Pembayaran*. Lembaran Negara Republik Indonesia Tahun 2019 Nomor 234.  
   **Tautan Regulasi Resmi:** [https://www.bi.go.id/id/peraturan/sistem-pembayaran/Pages/pbi_211819.aspx](https://www.bi.go.id/id/peraturan/sistem-pembayaran/Pages/pbi_211819.aspx)
2. **Bank Indonesia.** (2024). *Statistik Sistem Pembayaran dan Infrastruktur Pasar Keuangan (SPIP) Indonesia 2024*. Jakarta: Departemen Komunikasi Bank Indonesia.  
   **Tautan Portal Resmi:** [https://www.bi.go.id/id/statistik/ekonomi-keuangan/spip/default.aspx](https://www.bi.go.id/id/statistik/ekonomi-keuangan/spip/default.aspx)
3. **Halim, Abdul.** (2015). *Manajemen Keuangan Bisnis: Konsep dan Aplikasinya*. Jakarta: Penerbit Mitra Wacana Media.  
   **ISBN:** 978-602-318-085-1.
4. **Horngren, Charles T., Datar, Srikant M., & Rajan, Madhav V.** (2015). *Cost Accounting: A Managerial Emphasis* (15th Edition). Boston: Pearson Education.  
   **ISBN:** 978-0133428704.
5. **Ikatan Akuntan Indonesia (IAI).** (2018). *Standar Akuntansi Keuangan Entitas Mikro, Kecil, dan Menengah (SAK EMKM)*. Jakarta: Dewan Standar Akuntansi Keuangan IAI.  
   **ISBN:** 978-979-9020-67-3.  
   **Tautan Standar Resmi:** [https://iaiglobal.or.id/v03/standar-akuntansi-keuangan/sak-emkm](https://iaiglobal.or.id/v03/standar-akuntansi-keuangan/sak-emkm)
6. **Kotler, Philip., & Keller, Kevin Lane.** (2016). *Marketing Management* (15th Global Edition). London: Pearson Education Limited.  
   **ISBN:** 978-0133856460.
7. **Osterwalder, Alexander., & Pigneur, Yves.** (2010). *Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers*. Hoboken, New Jersey: John Wiley & Sons, Inc.  
   **ISBN:** 978-0470876411.  
   **DOI:** [10.1111/j.1540-5885.2012.00977_2.x](https://doi.org/10.1111/j.1540-5885.2012.00977_2.x)
8. **Osterwalder, Alexander., Pigneur, Yves., Bernarda, Gregory., & Smith, Alan.** (2014). *Value Proposition Design: How to Create Products and Services Customers Want*. Hoboken, New Jersey: John Wiley & Sons, Inc.  
   **ISBN:** 978-1118968055.
9. **Otoritas Jasa Keuangan (OJK).** (2024). *Hasil Survei Nasional Literasi dan Inklusi Keuangan (SNLKI) Tahun 2024*. Kerjasama Otoritas Jasa Keuangan bersama Badan Pusat Statistik (BPS). Jakarta: Departemen Literasi, Inklusi Keuangan dan Komunikasi OJK.  
   **Tautan Publikasi Resmi:** [https://ojk.go.id/id/berita-dan-kegiatan/siaran-pers/Pages/Hasil-Survei-Nasional-Literasi-dan-Inklusi-Keuangan-Tahun-2024.aspx](https://ojk.go.id/id/berita-dan-kegiatan/siaran-pers/Pages/Hasil-Survei-Nasional-Literasi-dan-Inklusi-Keuangan-Tahun-2024.aspx)
10. **Prelec, Drazen., & Loewenstein, George.** (1998). *The Red and the Black: Mental Accounting of Savings and Debt*. Marketing Science, 17(1), 4–28.  
    **DOI:** [10.1287/mksc.17.1.4](https://doi.org/10.1287/mksc.17.1.4)
11. **Supriyono, R. A.** (2011). *Akuntansi Biaya: Pengumpulan Biaya dan Penentuan Harga Pokok*. Buku 1, Edisi Ketiga. Yogyakarta: Penerbit BPFE-UGM.  
    **ISBN:** 978-979-503-013-3.
12. **Thaler, Richard H.** (1999). *Mental Accounting Matters*. Journal of Behavioral Decision Making, 12(3), 183–206.  
    **DOI:** [10.1002/(SICI)1099-0771(199909)12:3<183::AID-BDM318>3.0.CO;2-F](https://doi.org/10.1002/(SICI)1099-0771(199909)12:3%3C183::AID-BDM318%3E3.0.CO;2-F)

<div style="page-break-after: always;"></div>

---

## LAMPIRAN

### Lampiran A: Value Proposition Canvas (VPC) Cukupin™

<!-- VPC HTML COMPARATIVE CARDS -->
<div class="vpc-container">
  <div class="vpc-column value-map-col">
    <div class="vpc-col-header value-map-header">THE VALUE MAP (PRODUK & LAYANAN CUKUPIN™)</div>
    
    <div class="vpc-box">
      <div class="vpc-box-title prod-title">PRODUCTS & SERVICES</div>
      <ul class="vpc-list">
        <li>Aplikasi Web & Mobile Cukupin™ (Progressive Web App).</li>
        <li>Modul Pencatatan Cepat & Multi-Rekening (Kas, Bank, E-Wallet).</li>
        <li>Modul Anggaran Dinamis & Pengingat Tagihan Berkala.</li>
        <li>Pelacak Target Tabungan (Goals Tracker) & Ekspor Laporan.</li>
      </ul>
    </div>

    <div class="vpc-box">
      <div class="vpc-box-title gain-title">GAIN CREATORS</div>
      <ul class="vpc-list">
        <li>Pencatatan kilat &lt;5 detik tanpa formulir berbelit.</li>
        <li>Lingkungan bebas iklan 100% yang hening dan fokus.</li>
        <li>Berjalan mulus secara luring (Offline-First) di segala kondisi.</li>
        <li>Visualisasi grafik arus kas yang mudah dipahami orang awam.</li>
        <li>Ekspor dokumen pembukuan instan format PDF & CSV.</li>
      </ul>
    </div>

    <div class="vpc-box">
      <div class="vpc-box-title pain-title">PAIN RELIEVERS</div>
      <ul class="vpc-list">
        <li>Menghilangkan gangguan iklan pop-up dan video komersial.</li>
        <li>Ukuran aplikasi sangat ringan (&lt;5 MB) tanpa membebani RAM gawai.</li>
        <li>Kedaulatan privasi: data disimpan lokal terenkripsi tanpa izin aneh.</li>
        <li>Mencegah lupa mencatat transaksi berkat alur minim friksi.</li>
      </ul>
    </div>
  </div>

  <div class="vpc-column customer-profile-col">
    <div class="vpc-col-header customer-profile-header">THE CUSTOMER PROFILE (INDIVIDU & UMKM MIKRO)</div>
    
    <div class="vpc-box">
      <div class="vpc-box-title job-title">CUSTOMER JOBS</div>
      <ul class="vpc-list">
        <li>Mencatat pengeluaran jajan dan transaksi harian pasca-QRIS.</li>
        <li>Memantau sisa saldo di berbagai dompet digital dan rekening bank.</li>
        <li>Mengontrol anggaran bulanan agar tidak habis sebelum akhir bulan.</li>
        <li>Memisahkan uang pribadi dengan uang kas modal usaha mikro.</li>
      </ul>
    </div>

    <div class="vpc-box">
      <div class="vpc-box-title gain-title">CUSTOMER GAINS</div>
      <ul class="vpc-list">
        <li>Mengetahui ke mana uang mengalir secara transparan.</li>
        <li>Mencegah kebocoran anggaran mikroskopis (phantom expenses).</li>
        <li>Mencapai target tabungan dana darurat atau impian masa depan.</li>
        <li>Merasa tenang dan memiliki kendali penuh atas masa depan finansial.</li>
      </ul>
    </div>

    <div class="vpc-box">
      <div class="vpc-box-title pain-title">CUSTOMER PAINS</div>
      <ul class="vpc-list">
        <li>Frustrasi melihat aplikasi pencatat lain dipenuhi iklan pinjaman online.</li>
        <li>Malas mencatat karena aplikasi lambat dibuka dan formulir rumit.</li>
        <li>Takut data keuangan pribadi bocor atau dijual ke pihak ketiga.</li>
        <li>Aplikasi macet atau tidak bisa dibuka saat sinyal internet lemah.</li>
      </ul>
    </div>
  </div>
</div>

<div style="page-break-after: always;"></div>

---

### Lampiran B: Business Model Canvas (BMC - 9 Blok Osterwalder)

| **KEY PARTNERS** | **KEY ACTIVITIES** | **VALUE PROPOSITIONS** | **CUSTOMER RELATIONSHIPS** | **CUSTOMER SEGMENTS** |
| :--- | :--- | :--- | :--- | :--- |
| • Penyedia Gerbang Pembayaran (*Payment Gateway* QRIS/VA)<br>• Komunitas *Frugal Living* & Mahasiswa ITS<br>• Komunitas Pegiat UMKM Mandiri<br>• Infrastruktur Cloud Supabase & Edge Network | • Pengembangan Perangkat Lunak PWA<br>• Pengujian Keamanan & Kedaulatan Privasi Data<br>• Produksi Konten Edukasi Literasi Finansial<br>• Dukungan Layanan Pengguna & Pembaruan Sistem | • Pencatatan transaksi <5 detik tanpa friksi<br>• 100% Bebas Iklan Komersial Permanen<br>• Berjalan lancar secara luring (*Offline-First*)<br>• Aplikasi sangat ringan (<5 MB PWA)<br>• Multi-rekening & Dompet Digital<br>• Visualisasi anggaran & ekspor laporan instan | • Layanan Mandiri (*Automated Self-Service*)<br>• Kanal Komunitas Diskusi Edukatif<br>• Umpan Balik Cepat Pengguna (*In-App Feedback*)<br>• Komitmen Transparansi Privasi Data | • **Primer:** *First-jobbers* & Pekerja Muda (21–30 thn) pengguna aktif QRIS<br>• **Sekunder:** Mahasiswa tingkat akhir & Pelajar mandiri<br>• **Tersier:** Pelaku Usaha Mikro / *Online Shop* rumahan |
| **KEY RESOURCES** | | | **CHANNELS** | |
| • Basis Kode PWA & Desain Antarmuka Modern<br>• Infrastruktur Peladen Terkelola (*Lean Cloud*)<br>• Aset Merek & Domain Resmi Cukupin™<br>• Tim Inti Pengembang (CEO, CTO, CMO, CFO) | | | • Situs Resmi Web PWA (`cukupin.id`)<br>• Media Sosial Organik (TikTok, IG Reels, X)<br>• Pemasaran dari Mulut ke Mulut (*Word-of-Mouth*)<br>• Komunitas Finansial Daring | |

| **COST STRUCTURE** | **REVENUE STREAMS** |
| :--- | :--- |
| • Biaya Peladen Awan & Basis Data Terkelola (Supabase/Edge)<br>• Biaya Pemeliharaan Domain, SSL, & Lisensi Software<br>• Tunjangan Operasional Dasar Tim Pengembang<br>• Biaya Promosi & Pemasaran Konten Organik<br>• Biaya Transaksi Gerbang Pembayaran (*Payment Gateway Fee*) | • Biaya Berlangganan Tahunan **Cukupin™ Pro** (Rp 89.000 / tahun)<br>• Biaya Berlangganan Bulanan **Cukupin™ Pro** (Rp 12.000 / bulan)<br>• Biaya Unduhan Laporan Fleksibel (*Pay-per-Export* Rp 5.000 / berkas)<br>• Lisensi Kemitraan Komunitas & Institusi Edukasi (Fase Lanjutan) |

<div style="page-break-after: always;"></div>

---

### Lampiran C: Desain Antarmuka & Tangkapan Layar Aplikasi Cukupin™

Berikut merupakan dokumentasi antarmuka dan visualisasi fitur-fitur unggulan Cukupin™ (Smart Personal & Micro-Business Financial Tracker):

#### 1. Dashboard Utama & Ringkasan Saldo (Desktop & Tablet)
Antarmuka utama menyajikan ringkasan total saldo bersih (*net worth*), grafik pemasukan vs pengeluaran, perincian arus kas bulanan, serta daftar transaksi terkini dengan kontras tinggi yang ramah mata.

![Dashboard Utama Cukupin™](assets/dashboard_preview.png)

<div style="page-break-after: always;"></div>

#### 2. Antarmuka Pengguna Ponsel Pintar (Mobile PWA Experience)
Tampilan pada ponsel pintar didesain dengan ergonomi satu tangan (*thumb-friendly*), menghadirkan tombol pencatatan cepat di posisi bawah yang memungkinkan pengguna memasukkan transaksi dalam waktu di bawah 5 detik saat bertransaksi di kasir.

![Tampilan Mobile PWA Cukupin™](assets/mobile_preview.png)

<div style="page-break-after: always;"></div>

#### 3. Modul Laporan Analitik Keuangan & Ekspor Dokumen
Menyajikan pembagian porsi pengeluaran berdasarkan kategori dalam bentuk diagram lingkaran interaktif serta tren pengeluaran mingguan, lengkap dengan tombol ekspor berkas PDF dan CSV resmi.

![Laporan Analitik Keuangan Cukupin™](assets/reports_preview.png)

<div style="page-break-after: always;"></div>

#### 4. Modul Pelacak Target Tabungan (*Goals Tracker*)
Membantu pengguna mendisiplinkan tabungan masa depan dengan kartu target interaktif yang menampilkan nominal terkumpul, target akhir, dan persentase capaian secara visual.

![Pelacak Target Tabungan Cukupin™](assets/goals_preview.png)

---
*Dokumen Proposal Bisnis Cukupin™ — Hak Cipta © 2026 Dilindungi Undang-Undang.*
"""


def create_markdown_file():
    print(f"Writing Markdown file to: {MD_PATH}")
    with open(MD_PATH, "w", encoding="utf-8") as f:
        f.write(MD_CONTENT)
    print("Markdown file updated successfully.")


def generate_pdf_from_html():
    print("Converting Markdown to styled HTML...")
    html_body = markdown.markdown(
        MD_CONTENT,
        extensions=["tables", "fenced_code", "nl2br"]
    )

    # Convert relative asset paths to absolute file:// URLs for Playwright
    html_body = html_body.replace("assets/", abs_assets_url)

    html_template = f"""<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Proposal Bisnis Cukupin™ (Financial Tracker)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

  @page {{
    size: A4 portrait;
    margin: 20mm 16mm 20mm 16mm;
    @bottom-right {{
      content: counter(page);
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 8pt;
      color: #64748b;
    }}
    @bottom-left {{
      content: "Cukupin™ — Proposal Business Plan";
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }}
  }}

  * {{
    box-sizing: border-box;
  }}

  body {{
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.58;
    color: #1e293b;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
  }}

  h1 {{
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.25;
    margin-top: 22pt;
    margin-bottom: 10pt;
    text-align: center;
  }}

  h2 {{
    font-size: 13.5pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 4pt;
    margin-top: 18pt;
    margin-bottom: 9pt;
    page-break-after: avoid;
  }}

  h3 {{
    font-size: 11pt;
    font-weight: 600;
    color: #0369a1;
    margin-top: 13pt;
    margin-bottom: 5pt;
    page-break-after: avoid;
  }}

  h4 {{
    font-size: 10pt;
    font-weight: 600;
    color: #334155;
    margin-top: 9pt;
    margin-bottom: 4pt;
    page-break-after: avoid;
  }}

  p {{
    margin-top: 0;
    margin-bottom: 7pt;
    text-align: justify;
    text-justify: inter-word;
  }}

  blockquote {{
    border-left: 4px solid #0284c7;
    background-color: #f0f9ff;
    padding: 7pt 12pt;
    margin: 9pt 0;
    border-radius: 0 6px 6px 0;
    font-style: italic;
    color: #0c4a6e;
  }}

  ul, ol {{
    margin-top: 0;
    margin-bottom: 7pt;
    padding-left: 17pt;
  }}

  li {{
    margin-bottom: 3.5pt;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin-top: 8pt;
    margin-bottom: 11pt;
    font-size: 8pt;
    page-break-inside: avoid;
  }}

  th {{
    background-color: #0f172a;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 5pt 7pt;
    border: 1px solid #0f172a;
  }}

  td {{
    padding: 4.5pt 7pt;
    border: 1px solid #cbd5e1;
    vertical-align: top;
  }}

  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}

  hr {{
    border: 0;
    height: 1px;
    background: #e2e8f0;
    margin: 12pt 0;
  }}

  img {{
    max-width: 100%;
    height: auto;
    display: block;
    margin: 8pt auto;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    page-break-inside: avoid;
  }}

  /* =======================================================
     OXFORD COLLEGE OF MARKETING TOWS MATRIX LAYOUT
     ======================================================= */
  .tows-wrapper {{
    margin: 12pt 0;
    page-break-inside: avoid;
  }}

  .tows-layout {{
    display: grid;
    grid-template-columns: 36px 175px 1fr 1fr;
    grid-template-rows: auto auto 1fr 1fr;
    gap: 7px;
  }}

  /* Internal Factors Header across col 3 and col 4 */
  .header-internal {{
    grid-column: 3 / span 2;
    grid-row: 1;
    background-color: #5c3866; /* Oxford purple */
    color: #ffffff;
    font-size: 11pt;
    font-weight: 800;
    text-align: center;
    padding: 7px 10px;
    border-radius: 4px;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }}

  /* External Factors Vertical Banner on the left spanning rows 3 and 4 */
  .banner-external {{
    grid-column: 1;
    grid-row: 3 / span 2;
    background-color: #5c3866; /* Oxford purple */
    color: #ffffff;
    font-size: 10pt;
    font-weight: 800;
    letter-spacing: 0.8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    padding: 8px 2px;
    text-transform: uppercase;
  }}

  /* Corner empty or brand cell */
  .cell-corner {{
    grid-column: 2;
    grid-row: 2;
    background: #f1f5f9;
    border: 1px dashed #cbd5e1;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px;
    text-align: center;
  }}

  .corner-title {{
    font-size: 9pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: 0.3px;
  }}

  .corner-sub {{
    font-size: 7pt;
    color: #64748b;
    margin-top: 1pt;
  }}

  /* Generic TOWS block */
  .tows-block {{
    display: flex;
    flex-direction: column;
    border: 1.5px solid #1c6b8c;
    border-radius: 4px;
    overflow: hidden;
    background: #ffffff;
  }}

  .tows-block-header {{
    background-color: #1c6b8c; /* Oxford blue */
    color: #ffffff;
    font-size: 8.5pt;
    font-weight: 800;
    text-align: center;
    padding: 5px 6px;
    letter-spacing: 0.3px;
  }}

  .tows-block-body {{
    padding: 6px 8px;
    font-size: 7.2pt;
    line-height: 1.38;
    color: #1e293b;
    flex: 1;
  }}

  .tows-block-body ul {{
    margin: 0;
    padding-left: 12px;
  }}

  .tows-block-body li {{
    margin-bottom: 3px;
  }}

  .tows-block-body li:last-child {{
    margin-bottom: 0;
  }}

  /* Grid Cell Positions */
  .cell-strengths {{
    grid-column: 3;
    grid-row: 2;
  }}
  .cell-weaknesses {{
    grid-column: 4;
    grid-row: 2;
  }}
  .cell-opportunities {{
    grid-column: 2;
    grid-row: 3;
  }}
  .cell-so {{
    grid-column: 3;
    grid-row: 3;
    background-color: #f0fdf4;
  }}
  .cell-wo {{
    grid-column: 4;
    grid-row: 3;
    background-color: #f0f9ff;
  }}
  .cell-threats {{
    grid-column: 2;
    grid-row: 4;
  }}
  .cell-st {{
    grid-column: 3;
    grid-row: 4;
    background-color: #fffbeb;
  }}
  .cell-wt {{
    grid-column: 4;
    grid-row: 4;
    background-color: #f8fafc;
  }}

  /* Strategy Accent Headers */
  .cell-so .tows-block-header {{ background-color: #0d6545; }}
  .cell-so {{ border-color: #0d6545; }}

  .cell-wo .tows-block-header {{ background-color: #1a6485; }}
  .cell-wo {{ border-color: #1a6485; }}

  .cell-st .tows-block-header {{ background-color: #92510b; }}
  .cell-st {{ border-color: #92510b; }}

  .cell-wt .tows-block-header {{ background-color: #334155; }}
  .cell-wt {{ border-color: #334155; }}

  /* =======================================================
     OTHER EXECUTIVE VISUAL BLOCKS
     ======================================================= */

  /* 2. Customer Journey Flow */
  .journey-container {{
    display: flex;
    flex-direction: column;
    gap: 6pt;
    margin: 10pt 0;
    page-break-inside: avoid;
  }}

  .journey-card {{
    display: flex;
    align-items: flex-start;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #0284c7;
    border-radius: 6px;
    padding: 7pt 10pt;
  }}

  .journey-step-num {{
    background: #0284c7;
    color: #ffffff;
    font-weight: 800;
    font-size: 9pt;
    width: 22pt;
    height: 22pt;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10pt;
    flex-shrink: 0;
  }}

  .journey-content {{
    flex: 1;
  }}

  .journey-title {{
    font-size: 8.5pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 2pt;
  }}

  .journey-desc {{
    font-size: 7.8pt;
    color: #475569;
    line-height: 1.45;
  }}

  /* 3. Org Hierarchy Cards */
  .org-container {{
    margin: 10pt 0;
    page-break-inside: avoid;
  }}

  .org-leader-card {{
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    border-radius: 8px;
    padding: 9pt 12pt;
    text-align: center;
    margin-bottom: 8pt;
    border: 1px solid #0f172a;
  }}

  .org-badge {{
    display: inline-block;
    font-size: 7pt;
    font-weight: 700;
    padding: 2pt 6pt;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 3pt;
  }}

  .ceo-badge {{
    background: #38bdf8;
    color: #0f172a;
  }}

  .org-name {{
    font-size: 10.5pt;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 1pt;
  }}

  .org-dept {{
    font-size: 7.8pt;
    color: #94a3b8;
    margin-bottom: 4pt;
  }}

  .org-leader-card .org-desc {{
    font-size: 7.5pt;
    color: #cbd5e1;
    line-height: 1.4;
    max-width: 90%;
    margin: 0 auto;
  }}

  .org-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 7pt;
  }}

  .org-sub-card {{
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 7pt 8pt;
    text-align: center;
  }}

  .cto-badge {{ background: #e0f2fe; color: #0369a1; }}
  .cmo-badge {{ background: #fef3c7; color: #92400e; }}
  .cfo-badge {{ background: #d1fae5; color: #065f46; }}

  .org-title {{
    font-size: 8pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 2pt;
    margin-bottom: 3pt;
  }}

  .org-sub-card .org-desc {{
    font-size: 7.2pt;
    color: #475569;
    line-height: 1.35;
    text-align: justify;
  }}

  /* 4. Value Proposition Canvas (VPC) */
  .vpc-container {{
    display: flex;
    gap: 8pt;
    margin: 10pt 0;
    page-break-inside: avoid;
  }}

  .vpc-column {{
    flex: 1;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
  }}

  .vpc-col-header {{
    padding: 6pt 8pt;
    font-size: 8pt;
    font-weight: 800;
    text-align: center;
    letter-spacing: 0.3px;
  }}

  .value-map-header {{
    background: #0284c7;
    color: #ffffff;
  }}

  .customer-profile-header {{
    background: #0f172a;
    color: #ffffff;
  }}

  .vpc-box {{
    padding: 6pt 8pt;
    border-bottom: 1px solid #e2e8f0;
  }}

  .vpc-box:last-child {{
    border-bottom: none;
  }}

  .vpc-box-title {{
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 3pt;
  }}

  .prod-title {{ color: #0284c7; }}
  .gain-title {{ color: #059669; }}
  .pain-title {{ color: #dc2626; }}
  .job-title  {{ color: #475569; }}

  .vpc-list {{
    margin: 0;
    padding-left: 12pt;
    font-size: 7.4pt;
    line-height: 1.4;
  }}

  .vpc-list li {{
    margin-bottom: 2pt;
  }}

  /* =======================================================
     MATH / FORMULA CALLOUT CARDS (CLEAN FRACTIONS, NO ERRORS)
     ======================================================= */
  .math-box {{
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1.5px solid #cbd5e1;
    border-left: 4.5px solid #0284c7;
    border-radius: 8px;
    padding: 8pt 12pt;
    margin: 9pt 0;
    page-break-inside: avoid;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
  }}

  .math-box-title {{
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #0369a1;
    margin-bottom: 6pt;
    border-bottom: 1px dashed #cbd5e1;
    padding-bottom: 3pt;
  }}

  .math-row {{
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    margin-bottom: 3pt;
  }}

  .math-label {{
    color: #475569;
    font-weight: 500;
  }}

  .math-val {{
    color: #0f172a;
    font-weight: 700;
  }}

  .math-calc-line {{
    font-size: 9.5pt;
    color: #0f172a;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 5pt;
    padding-top: 4pt;
  }}

  .math-fraction {{
    display: inline-flex;
    flex-direction: column;
    vertical-align: middle;
    text-align: center;
    padding: 0 4px;
    margin: 0 2px;
  }}

  .math-num {{
    border-bottom: 1.5px solid #1e293b;
    padding-bottom: 1.5px;
    font-size: 8pt;
    font-weight: 600;
  }}

  .math-den {{
    padding-top: 1.5px;
    font-size: 8pt;
    font-weight: 600;
  }}

  .math-highlight {{
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 800;
    padding: 1.5pt 6pt;
    border-radius: 4px;
    border: 1px solid #bae6fd;
  }}

  .math-highlight-green {{
    background: #d1fae5;
    color: #065f46;
    font-weight: 800;
    padding: 1.5pt 6pt;
    border-radius: 4px;
    border: 1px solid #a7f3d0;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

    with open(HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"HTML template generated at: {HTML_PATH}")

    print(f"Launching Playwright to render PDF to: {PDF_PATH}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(f"file:///{HTML_PATH.replace(chr(92), '/')}", wait_until="networkidle")
        
        page.pdf(
            path=PDF_PATH,
            format="A4",
            print_background=True,
            margin={
                "top": "20mm",
                "right": "16mm",
                "bottom": "20mm",
                "left": "16mm"
            },
            display_header_footer=True,
            header_template='<div style="font-size: 7pt; font-family: sans-serif; color: #94a3b8; width: 100%; text-align: right; padding-right: 16mm;">Cukupin™ — Proposal Business Plan</div>',
            footer_template='<div style="font-size: 7pt; font-family: sans-serif; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding-left: 16mm; padding-right: 16mm;"><span>Departemen Teknik Elektro FTEIC ITS &bull; 2026</span><span>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></span></div>'
        )
        browser.close()
    
    print("PDF generated successfully!")


if __name__ == "__main__":
    create_markdown_file()
    generate_pdf_from_html()
