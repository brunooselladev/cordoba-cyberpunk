'use client'

/* =====================================================================
   NODOS DEL MAPA — EDITÁ ACÁ PARA AGREGAR O MODIFICAR LUGARES
   ---------------------------------------------------------------------
   Cada lugar es un bloque entre llaves { }. Para agregar uno nuevo,
   copiá un bloque entero, pegalo al final de la lista (antes del ]),
   y cambiá los datos. No te olvides la coma entre bloques.

   - id:          número único (no repetir)
   - nombre:      nombre que se muestra
   - lat / lng:   coordenadas (copialas de Google Maps: clic derecho)
   - zona:        "Zero", "Central", "Uno" o "Todas"
   - descripcion: texto que aparece en el decodificador
   - colorIcono:  "magenta", "rojo", "naranja", "gris", "verde",
                  "cian", "amarillo" o "blanco"
   ===================================================================== */
const NODOS: Nodo[] = [
  // ---------- ZONA ZERO (Nivel Inferior / La Baja Ciudad) ----------
  {
    id: 1,
    nombre: 'Bar del Cariño',
    lat: -31.4245,
    lng: -64.15,
    zona: 'Zero',
    descripcion:
      'Taberna en el Viejo San Vicente. Foco de apuestas, prostitución y mercado negro incipiente.',
    colorIcono: 'magenta',
  },
  {
    id: 2,
    nombre: 'Ex Archivo de la Memoria',
    lat: -31.4166,
    lng: -64.1834,
    zona: 'Zero',
    descripcion:
      'Base de Los Historiadores y La Nona. Pasaje Santa Catalina, sepultado en las sombras del Centro Viejo.',
    colorIcono: 'magenta',
  },
  {
    id: 3,
    nombre: 'Cuartel Policía Municipal',
    lat: -31.411,
    lng: -64.175,
    zona: 'Zero',
    descripcion: 'Ex Cochera Municipal junto al río. Base de operaciones del Sargento.',
    colorIcono: 'rojo',
  },
  {
    id: 4,
    nombre: 'Bazar del Mercado Norte',
    lat: -31.4118,
    lng: -64.1818,
    zona: 'Zero',
    descripcion:
      'Territorio de Los Felinos y El Gambito. Laberinto techado de tecnología robada y pasillos estrechos.',
    colorIcono: 'naranja',
  },
  {
    id: 5,
    nombre: 'Galpón del Río',
    lat: -31.4135,
    lng: -64.168,
    zona: 'Zero',
    descripcion: 'Piso franco abandonado en la vieja costanera tóxica.',
    colorIcono: 'gris',
  },
  {
    id: 6,
    nombre: 'Trincheras de La Cañada',
    lat: -31.4185,
    lng: -64.1885,
    zona: 'Zero',
    descripcion: 'Pasajes clandestinos de mantenimiento que conectan el submundo.',
    colorIcono: 'verde',
  },

  // ---------- ZONA CENTRAL (Nivel Superior / Intermedio) ----------
  {
    id: 7,
    nombre: 'Ascensor Vieja Terminal',
    lat: -31.4238,
    lng: -64.1755,
    zona: 'Central',
    descripcion: 'Peaje y montacargas industrial masivo fuertemente custodiado por el Gremio.',
    colorIcono: 'cian',
  },
  {
    id: 8,
    nombre: 'Tranvías del Suquía',
    lat: -31.405,
    lng: -64.18,
    zona: 'Central',
    descripcion: 'Plataformas de cables de alta tensión que cruzan hacia Alta Córdoba.',
    colorIcono: 'cian',
  },
  {
    id: 9,
    nombre: 'Muro Bulevar Illia',
    lat: -31.423,
    lng: -64.185,
    zona: 'Central',
    descripcion:
      'Paredón corporativo con ascensores VIP que divide el Centro de Nueva Córdoba.',
    colorIcono: 'cian',
  },

  // ---------- ZONA UNO (La Cúpula) & EL GREMIO ----------
  {
    id: 10,
    nombre: 'Casa de Gobierno',
    lat: -31.378,
    lng: -64.23,
    zona: 'Uno',
    descripcion:
      'Ubicada en el Noroeste (Cerro de las Rosas). Cúpula inalcanzable de los senadores-bots.',
    colorIcono: 'amarillo',
  },
  {
    id: 11,
    nombre: 'El Panal (Nivel Raíz)',
    lat: -31.4172,
    lng: -64.1765,
    zona: 'Todas',
    descripcion:
      'Estructura colosal de hormigón que atraviesa todos los niveles. En la Zona Zero, sus raíces energéticas están fortificadas y custodiadas por la Policía Ciudadana de élite del Gremio.',
    colorIcono: 'blanco',
  },
]

/* ===================== FIN DE LA ZONA EDITABLE ===================== */

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'

type Zona = 'Zero' | 'Central' | 'Uno' | 'Todas'
type ZonaFiltrable = Exclude<Zona, 'Todas'>
type ColorIcono = keyof typeof COLORES

type Nodo = {
  id: number
  nombre: string
  lat: number
  lng: number
  zona: Zona
  descripcion: string
  colorIcono: ColorIcono
}

const COLORES = {
  magenta: '#ff2bd6',
  rojo: '#ff3b3b',
  naranja: '#ff9a1f',
  gris: '#9aa3ad',
  verde: '#39ff88',
  cian: '#22e6ff',
  amarillo: '#ffe62b',
  blanco: '#ffffff',
}

const CENTRO: [number, number] = [-31.4201, -64.1888]

// CARTO Dark Matter requires a free key (carto.com/basemaps/apikey); without it we darken OSM tiles.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY

const ZONAS: { clave: ZonaFiltrable; etiqueta: string; subtitulo: string; color: string }[] = [
  { clave: 'Zero', etiqueta: 'ZONA ZERO', subtitulo: 'Baja Ciudad', color: COLORES.magenta },
  { clave: 'Central', etiqueta: 'ZONA CENTRAL', subtitulo: 'Nivel Intermedio', color: COLORES.cian },
  { clave: 'Uno', etiqueta: 'ZONA UNO', subtitulo: 'La Cúpula', color: COLORES.amarillo },
]

function crearIcono(color: string, seleccionado: boolean) {
  const size = seleccionado ? 26 : 18
  return L.divIcon({
    className: 'nodo-cyber',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="nodo-cyber__punto${seleccionado ? ' nodo-cyber__punto--activo' : ''}" style="--c:${color}"></span>`,
  })
}

function VolarAlNodo({ nodo }: { nodo: Nodo | null }) {
  const map = useMap()
  useEffect(() => {
    if (nodo) map.flyTo([nodo.lat, nodo.lng], Math.max(map.getZoom(), 15), { duration: 0.8 })
  }, [nodo, map])
  return null
}

const GLIFOS = '01<>/\\[]{}#$%&*+=?ABCDEF'

function TextoDecodificado({ texto, demora = 0 }: { texto: string; demora?: number }) {
  const [salida, setSalida] = useState('')

  useEffect(() => {
    let frame = 0
    const total = 24
    let intervalo: ReturnType<typeof setInterval> | undefined
    const inicio = setTimeout(() => {
      intervalo = setInterval(() => {
        frame++
        const revelados = Math.floor((frame / total) * texto.length)
        setSalida(
          texto
            .split('')
            .map((ch, i) =>
              i < revelados || ch === ' ' ? ch : GLIFOS[Math.floor(Math.random() * GLIFOS.length)],
            )
            .join(''),
        )
        if (frame >= total) {
          setSalida(texto)
          clearInterval(intervalo)
        }
      }, 30)
    }, demora)
    return () => {
      clearTimeout(inicio)
      if (intervalo) clearInterval(intervalo)
    }
  }, [texto, demora])

  return <>{salida}</>
}

function Decodificador({ nodo }: { nodo: Nodo | null }) {
  const [decodificando, setDecodificando] = useState(false)

  useEffect(() => {
    if (!nodo) return
    setDecodificando(true)
    const t = setTimeout(() => setDecodificando(false), 900)
    return () => clearTimeout(t)
  }, [nodo])

  if (!nodo) {
    return (
      <p className="text-xs leading-relaxed text-[#39ff88]/60">
        {'> Esperando señal...'}
        <br />
        {'> Seleccioná un nodo en el mapa para interceptar sus datos.'}
        <span className="cursor-parpadeo ml-1 inline-block h-3 w-2 translate-y-0.5 bg-[#39ff88]" />
      </p>
    )
  }

  const color = COLORES[nodo.colorIcono]

  return (
    <div aria-live="polite">
      {decodificando ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#ff2bd6]">
            {'> Decodificando información...'}
            <span className="cursor-parpadeo ml-1 inline-block h-3 w-2 translate-y-0.5 bg-[#ff2bd6]" />
          </p>
          <div className="h-1.5 w-full overflow-hidden border border-[#ff2bd6]/40">
            <div className="barra-carga h-full bg-[#ff2bd6]" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#22e6ff]/70">
            <span>{`NODO #${String(nodo.id).padStart(3, '0')}`}</span>
            <span>{`ZONA: ${nodo.zona.toUpperCase()}`}</span>
          </div>
          <h3
            className="text-base font-bold uppercase leading-tight"
            style={{ color, textShadow: `0 0 8px ${color}` }}
          >
            <TextoDecodificado texto={nodo.nombre} />
          </h3>
          <p className="text-xs leading-relaxed text-[#d8ffe9]">
            <TextoDecodificado texto={nodo.descripcion} demora={250} />
          </p>
          <p className="text-[10px] text-[#39ff88]/50">
            {`LAT ${nodo.lat.toFixed(4)} // LNG ${nodo.lng.toFixed(4)}`}
          </p>
        </div>
      )}
    </div>
  )
}

export default function MapaCordoba() {
  const [zonasActivas, setZonasActivas] = useState<Set<ZonaFiltrable>>(
    () => new Set(['Zero', 'Central', 'Uno']),
  )
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)

  const todasActivas = zonasActivas.size === ZONAS.length

  const nodosVisibles = useMemo(
    () =>
      NODOS.filter((n) => (n.zona === 'Todas' ? zonasActivas.size > 0 : zonasActivas.has(n.zona))),
    [zonasActivas],
  )

  const seleccionado = nodosVisibles.find((n) => n.id === seleccionadoId) ?? null

  function alternarZona(zona: ZonaFiltrable) {
    setZonasActivas((prev) => {
      const next = new Set(prev)
      if (next.has(zona)) next.delete(zona)
      else next.add(zona)
      return next
    })
  }

  function alternarTodas() {
    setZonasActivas(todasActivas ? new Set() : new Set(ZONAS.map((z) => z.clave)))
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#05070a] font-mono text-[#39ff88]">
      <MapContainer
        center={CENTRO}
        zoom={14}
        zoomControl={false}
        className="absolute inset-0 z-0 h-full w-full"
        aria-label="Mapa de Córdoba Capital"
      >
        {CARTO_KEY ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="tiles-oscuros"
            maxZoom={19}
          />
        )}
        {nodosVisibles.map((nodo) => (
          <Marker
            key={nodo.id}
            position={[nodo.lat, nodo.lng]}
            icon={crearIcono(COLORES[nodo.colorIcono], nodo.id === seleccionadoId)}
            title={nodo.nombre}
            alt={nodo.nombre}
            keyboard
            eventHandlers={{ click: () => setSeleccionadoId(nodo.id) }}
          />
        ))}
        <VolarAlNodo nodo={seleccionado} />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] scanlines" aria-hidden="true" />

      <aside className="absolute inset-x-3 bottom-3 z-[500] flex max-h-[55dvh] flex-col gap-4 overflow-y-auto border border-[#39ff88]/70 bg-[#05070a]/90 p-4 shadow-[0_0_24px_rgba(57,255,136,0.25)] backdrop-blur-sm md:inset-x-auto md:bottom-auto md:left-4 md:top-4 md:max-h-[calc(100dvh-2rem)] md:w-80">
        <header className="flex flex-col gap-1 border-b border-[#39ff88]/30 pb-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#22e6ff]">
            {'// NetRunner OS v2.077'}
          </p>
          <h1 className="text-lg font-bold uppercase tracking-wider text-[#39ff88] [text-shadow:0_0_10px_#39ff88]">
            Córdoba Capital
          </h1>
          <p className="text-[10px] text-[#39ff88]/60">
            {`${nodosVisibles.length} / ${NODOS.length} nodos en línea`}
          </p>
        </header>

        <section aria-labelledby="titulo-filtros" className="flex flex-col gap-2">
          <h2 id="titulo-filtros" className="text-xs uppercase tracking-widest text-[#ff2bd6]">
            {'[ Filtros ]'}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {ZONAS.map((z) => {
              const activa = zonasActivas.has(z.clave)
              return (
                <button
                  key={z.clave}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => alternarZona(z.clave)}
                  className="flex flex-col items-start border px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22e6ff]"
                  style={{
                    borderColor: activa ? z.color : 'rgba(255,255,255,0.15)',
                    color: activa ? z.color : 'rgba(255,255,255,0.4)',
                    backgroundColor: activa ? `${z.color}1a` : 'transparent',
                    boxShadow: activa ? `0 0 10px ${z.color}55` : 'none',
                  }}
                >
                  <span className="text-[11px] font-bold">{`${activa ? '■' : '□'} ${z.etiqueta}`}</span>
                  <span className="text-[9px] opacity-70">{z.subtitulo}</span>
                </button>
              )
            })}
            <button
              type="button"
              aria-pressed={todasActivas}
              onClick={alternarTodas}
              className="flex flex-col items-start border px-2 py-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22e6ff]"
              style={{
                borderColor: todasActivas ? '#39ff88' : 'rgba(255,255,255,0.15)',
                color: todasActivas ? '#39ff88' : 'rgba(255,255,255,0.4)',
                backgroundColor: todasActivas ? '#39ff881a' : 'transparent',
                boxShadow: todasActivas ? '0 0 10px #39ff8855' : 'none',
              }}
            >
              <span className="text-[11px] font-bold">{`${todasActivas ? '■' : '□'} TODAS`}</span>
              <span className="text-[9px] opacity-70">Red completa</span>
            </button>
          </div>
        </section>

        <section
          aria-labelledby="titulo-decodificador"
          className="flex flex-col gap-2 border-t border-[#39ff88]/30 pt-3"
        >
          <h2 id="titulo-decodificador" className="text-xs uppercase tracking-widest text-[#22e6ff]">
            {'[ Decodificador de Datos ]'}
          </h2>
          <Decodificador key={seleccionado?.id ?? 'vacio'} nodo={seleccionado} />
        </section>
      </aside>

      <style>{`
        .leaflet-container { background: #05070a; font-family: inherit; }
        .leaflet-control-attribution { background: rgba(5,7,10,0.8) !important; color: #39ff8899 !important; font-size: 9px; }
        .leaflet-control-attribution a { color: #22e6ff !important; }
        .tiles-oscuros { filter: invert(1) hue-rotate(180deg) grayscale(0.85) brightness(0.75) contrast(1.15); }
        .nodo-cyber { background: transparent; border: none; }
        .nodo-cyber__punto {
          display: block; width: 100%; height: 100%; border-radius: 9999px;
          background: var(--c); border: 2px solid #05070a;
          box-shadow: 0 0 0 1px var(--c), 0 0 12px var(--c), 0 0 24px var(--c);
          cursor: pointer; transition: transform .15s;
        }
        .nodo-cyber:hover .nodo-cyber__punto { transform: scale(1.25); }
        .nodo-cyber__punto--activo { animation: pulso 1.4s ease-in-out infinite; }
        @keyframes pulso {
          0%,100% { box-shadow: 0 0 0 1px var(--c), 0 0 12px var(--c), 0 0 24px var(--c); }
          50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--c) 30%, transparent), 0 0 20px var(--c), 0 0 40px var(--c); }
        }
        .scanlines {
          background: repeating-linear-gradient(to bottom, rgba(57,255,136,0.04) 0px, rgba(57,255,136,0.04) 1px, transparent 1px, transparent 3px);
        }
        .cursor-parpadeo { animation: parpadeo 1s steps(1) infinite; }
        @keyframes parpadeo { 50% { opacity: 0; } }
        .barra-carga { animation: carga .9s ease-out forwards; width: 0; }
        @keyframes carga { to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) {
          .nodo-cyber__punto--activo, .cursor-parpadeo { animation: none; }
        }
      `}</style>
    </div>
  )
}
