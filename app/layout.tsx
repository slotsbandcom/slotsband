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
  title: 'SlotsBand – Parhaat Nettikasinot Suomessa 2026',
  description: 'SlotsBand on Suomen kattavin opas nettikasinoihin ja bonuksiin. Löydä parhaat kasinot, eksklusiiviset bonukset ja verovapaat voitot.',
  generator: 'v0.app',
  keywords: ['nettikasinot', 'kasino', 'bonus', 'ilmaiskierrokset', 'pikakasino', 'verovapaa kasino'],
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'SlotsBand – Parhaat Nettikasinot Suomessa 2026',
    description: 'Eksklusiiviset bonukset, verovapaat voitot ja nopeimmat kotiutukset. Testattuja kasinoita ammattilaisilta.',
    type: 'website',
    locale: 'fi_FI',
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
