import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cukupin: Catat santai, tahu arah uangmu',
  description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
  applicationName: 'Cukupin',
  authors: [{ name: 'Cukupin' }],
  generator: 'v0.app',
  metadataBase: new URL('https://cukupin.app'),
  openGraph: {
    title: 'Cukupin: Catat santai, tahu arah uangmu',
    description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
    url: 'https://cukupin.app',
    siteName: 'Cukupin',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cukupin: Catat santai, tahu arah uangmu',
    description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cukupin',
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f7f4',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="bg-background">
      <body className="antialiased">
        {children}
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <CookieConsent />
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
