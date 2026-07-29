import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Hanken_Grotesk } from 'next/font/google'
import { SWRProvider } from '@/components/swr-provider'
import { MaterialSymbolsLoader } from '@/components/material-symbols-loader'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'optional',
  adjustFontFallback: true,
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'optional',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://slotsband.com'),
  title: {
    default: 'SlotsBand – Parhaat Nettikasinot Suomessa 2026',
    template: '%s | SlotsBand',
  },
  description: 'SlotsBand on Suomen kattavin opas nettikasinoihin ja bonuksiin. Löydä parhaat kasinot, eksklusiiviset bonukset ja verovapaat voitot.',
  keywords: ['nettikasinot', 'kasino', 'bonus', 'ilmaiskierrokset', 'pikakasino', 'verovapaa kasino', 'suomalaiset kasinot 2026'],
  authors: [{ name: 'SlotsBand', url: 'https://slotsband.com' }],
  creator: 'SlotsBand',
  publisher: 'SlotsBand',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: {
    canonical: 'https://slotsband.com/fi',
    languages: {
      'fi': 'https://slotsband.com/fi',
      'en': 'https://slotsband.com/en',
      'en-GB': 'https://slotsband.com/uk',
    },
  },
  openGraph: {
    title: 'SlotsBand – Parhaat Nettikasinot Suomessa 2026',
    description: 'Eksklusiiviset bonukset, verovapaat voitot ja nopeimmat kotiutukset. Testattuja kasinoita ammattilaisilta.',
    type: 'website',
    locale: 'fi_FI',
    alternateLocale: ['en_GB', 'en_US'],
    siteName: 'SlotsBand',
    url: 'https://slotsband.com/fi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlotsBand – Parhaat Nettikasinot Suomessa 2026',
    description: 'Eksklusiiviset bonukset, verovapaat voitot ja nopeimmat kotiutukset.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/apple-icon-precomposed.png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#2D1783',
    'msapplication-TileImage': '/ms-icon-144x144.png',
    'msapplication-config': '/browserconfig.xml',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2D1783',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fi" className={`${inter.variable} ${hankenGrotesk.variable} bg-background`}>
      <head>
        {/* Preconnect for Material Symbols (loaded async below) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">
        <SWRProvider>
          {children}
        </SWRProvider>
        <MaterialSymbolsLoader />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
