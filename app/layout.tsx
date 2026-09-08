import { AnalyticsConsent } from '@/components/analytics/AnalyticsConsent'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces, Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { RegisterServiceWorker } from '@/components/pwa/RegisterServiceWorker'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-numeric',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Cukupin™: Catat santai, tahu arah uangmu',
  description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
  applicationName: 'Cukupin™',
  authors: [{ name: 'Cukupin™' }],
  generator: 'Cukupin™',
  metadataBase: new URL('https://cukupin.app'),
  keywords: [
    'aplikasi keuangan',
    'catat pengeluaran',
    'buku kas',
    'budgeting',
    'aturan 50 30 20',
    'keuangan pribadi',
    'quiet ledger',
    'cukupin',
    'pwa finance',
  ],
  alternates: {
    canonical: 'https://cukupin.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Cukupin™: Catat santai, tahu arah uangmu',
    description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
    url: 'https://cukupin.app',
    siteName: 'Cukupin™',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cukupin™: Catat santai, tahu arah uangmu',
    description: 'Catat pengeluaran harian, pantau uang masuk-keluar, dan atur keuangan dengan santai.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cukupin™',
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
  themeColor: '#F7F6F0',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} bg-paper text-ink font-sans`}>
      <body className="font-sans antialiased bg-paper text-ink">
        {children}
        <Toaster position="top-center" />
        <AnalyticsConsent />
        <CookieConsent />
        <RegisterServiceWorker />
      </body>
    </html>
  )
}
