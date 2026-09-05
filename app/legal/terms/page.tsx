import React from 'react'
import { Brand } from '@/components/ui/Brand'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Syarat dan Ketentuan - Cukupin',
  description: 'Syarat dan Ketentuan penggunaan aplikasi Cukupin.',
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-green-soft selection:text-green">
      <header className="border-b border-line bg-card py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6">
          <Brand />
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-muted transition-colors hover:text-ink">
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </header>
      
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-4 text-[10px] font-bold tracking-widest text-green uppercase">LEGAL</p>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Syarat & Ketentuan</h1>
          <p className="mt-4 text-sm text-muted">Pembaruan Terakhir: 5 September 2026</p>
        </div>
        
        <div className="prose prose-ink max-w-none font-sans prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue prose-a:font-bold prose-a:no-underline hover:prose-a:underline">
          <p>
            Selamat datang di Cukupin. Dengan mengakses atau menggunakan aplikasi Cukupin, Anda setuju untuk terikat oleh Syarat dan Ketentuan ini.
          </p>

          <h3>1. Penerimaan Syarat</h3>
          <p>
            Jika Anda tidak setuju dengan semua syarat dan ketentuan yang tertulis di halaman ini, mohon untuk tidak menggunakan layanan Cukupin.
          </p>

          <h3>2. Deskripsi Layanan</h3>
          <p>
            Cukupin adalah aplikasi pelacakan keuangan pribadi yang memungkinkan pengguna untuk mencatat transaksi, mengatur anggaran, dan melihat analisis keuangan. Aplikasi ini disediakan "sebagaimana adanya" untuk membantu pencatatan keuangan Anda.
          </p>

          <h3>3. Akun Pengguna</h3>
          <p>
            Untuk menggunakan fitur Cukupin, Anda harus membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi dan akun Anda. Cukupin tidak bertanggung jawab atas kerugian atau kerusakan yang timbul dari kegagalan Anda untuk melindungi informasi akun Anda.
          </p>

          <h3>4. Konten Pengguna</h3>
          <p>
            Semua data keuangan yang Anda masukkan ke dalam Cukupin adalah milik Anda. Anda memberikan hak kepada kami untuk menyimpan dan memproses data tersebut semata-mata untuk tujuan pengoperasian layanan Cukupin, sesuai dengan Kebijakan Privasi kami.
          </p>

          <h3>5. Tanggung Jawab Finansial</h3>
          <p>
            Cukupin adalah alat pencatatan dan bukan penasihat keuangan. Data atau analisis apa pun yang disajikan dalam aplikasi tidak boleh dianggap sebagai nasihat keuangan profesional. Kami tidak bertanggung jawab atas keputusan keuangan yang Anda buat.
          </p>

          <h3>6. Ketersediaan Layanan</h3>
          <p>
            Kami berusaha menjaga aplikasi agar berjalan 24/7, namun kami tidak menjamin layanan akan selalu bebas dari gangguan, penundaan, atau kesalahan.
          </p>

          <h3>7. Perubahan Syarat</h3>
          <p>
            Kami berhak untuk mengubah syarat ini sewaktu-waktu. Perubahan akan berlaku efektif segera setelah diposting di halaman ini. Penggunaan berkelanjutan Anda atas layanan Cukupin berarti Anda menerima perubahan tersebut.
          </p>

          <h3>8. Kontak</h3>
          <p>
            Untuk pertanyaan mengenai syarat dan ketentuan ini, hubungi kami di <strong>legal@cukupin.app</strong>.
          </p>
        </div>
      </main>
    </div>
  )
}
