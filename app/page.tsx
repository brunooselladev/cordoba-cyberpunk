'use client'

import dynamic from 'next/dynamic'

const MapaCordoba = dynamic(() => import('@/components/mapa-cordoba'), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center bg-[#05070a] font-mono text-sm text-[#39ff88]">
      {'> Estableciendo conexión con la red...'}
    </div>
  ),
})

export default function Page() {
  return (
    <main>
      <MapaCordoba />
    </main>
  )
}
