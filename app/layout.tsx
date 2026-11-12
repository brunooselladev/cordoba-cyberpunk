import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Chakra_Petch } from 'next/font/google'
import './globals.css'

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chakra',
})

export const metadata: Metadata = {
  title: 'Córdoba Cyberpunk // Campaña XD',
  description: 'Hub de mapas para la campaña de rol Córdoba Cyberpunk.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#05070a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${chakraPetch.variable} bg-[#05070a]`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
