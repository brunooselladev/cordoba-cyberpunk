'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

const MapaCordoba = dynamic(() => import('@/components/mapa-cordoba'), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center bg-[#05070a] font-mono text-sm text-[#39ff88]">
      {'> Estableciendo conexión con la red...'}
    </div>
  ),
})

export default function MapaCordobaPage() {
  return (
    <main className="relative h-dvh overflow-hidden bg-[#05070a]">
      <Link
        href="/"
        className="absolute left-3 top-3 z-[600] border border-[#39ff88]/50 bg-[#05070a]/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#39ff88] backdrop-blur-sm transition-colors hover:border-[#06e0ff] hover:text-[#06e0ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06e0ff] md:left-auto md:right-4 md:top-4"
      >
        {'<'} Volver al hub
      </Link>
      <MapaCordoba />
    </main>
  )
}
