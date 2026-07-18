import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
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
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2D1783',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fi" className={`${inter.variable} ${hankenGrotesk.variable} bg-background`}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="antialiased font-sans">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
