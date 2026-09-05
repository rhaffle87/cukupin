import React from 'react'

export function JsonLd() {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Cukupin',
      alternateName: 'Cukupin App',
      url: 'https://cukupin.app',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'All',
      description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'IDR',
      },
      featureList: [
        'Pencatatan pemasukan dan pengeluaran harian',
        'Budget harian aman (daily safe spend)',
        'Pola pengeluaran 50/30/20',
        'Target tabungan terukur',
        'Wishlist prioritas anti-impulsif',
        'Laporan dan perbandingan bulanan',
        'Export PDF dan CSV format buku kas',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Apakah Cukupin benar-benar gratis?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ya, Cukupin 100% gratis digunakan tanpa biaya langganan, tanpa uji coba berbayar, dan tanpa fitur tersembunyi.',
          },
        },
        {
          '@type': 'Question',
          name: 'Apakah Cukupin meminta akses ke rekening bank saya?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Tidak sama sekali. Cukupin tidak meminta nomor rekening, PIN, atau kata sandi bank. Kamu mencatat pengeluaran secara mandiri demi keamanan dan privasi penuh.',
          },
        },
        {
          '@type': 'Question',
          name: 'Apa itu fitur Budget Harian Aman?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Budget Harian Aman membagi sisa saldomu dengan sisa hari dalam bulan berjalan secara otomatis, sehingga kamu langsung tahu batas uang yang aman dibelanjakan tiap hari.',
          },
        },
        {
          '@type': 'Question',
          name: 'Apakah Cukupin bisa digunakan di smartphone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bisa. Cukupin adalah Progressive Web App (PWA) yang bisa langsung di-install di HP Android maupun iPhone tanpa perlu download dari App Store yang berat.',
          },
        },
        {
          '@type': 'Question',
          name: 'Bagaimana keamanan data keuangan saya?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Semua data transaksi dan akunmu dienkripsi menggunakan standar keamanan cloud Supabase dengan aturan proteksi data ketat. Data tidak dijual ke pihak ketiga.',
          },
        },
        {
          '@type': 'Question',
          name: 'Bisakah saya mengekspor data pengeluaran?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bisa. Kamu bisa mengunduh riwayat transaksi dan format buku kas bulanan ke dalam format PDF siap cetak atau file CSV untuk dibuka di spreadsheet kapan saja.',
          },
        },
      ],
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
