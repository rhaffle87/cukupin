import React from 'react'
import { Brand } from '@/components/ui/Brand'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Kebijakan Privasi - Cukupin',
  description: 'Kebijakan Privasi Cukupin menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
}

export default function PrivacyPolicy() {
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
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Kebijakan Privasi</h1>
          <p className="mt-4 text-sm text-muted">Pembaruan Terakhir: 5 September 2026</p>
        </div>
        
        <div className="prose prose-ink max-w-none font-sans prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue prose-a:font-bold prose-a:no-underline hover:prose-a:underline">
          <p>
            Di Cukupin, kami sangat menghargai privasi Anda. Kebijakan ini menjelaskan dengan transparan bagaimana kami menangani informasi pribadi Anda saat Anda menggunakan aplikasi dan situs web Cukupin.
          </p>

          <h3>1. Informasi yang Kami Kumpulkan</h3>
          <p>
            Untuk memberikan layanan terbaik, kami mengumpulkan beberapa informasi:
          </p>
          <ul>
            <li><strong>Informasi Akun:</strong> Saat Anda mendaftar, kami menyimpan email Anda (melalui Supabase) untuk keperluan autentikasi.</li>
            <li><strong>Data Keuangan:</strong> Transaksi, kategori, dan target tabungan yang Anda masukkan akan disimpan dengan aman di database kami agar Anda dapat mengaksesnya di berbagai perangkat.</li>
            <li><strong>Data Analitik:</strong> Kami menggunakan cookie analitik anonim untuk memahami bagaimana aplikasi digunakan (misalnya, fitur apa yang paling sering dipakai) agar kami dapat memperbaikinya.</li>
          </ul>

          <h3>2. Penggunaan Informasi</h3>
          <p>
            Kami menggunakan informasi Anda semata-mata untuk:
          </p>
          <ul>
            <li>Menyediakan fitur inti Cukupin (pencatatan dan analisis keuangan).</li>
            <li>Meningkatkan pengalaman pengguna (UX) dan memperbaiki bug.</li>
            <li>Melindungi keamanan akun Anda.</li>
          </ul>
          <p>
            <strong>Kami tidak pernah menjual data keuangan Anda kepada pihak ketiga.</strong> Data Anda adalah milik Anda.
          </p>

          <h3>3. Keamanan Data</h3>
          <p>
            Seluruh data dikirim menggunakan enkripsi yang kuat (HTTPS/TLS) dan disimpan di infrastruktur yang aman. Kami menggunakan Supabase yang mengikuti standar keamanan industri yang ketat.
          </p>

          <h3>4. Cookie dan Pelacakan</h3>
          <p>
            Kami menggunakan cookie esensial untuk menjaga Anda tetap masuk (login), dan cookie analitik (opsional) untuk membantu kami melihat pola penggunaan aplikasi secara keseluruhan, bukan melacak Anda secara individu. Anda dapat mengatur preferensi ini melalui banner persetujuan kami.
          </p>

          <h3>5. Hak Anda</h3>
          <p>
            Anda memiliki hak penuh untuk:
          </p>
          <ul>
            <li>Mengakses semua data Anda di dalam aplikasi.</li>
            <li>Mengubah atau memperbarui informasi yang salah.</li>
            <li>Menghapus akun beserta seluruh data terkait secara permanen.</li>
          </ul>

          <h3>6. Hubungi Kami</h3>
          <p>
            Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin mengajukan penghapusan data, silakan hubungi kami di <strong>privasi@cukupin.app</strong>.
          </p>
        </div>
      </main>
    </div>
  )
}
