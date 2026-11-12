import Link from 'next/link'

const RUTAS = [
  {
    href: '/mapa-cordoba',
    codigo: '01',
    titulo: 'Mapa de Córdoba',
    detalle: 'Capas, nodos y decodificador de la red urbana.',
  },
  {
    href: '/mapa-conexiones',
    codigo: '02',
    titulo: 'Mapa de conexiones',
    detalle: 'Diagrama de vínculos entre facciones y personajes.',
  },
  {
    href: '/reloj',
    codigo: '03',
    titulo: 'Reloj cuenta regresiva',
    detalle: 'Temporizador de sesión con conversión tiempo real ↔ ficticio.',
  },
] as const

export default function HomePage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#05070a] text-[#39ff88]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(57,255,136,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,224,255,0.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,224,255,0.12),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,43,214,0.1),transparent_45%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 md:px-10">
        <p className="font-[family-name:var(--font-chakra)] text-[11px] uppercase tracking-[0.35em] text-[#06e0ff]">
          Campaña XD // NetRunner
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-chakra)] text-4xl font-semibold uppercase leading-none tracking-wide text-[#39ff88] [text-shadow:0_0_18px_rgba(57,255,136,0.45)] md:text-6xl">
          Córdoba
          <span className="block text-[#ff2bd6] [text-shadow:0_0_18px_rgba(255,43,214,0.4)]">
            Cyberpunk
          </span>
        </h1>
        <p className="mt-5 max-w-md font-mono text-sm leading-relaxed text-[#39ff88]/70">
          Seleccioná un mapa para entrar a la red.
        </p>

        <nav aria-label="Mapas disponibles" className="mt-12 flex flex-col gap-3">
          {RUTAS.map((ruta) => (
            <Link
              key={ruta.href}
              href={ruta.href}
              className="group flex items-stretch gap-4 border border-[#39ff88]/35 bg-[#05070a]/80 px-4 py-4 transition-colors duration-300 hover:border-[#06e0ff] hover:bg-[#06e0ff]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06e0ff]"
            >
              <span className="font-[family-name:var(--font-chakra)] text-sm text-[#06e0ff]/80">
                {ruta.codigo}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-[family-name:var(--font-chakra)] text-lg font-semibold uppercase tracking-wide text-[#39ff88] transition-colors group-hover:text-[#06e0ff]">
                  {ruta.titulo}
                </span>
                <span className="font-mono text-xs text-[#39ff88]/55">{ruta.detalle}</span>
              </span>
              <span
                aria-hidden
                className="self-center font-mono text-[#ff2bd6] transition-transform duration-300 group-hover:translate-x-1"
              >
                {'>>'}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}
