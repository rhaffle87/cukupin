import React from 'react'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Gavel,
  Globe2,
  Key,
  Lock,
  Mail,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'

export const metadata = {
  title: 'Syarat & Ketentuan - Cukupin',
  description: 'Syarat dan Ketentuan Penggunaan aplikasi Cukupin. Ketentuan transparan, batasan tanggung jawab, dan penafian finansial mandiri.',
}

export default function TermsOfServicePage() {
  const lastUpdated = '6 September 2026'

  const tocItems = [
    { id: 'penerimaan-ketentuan', title: '1. Penerimaan Ketentuan & Ruang Lingkup' },
    { id: 'deskripsi-layanan', title: '2. Deskripsi Layanan & Sifat Mandiri' },
    { id: 'penafian-finansial', title: '3. Penafian Finansial & Investasi (Disclaimer)' },
    { id: 'akun-pengguna', title: '4. Pendaftaran Akun & Tanggung Jawab Kredensial' },
    { id: 'kepemilikan-konten', title: '5. Kepemilikan Data & Konten Pengguna' },
    { id: 'penggunaan-wajar', title: '6. Batasan Penggunaan yang Diperbolehkan' },
    { id: 'ketersediaan-layanan', title: '7. Ketersediaan Layanan & Pencadangan Mandiri' },
    { id: 'hak-kekayaan-intelektual', title: '8. Hak Kekayaan Intelektual (HAKI)' },
    { id: 'pembatasan-tanggung-jawab', title: '9. Pembatasan Tanggung Jawab (Liability)' },
    { id: 'pengakhiran-layanan', title: '10. Pengakhiran Akun & Layanan' },
    { id: 'hukum-sengketa', title: '11. Hukum yang Berlaku & Yurisdiksi' },
    { id: 'kontak-resmi', title: '12. Saluran Resmi Bantuan Hukum' },
  ]

  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-green-soft selection:text-green">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Brand />
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/legal/privacy"
              className="hidden sm:inline-flex text-muted hover:text-ink transition-colors"
            >
              Kebijakan Privasi
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
          <div className="inline-flex items-center gap-2 rounded-full border border-blue/30 bg-blue-soft px-3.5 py-1 text-[10px] font-bold tracking-widest text-blue uppercase mb-4">
            <Gavel size={14} /> KESEPAKATAN HUKUM PENGGUNA · VERSI 1.2
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-ink leading-tight">
            Syarat & Ketentuan Penggunaan
          </h1>
          <p className="mt-4 text-sm sm:text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Selamat datang di Cukupin. Ketentuan ini memuat hak, kewajiban, batasan tanggung jawab, dan pedoman penggunaan layanan kami secara adil, transparan, dan saling menghargai.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-medium text-ink shadow-2xs">
              <Clock size={13} className="text-green" /> Pembaruan Terakhir: {lastUpdated}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-medium text-ink shadow-2xs">
              <Scale size={13} className="text-blue" /> Yurisdiksi: Republik Indonesia
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-medium text-ink shadow-2xs">
              <ShieldCheck size={13} className="text-green" /> Bebas Biaya & Tanpa Iklan
            </span>
          </div>
        </div>

        {/* 3 Core Pillars */}
        <div className="mx-auto max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-soft text-blue mb-3">
              <Scale size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Bukan Penasihat Finansial</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Cukupin adalah alat pencatatan mandiri. Kalkulasi sistem tidak merupakan nasihat investasi atau perencanaan finansial OJK.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-soft text-green mb-3">
              <FileText size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Kedaulatan Konten Anda</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Seluruh catatan pemasukan, pengeluaran, dan target tabungan yang Anda buat 100% adalah milik Anda secara mutlak.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-card p-5 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-soft text-coral mb-3">
              <Key size={18} />
            </div>
            <h3 className="font-display text-sm font-bold text-ink">Tanggung Jawab Akun</h3>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Anda bertanggung jawab menjaga kerahasiaan kata sandi akun serta disarankan mengunduh berkas cadangan secara berkala.
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
              <p className="text-[10px] font-bold tracking-widest text-[#89938A] uppercase">DAFTAR PASAL</p>
              <h2 className="font-display text-base font-bold text-ink mt-1">Navigasi Dokumen</h2>
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
              <div className="rounded-xl border border-blue/30 bg-blue-soft/40 p-3.5 text-[11px] text-muted">
                <strong className="block font-bold text-ink text-xs mb-1">Pertanyaan Hukum?</strong>
                Tim legal kami siap membantu menjawab pertanyaan Anda melalui email:
                <a
                  href="mailto:legal@cukupin.app"
                  className="mt-2 inline-flex items-center gap-1.5 font-bold text-blue hover:underline"
                >
                  <Mail size={13} /> legal@cukupin.app
                </a>
              </div>
            </div>
          </aside>

          {/* Detailed Legal Articles */}
          <main className="lg:col-span-8 space-y-10 text-sm leading-relaxed text-ink/90">
            
            {/* Section 1 */}
            <section id="penerimaan-ketentuan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Gavel size={16} /> PASAL 1
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                1. Penerimaan Ketentuan & Ruang Lingkup Perjanjian
              </h2>
              <p>
                Dengan mendaftar, mengakses, atau menggunakan aplikasi web dan layanan <strong>Cukupin</strong> (selanjutnya disebut &ldquo;<strong>Layanan</strong>&rdquo; atau &ldquo;<strong>Aplikasi</strong>&rdquo;), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat secara hukum oleh Syarat dan Ketentuan ini beserta <Link href="/legal/privacy" className="text-green font-bold hover:underline">Kebijakan Privasi</Link> kami.
              </p>
              <p>
                Apabila Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda dipersilakan untuk tidak melanjutkan pendaftaran atau menghentikan penggunaan Layanan kami.
              </p>
            </section>

            {/* Section 2 */}
            <section id="deskripsi-layanan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <FileSpreadsheet size={16} /> PASAL 2
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                2. Deskripsi Layanan & Sifat Pencatatan Mandiri
              </h2>
              <p>
                Cukupin adalah perangkat lunak berbasis Progressive Web App (PWA) yang dirancang untuk mempermudah pencatatan arus kas pribadi secara mandiri. Layanan ini mencakup:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>Pencatatan transaksi pengeluaran dan pemasukan harian dengan klasifikasi kategori otomatis.</li>
                <li>Simulasi pembagian anggaran harian (&ldquo;<em>Budget Harian Aman / Daily Safe Spend</em>&rdquo;).</li>
                <li>Pemantauan alokasi rasio kebutuhan 50/30/20 dan progres target tabungan.</li>
                <li>Daftar keinginan anti-impulsif (Wishlist) dan ekspor laporan buku kas ke dalam format PDF dan CSV.</li>
              </ul>
              <p>
                Cukupin <strong>tidak terhubung</strong> secara langsung ke sistem perbankan nasional, Open Banking API, payment gateway eksternal, atau lembaga kliring keuangan mana pun.
              </p>
            </section>

            {/* Section 3 - Critical Disclaimer */}
            <section id="penafian-finansial" className="scroll-mt-28 space-y-4 rounded-2xl border border-coral/40 bg-coral-soft/20 p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-coral uppercase tracking-wider">
                <AlertTriangle size={16} /> PASAL 3 (PENTING)
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                3. Penafian Finansial & Hukum (Financial Disclaimer)
              </h2>
              <div className="rounded-xl border border-coral/40 bg-card p-4 text-xs text-ink space-y-2">
                <strong className="block font-bold text-coral text-sm">
                  CUKUPIN BUKAN LEMBAGA KEUANGAN ATAU PENASIHAT INVESTASI
                </strong>
                <p className="leading-relaxed">
                  Semua grafik, estimasi, pembagian budget harian, dan metrik yang disajikan dalam Cukupin dihitung secara matematis deterministik berdasarkan input mandiri yang Anda masukkan.
                </p>
                <p className="leading-relaxed">
                  Informasi yang diberikan tidak boleh dianggap atau ditafsirkan sebagai nasihat keuangan profesional, rekomendasi investasi, anjuran perpajakan, maupun penawaran produk keuangan berlisensi Otoritas Jasa Keuangan (OJK). Segala keputusan keuangan, pengeluaran, investasi, atau pinjaman yang Anda ambil adalah tanggung jawab pribadi Anda seutuhnya.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="akun-pengguna" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Key size={16} /> PASAL 4
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                4. Pendaftaran Akun & Tanggung Jawab Kredensial
              </h2>
              <p>Untuk menikmati sinkronisasi cloud antar-perangkat, Anda perlu membuat akun:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>Anda wajib memberikan alamat email yang valid dan dapat diakses.</li>
                <li>Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi akun Anda.</li>
                <li>Setiap aktivitas yang terjadi di bawah kredensial akun Anda dianggap sebagai tindakan sah yang Anda lakukan secara sadar.</li>
                <li>Jika Anda mencurigai adanya akses tanpa hak terhadap akun Anda, segera ganti kata sandi atau hubungi tim kami untuk pengamanan sesi.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="kepemilikan-konten" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <CheckCircle2 size={16} /> PASAL 5
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                5. Kepemilikan Data & Konten Pengguna
              </h2>
              <p>
                Anda memegang hak kepemilikan mutlak atas seluruh data keuangan, deskripsi belanja, target tabungan, dan file CSV yang Anda unggah ke Cukupin:
              </p>
              <p>
                Dengan menggunakan Layanan, Anda hanya memberikan lisensi terbatas, non-eksklusif, dan bebas royalti kepada Cukupin semata-mata untuk menyimpan, menampilkan, dan menghitung data tersebut di layar perangkat Anda sesuai permintaan fungsionalitas aplikasi.
              </p>
              <p>
                Kami <strong>tidak pernah mengklaim hak cipta</strong> atas isi catatan keuangan Anda dan tidak menggunakan data transaksi pribadi Anda untuk melatih model AI publik atau menjualnya ke pihak periklanan.
              </p>
            </section>

            {/* Section 6 */}
            <section id="penggunaan-wajar" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <ShieldAlert size={16} /> PASAL 6
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                6. Batasan Penggunaan yang Diperbolehkan (Acceptable Use)
              </h2>
              <p>Saat menggunakan Cukupin, Anda setuju untuk TIDAK:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>Melakukan reverse-engineering, dekompilasi, atau mencoba membongkar kode sumber backend secara melawan hukum.</li>
                <li>Menggunakan bot, scraper otomatis, atau script otomatisasi berlebihan yang dapat membebani kapasitas server kami (Denial of Service).</li>
                <li>Menyalahgunakan fitur impor CSV untuk menyuntikkan payload berbahaya (malicious code, SQL injection, XSS).</li>
                <li>Menggunakan Cukupin untuk memfasilitasi aktivitas pencucian uang, pendanaan terorisme, atau kegiatan kriminal lainnya yang bertentangan dengan hukum Republik Indonesia.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="ketersediaan-layanan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Clock size={16} /> PASAL 7
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                7. Ketersediaan Layanan & Pencadangan Mandiri (As-Is / SLA)
              </h2>
              <p>
                Layanan Cukupin disediakan secara <strong>&ldquo;SEBAGAIMANA ADANYA&rdquo; (AS-IS)</strong> dan <strong>&ldquo;SEBAGAIMANA TERSEDIA&rdquo; (AS-AVAILABLE)</strong> tanpa jaminan garansi eksplisit maupun implisit.
              </p>
              <p>
                Meskipun kami berupaya keras menjaga ketersediaan sistem 99.9% dan menyediakan kemampuan offline via PWA, kami tidak dapat menjamin bahwa layanan akan bebas dari pemeliharaan terjadwal, gangguan jaringan internet global, atau bencana di luar kendali wajar (force majeure).
              </p>
              <div className="rounded-xl border border-green/30 bg-green-soft/40 p-4 text-xs">
                <strong className="block font-bold text-ink mb-1">Anjuran Pencadangan Rutin:</strong>
                Anda sangat dianjurkan untuk memanfaatkan fitur <strong>Export PDF / CSV</strong> dan <strong>Cadangan JSON</strong> di menu Transaksi secara berkala sebagai arsip mandiri di penyimpanan pribadi Anda.
              </div>
            </section>

            {/* Section 8 */}
            <section id="hak-kekayaan-intelektual" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Scale size={16} /> PASAL 8
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                8. Hak Kekayaan Intelektual (HAKI)
              </h2>
              <p>
                Seluruh logo, merek dagang &ldquo;<strong>Cukupin</strong>&rdquo;, desain antarmuka, tata letak visual, ikonografi, dan kode sumber aplikasi dilindungi oleh Undang-Undang Hak Cipta dan peraturan kekayaan intelektual yang berlaku di Republik Indonesia.
              </p>
              <p>
                Anda tidak diperkenankan menyalin, memodifikasi, mendistribusikan ulang, atau menggunakan elemen merek Cukupin untuk kepentingan komersial tanpa izin tertulis dari pemilik hak cipta Cukupin.
              </p>
            </section>

            {/* Section 9 */}
            <section id="pembatasan-tanggung-jawab" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <ShieldAlert size={16} /> PASAL 9
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                9. Pembatasan Tanggung Jawab (Limitation of Liability)
              </h2>
              <p>
                Sepanjang diperbolehkan oleh hukum yang berlaku, Cukupin, pengembang, dan afiliasinya tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted">
                <li>Segala kerugian finansial, kegagalan berhemat, denda utang, atau keputusan belanja yang timbul dari ketergantungan pada simulasi budget dalam aplikasi.</li>
                <li>Kehilangan data yang diakibatkan oleh kelalaian pengguna dalam menjaga kredensial, menghapus peramban lokal tanpa sinkronisasi, atau kegagalan perangkat keras pribadi pengguna.</li>
                <li>Kerugian tidak langsung, insidental, atau konsekuensial apa pun yang terkait dengan penggunaan atau ketidakmampuan menggunakan Layanan.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="pengakhiran-layanan" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Gavel size={16} /> PASAL 10
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                10. Pengakhiran Akun & Penutupan Layanan
              </h2>
              <p>
                Anda berhak menutup atau menghapus akun Anda kapan saja melalui permohonan ke saluran resmi kami. Setelah penutupan akun diproses, hak Anda untuk mengakses data di server Cukupin akan dihentikan dan data dimusnahkan sesuai Kebijakan Privasi.
              </p>
              <p>
                Kami juga berhak menangguhkan atau mengakhiri akses akun Anda secara sepihak apabila terbukti melakukan pelanggaran berat terhadap Syarat & Ketentuan ini atau terindikasi melakukan tindakan peretasan yang merugikan pengguna lain.
              </p>
            </section>

            {/* Section 11 */}
            <section id="hukum-sengketa" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Scale size={16} /> PASAL 11
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                11. Hukum yang Mengatur & Penyelesaian Sengketa
              </h2>
              <p>
                Syarat dan Ketentuan ini diatur dan ditafsirkan sesuai dengan hukum yang berlaku di <strong>Negara Kesatuan Republik Indonesia</strong>.
              </p>
              <p>
                Setiap perselisihan atau sengketa yang timbul sehubungan dengan pelaksanaan perjanjian ini akan diupayakan untuk diselesaikan terlebih dahulu melalui musyawarah untuk mencapai mufakat. Apabila kesepakatan tidak tercapai dalam waktu 30 (tiga puluh) hari kalender, sengketa akan diselesaikan melalui yurisdiksi pengadilan negeri yang berwenang di wilayah hukum Republik Indonesia.
              </p>
            </section>

            {/* Section 12 */}
            <section id="kontak-resmi" className="scroll-mt-28 space-y-4 rounded-2xl border border-line/80 bg-card p-6 sm:p-8 shadow-2xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue uppercase tracking-wider">
                <Mail size={16} /> PASAL 12
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                12. Saluran Resmi Korespondensi Hukum
              </h2>
              <p>
                Untuk pertanyaan resmi, klarifikasi hak cipta, atau hal-hal hukum terkait Syarat & Ketentuan ini, silakan hubungi saluran komunikasi resmi kami:
              </p>
              
              <div className="rounded-xl border border-line bg-paper/60 p-5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Layanan:</strong>
                  <span className="text-muted">Cukupin (Catat Santai)</span>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Email Urusan Hukum:</strong>
                  <a href="mailto:legal@cukupin.app" className="font-bold text-blue hover:underline">
                    legal@cukupin.app
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <strong className="text-ink">Email Pengaduan Privasi:</strong>
                  <a href="mailto:privasi@cukupin.app" className="font-bold text-green hover:underline">
                    privasi@cukupin.app
                  </a>
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
            <Link href="/legal/privacy" className="hover:text-ink transition-colors">Kebijakan Privasi</Link>
            <a href="mailto:legal@cukupin.app" className="hover:text-ink transition-colors">Hubungi Legal</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
