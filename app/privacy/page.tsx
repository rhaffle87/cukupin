import React from 'react'
import Link from 'next/link'
import { Brand } from '@/components/ui/Brand'

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <header className="landing-header">
        <Brand />
        <nav>
          <Link href="/" className="button secondary small">Kembali</Link>
        </nav>
      </header>

      <main className="legal-content">
        <h1>Kebijakan Privasi (Privacy Policy)</h1>
        <p className="last-updated">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        
        <section>
          <h2>1. Pendahuluan</h2>
          <p>
            Selamat datang di Cukupin. Privasi Anda sangat penting bagi kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda saat menggunakan aplikasi Cukupin.
          </p>
        </section>

        <section>
          <h2>2. Data yang Kami Kumpulkan</h2>
          <p>Kami mengumpulkan data yang Anda berikan secara langsung kepada kami, termasuk namun tidak terbatas pada:</p>
          <ul>
            <li><strong>Informasi Akun:</strong> Alamat email saat Anda mendaftar menggunakan Supabase Auth.</li>
            <li><strong>Data Finansial:</strong> Transaksi, kategori, target tabungan, dan wishlist yang Anda catat di dalam aplikasi.</li>
            <li><strong>Data Analitik:</strong> Kami menggunakan Vercel Analytics yang mengumpulkan data secara anonim terkait lalu lintas pengunjung (seperti halaman yang dikunjungi dan negara asal) untuk meningkatkan UX aplikasi.</li>
          </ul>
        </section>

        <section>
          <h2>3. Bagaimana Kami Menggunakan Data Anda</h2>
          <p>Data Anda hanya digunakan untuk tujuan operasional aplikasi:</p>
          <ul>
            <li>Menyediakan fitur pelacakan dan laporan finansial personal Anda.</li>
            <li>Mengamankan sesi masuk (login) Anda ke dalam sistem.</li>
            <li>Memperbaiki performa dan antarmuka aplikasi.</li>
          </ul>
          <p><strong>Kami tidak pernah dan tidak akan pernah menjual data finansial atau email Anda kepada pihak ketiga.</strong></p>
        </section>

        <section>
          <h2>4. Penyimpanan dan Keamanan Data</h2>
          <p>
            Data Anda disimpan dengan aman menggunakan infrastruktur <strong>Supabase</strong> yang menggunakan enkripsi standar industri. Kata sandi (password) Anda di-hash dengan aman dan tidak dapat dilihat oleh siapa pun, termasuk oleh tim pengembang Cukupin.
          </p>
        </section>

        <section>
          <h2>5. Cookie dan Pelacakan</h2>
          <p>
            Kami menggunakan cookie esensial hanya untuk mempertahankan sesi login Anda. Vercel Web Analytics digunakan tanpa melacak identitas unik Anda (privacy-first analytics).
          </p>
        </section>

        <section>
          <h2>6. Hak Anda</h2>
          <p>
            Anda memiliki hak penuh atas data Anda. Anda dapat menambah, mengedit, atau menghapus catatan keuangan Anda kapan saja melalui aplikasi. Jika Anda ingin menghapus akun dan seluruh data Anda secara permanen, Anda dapat menghubungi tim kami.
          </p>
        </section>

      </main>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Cukupin. All rights reserved.</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .legal-page {
          min-height: 100vh;
          background-color: var(--paper);
          color: var(--ink);
          font-family: var(--font-sans);
        }
        .landing-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .legal-content {
          max-width: 720px;
          margin: 60px auto 120px;
          padding: 0 24px;
          line-height: 1.6;
        }
        .legal-content h1 {
          font-size: 2.2rem;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .last-updated {
          color: var(--muted);
          font-size: 0.9rem;
          margin-bottom: 48px;
        }
        .legal-content section {
          margin-bottom: 40px;
        }
        .legal-content h2 {
          font-size: 1.3rem;
          margin-bottom: 16px;
          color: var(--ink);
        }
        .legal-content p {
          color: #4a5568;
          margin-bottom: 16px;
        }
        .legal-content ul {
          padding-left: 24px;
          margin-bottom: 16px;
          color: #4a5568;
        }
        .legal-content li {
          margin-bottom: 8px;
        }
        .landing-footer {
          padding: 40px 24px;
          text-align: center;
          font-size: 0.85rem;
          color: var(--muted);
        }
      `}} />
    </div>
  )
}
