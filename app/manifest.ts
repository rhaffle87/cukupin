import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cukupin: Catat santai, tahu arah uangmu',
    short_name: 'Cukupin',
    description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F6F0',
    theme_color: '#F7F6F0',
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
