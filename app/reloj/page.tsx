'use client'

import dynamic from 'next/dynamic'

const RelojCuentaRegresiva = dynamic(
  () => import('@/components/reloj-cuenta-regresiva'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-dvh items-center justify-center bg-[#04070a] font-mono text-sm text-[#2ee6ff]">
        {'> INICIALIZANDO RELOJ TÁCTICO...'}
      </div>
    ),
  },
)

export default function RelojPage() {
  return (
    <main className="min-h-dvh bg-[#04070a]">
      <RelojCuentaRegresiva />
    </main>
  )
}
