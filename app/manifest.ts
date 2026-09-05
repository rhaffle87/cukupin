import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'cukupin: Catat santai, tahu arah uangmu',
    short_name: 'cukupin',
    description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7f4',
    theme_color: '#f5f7f4',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
