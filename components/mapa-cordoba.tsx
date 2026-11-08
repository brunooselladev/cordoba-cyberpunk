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
   - zona:        "Zero" (submundo), "Central" (plataforma),
                  "Uno" (La Cúpula) o "Todas" (atraviesa los niveles)
   - descripcion: texto que aparece en el decodificador
   - colorIcono:  "magenta", "rojo", "naranja", "gris", "verde",
                  "cian", "amarillo" o "blanco"
   ===================================================================== */
const NODOS: Nodo[] = [
  // ---------- ZONA ZERO (Nivel Inferior / Bajo la plataforma) ----------
  {
    id: 1,
    nombre: 'Bar del Cariño',
    lat: -31.4245,
    lng: -64.15,
    zona: 'Zero',
    descripcion:
      'Taberna en el Viejo San Vicente, afuera de la sombra de la plataforma. Foco de apuestas, prostitución y mercado negro incipiente.',
    colorIcono: 'magenta',
  },
  {
    id: 2,
    nombre: 'Ex Archivo de la Memoria',
    lat: -31.4166,
    lng: -64.1834,
    zona: 'Zero',
    descripcion:
      'Base de Los Historiadores y La Nona. Pasaje Santa Catalina, sepultado bajo el hormigón de la Zona Central.',
    colorIcono: 'magenta',
  },
  {
    id: 4,
    nombre: 'Mercado Norte (Submundo)',
    lat: -31.4118,
    lng: -64.1818,
    zona: 'Zero',
    descripcion:
      'Territorio de Los Felinos y El Gambito. Laberinto de tecnología robada que respira debajo de la plataforma.',
    colorIcono: 'naranja',
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

  // ---------- ZONA CENTRAL (Mega-plataforma superior) ----------
  {
    id: 12,
    nombre: 'Mega-Shopping A-1',
    lat: -31.415,
    lng: -64.185,
    zona: 'Central',
    descripcion: 'Complejo comercial de élite sobre la plataforma.',
    colorIcono: 'cian',
  },
  {
    id: 7,
    nombre: 'Ascensor Vieja Terminal',
    lat: -31.4238,
    lng: -64.1755,
    zona: 'Central',
    descripcion:
      'Peaje y montacargas industrial masivo que conecta la plataforma con el submundo. Custodiado por el Gremio.',
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
      'Paredón corporativo con ascensores VIP que divide los sectores del Centro y Nueva Córdoba.',
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

/* ---------------------------------------------------------------------
   CALLES VIEJAS — solo visibles en el Submundo (Zona Zero)
   rotacion: grados (0 = horizontal, 90 = vertical)
   --------------------------------------------------------------------- */
const CALLES_VIEJAS: { nombre: string; lat: number; lng: number; rotacion: number }[] = [
  { nombre: 'Calle San Martín', lat: -31.4085, lng: -64.1832, rotacion: -82 },
  { nombre: 'La Cañada', lat: -31.4215, lng: -64.1915, rotacion: -62 },
  { nombre: 'Av. Colón', lat: -31.4112, lng: -64.1925, rotacion: -4 },
  { nombre: 'Bv. San Juan', lat: -31.4235, lng: -64.1935, rotacion: -8 },
  { nombre: 'Río Suquía', lat: -31.4045, lng: -64.1745, rotacion: 18 },
]

/* ===================== FIN DE LA ZONA EDITABLE ===================== */

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polygon, Polyline, TileLayer, useMap } from 'react-leaflet'

type Zona = 'Zero' | 'Central' | 'Uno' | 'Todas'
type Nivel = 'Central' | 'Zero'
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
  cian: '#06b6d4',
  amarillo: '#ffe62b',
  blanco: '#ffffff',
}

const CENTRO: [number, number] = [-31.4175, -64.183]

// CARTO Dark Matter requires a free key (carto.com/basemaps/apikey); without it we darken OSM tiles.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY

const PLATAFORMA = { norte: -31.4, sur: -31.435, oeste: -64.2, este: -64.17 }
const POLIGONO_PLATAFORMA: [number, number][] = [
  [PLATAFORMA.norte, PLATAFORMA.oeste],
  [PLATAFORMA.norte, PLATAFORMA.este],
  [PLATAFORMA.sur, PLATAFORMA.este],
  [PLATAFORMA.sur, PLATAFORMA.oeste],
]

const FILAS = ['A', 'B', 'C', 'D', 'E']
const COLUMNAS = 3

const NIVELES: Record<
  Nivel,
  { titulo: string; subtitulo: string; altitud: string; color: string; descripcion: string }
> = {
  Central: {
    titulo: 'Ver Plataformas Superiores',
    subtitulo: 'Zona Central',
    altitud: 'ALT +120m',
    color: COLORES.cian,
    descripcion: 'Mega-plataforma de hormigón. Grilla sectorial activa. Calles viejas: sepultadas.',
  },
  Zero: {
    titulo: 'Ver Submundo',
    subtitulo: 'Zona Zero',
    altitud: 'ALT -40m',
    color: COLORES.magenta,
    descripcion: 'Centro viejo hundido. La plataforma es ahora el techo. Señal degradada.',
  },
}

function construirGrilla() {
  const altoFila = (PLATAFORMA.norte - PLATAFORMA.sur) / FILAS.length
  const anchoCol = (PLATAFORMA.este - PLATAFORMA.oeste) / COLUMNAS

  const lineas: [number, number][][] = []
  for (let i = 1; i < FILAS.length; i++) {
    const lat = PLATAFORMA.norte - altoFila * i
    lineas.push([
      [lat, PLATAFORMA.oeste],
      [lat, PLATAFORMA.este],
    ])
  }
  for (let j = 1; j < COLUMNAS; j++) {
    const lng = PLATAFORMA.oeste + anchoCol * j
    lineas.push([
      [PLATAFORMA.norte, lng],
      [PLATAFORMA.sur, lng],
    ])
  }

  const sectores = FILAS.flatMap((fila, i) =>
    Array.from({ length: COLUMNAS }, (_, j) => ({
      nombre: `Sector ${fila}-${j + 1}`,
      lat: PLATAFORMA.norte - altoFila * (i + 0.12),
      lng: PLATAFORMA.oeste + anchoCol * (j + 0.06),
    })),
  )

  return { lineas, sectores }
}

const GRILLA = construirGrilla()

function crearIcono(color: string, seleccionado: boolean) {
  const size = seleccionado ? 26 : 18
  return L.divIcon({
    className: 'nodo-cyber',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="nodo-cyber__punto${seleccionado ? ' nodo-cyber__punto--activo' : ''}" style="--c:${color}"></span>`,
  })
}

function crearEtiquetaSector(nombre: string) {
  return L.divIcon({
    className: 'etiqueta-sector',
    iconSize: [0, 0],
    html: `<span>${nombre}</span>`,
  })
}

function crearEtiquetaCalle(nombre: string, rotacion: number) {
  return L.divIcon({
    className: 'etiqueta-calle',
    iconSize: [0, 0],
    html: `<span style="transform:translate(-50%,-50%) rotate(${rotacion}deg)">${nombre}</span>`,
  })
}

function VolarAlNodo({ nodo }: { nodo: Nodo | null }) {
  const map = useMap()
  useEffect(() => {
    if (nodo) map.flyTo([nodo.lat, nodo.lng], Math.max(map.getZoom(), 15), { duration: 0.8 })
  }, [nodo, map])
  return null
}

function CambioDeNivel({ nivel }: { nivel: Nivel }) {
  const map = useMap()
  useEffect(() => {
    const zoom = nivel === 'Zero' ? 15 : 14
    map.flyTo(map.getCenter(), zoom, { duration: 1.1 })
  }, [nivel, map])
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
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#06b6d4]/80">
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

function IndicadorNiveles({ nivel }: { nivel: Nivel }) {
  return (
    <div className="flex items-stretch gap-3" aria-hidden="true">
      <div className="flex w-3 flex-col gap-1">
        <div
          className="flex-1 border transition-all duration-500"
          style={{
            borderColor: COLORES.cian,
            backgroundColor: nivel === 'Central' ? COLORES.cian : 'transparent',
            boxShadow: nivel === 'Central' ? `0 0 10px ${COLORES.cian}` : 'none',
          }}
        />
        <div
          className="flex-1 border border-dashed transition-all duration-500"
          style={{
            borderColor: COLORES.magenta,
            backgroundColor: nivel === 'Zero' ? COLORES.magenta : 'transparent',
            boxShadow: nivel === 'Zero' ? `0 0 10px ${COLORES.magenta}` : 'none',
          }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-1 text-[10px] uppercase tracking-widest">
        <span style={{ color: nivel === 'Central' ? COLORES.cian : 'rgba(255,255,255,0.3)' }}>
          {'NIVEL +1 // Plataforma'}
        </span>
        <span className="text-white/20">{'──── losa de hormigón ────'}</span>
        <span style={{ color: nivel === 'Zero' ? COLORES.magenta : 'rgba(255,255,255,0.3)' }}>
          {'NIVEL 0 // Submundo'}
        </span>
      </div>
    </div>
  )
}

export default function MapaCordoba() {
  const [nivel, setNivel] = useState<Nivel>('Central')
  const [verCupula, setVerCupula] = useState(false)
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)

  const nodosVisibles = useMemo(
    () =>
      NODOS.filter(
        (n) => n.zona === 'Todas' || n.zona === nivel || (verCupula && n.zona === 'Uno'),
      ),
    [nivel, verCupula],
  )

  const seleccionado = nodosVisibles.find((n) => n.id === seleccionadoId) ?? null
  const enSubmundo = nivel === 'Zero'
  const infoNivel = NIVELES[nivel]

  const estiloPlataforma = enSubmundo
    ? {
        color: COLORES.magenta,
        weight: 2,
        opacity: 0.7,
        dashArray: '10 8',
        fillColor: '#000000',
        fillOpacity: 0.2,
      }
    : {
        color: COLORES.cian,
        weight: 6,
        opacity: 1,
        dashArray: undefined,
        fillColor: '#0f172a',
        fillOpacity: 0.9,
      }

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-[#05070a] font-mono text-[#39ff88]"
      data-nivel={nivel}
    >
      <MapContainer
        center={CENTRO}
        zoom={14}
        zoomControl={false}
        className="absolute inset-0 z-0 h-full w-full"
        aria-label="Mapa en capas de Córdoba Capital"
      >
        {CARTO_KEY ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
            className="tiles-base"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="tiles-base tiles-oscuros"
            maxZoom={19}
          />
        )}

        {!enSubmundo && (
          <Polygon
            positions={POLIGONO_PLATAFORMA}
            pathOptions={{ color: COLORES.cian, weight: 22, opacity: 0.18, fill: false }}
            interactive={false}
          />
        )}
        <Polygon
          positions={POLIGONO_PLATAFORMA}
          pathOptions={{ ...estiloPlataforma, className: 'plataforma' }}
          interactive={false}
        />

        {!enSubmundo &&
          GRILLA.lineas.map((linea, i) => (
            <Polyline
              key={`grilla-${i}`}
              positions={linea}
              pathOptions={{ color: COLORES.cian, weight: 1, opacity: 0.45 }}
              interactive={false}
            />
          ))}

        {!enSubmundo &&
          GRILLA.sectores.map((s) => (
            <Marker
              key={s.nombre}
              position={[s.lat, s.lng]}
              icon={crearEtiquetaSector(s.nombre)}
              interactive={false}
              keyboard={false}
            />
          ))}

        {enSubmundo &&
          CALLES_VIEJAS.map((c) => (
            <Marker
              key={c.nombre}
              position={[c.lat, c.lng]}
              icon={crearEtiquetaCalle(c.nombre, c.rotacion)}
              interactive={false}
              keyboard={false}
            />
          ))}

        {nodosVisibles.map((nodo) => (
          <Marker
            key={nodo.id}
            position={[nodo.lat, nodo.lng]}
            icon={crearIcono(COLORES[nodo.colorIcono], nodo.id === seleccionadoId)}
            title={nodo.nombre}
            alt={nodo.nombre}
            keyboard
            zIndexOffset={1000}
            eventHandlers={{ click: () => setSeleccionadoId(nodo.id) }}
          />
        ))}

        <CambioDeNivel nivel={nivel} />
        <VolarAlNodo nodo={seleccionado} />
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 z-[400] scanlines" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 z-[401] transition-opacity duration-700"
        style={{
          opacity: enSubmundo ? 1 : 0,
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(40,0,30,0.55) 80%, rgba(5,0,8,0.85) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        key={nivel}
        className="transicion-nivel pointer-events-none absolute inset-0 z-[402]"
        style={{ '--c': infoNivel.color } as React.CSSProperties}
        aria-hidden="true"
      />

      <aside className="absolute inset-x-3 bottom-3 z-[500] flex max-h-[55dvh] flex-col gap-4 overflow-y-auto border border-[#39ff88]/70 bg-[#05070a]/90 p-4 shadow-[0_0_24px_rgba(57,255,136,0.25)] backdrop-blur-sm md:inset-x-auto md:bottom-auto md:left-4 md:top-4 md:max-h-[calc(100dvh-2rem)] md:w-80">
        <header className="flex flex-col gap-1 border-b border-[#39ff88]/30 pb-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#06b6d4]">
            {'// NetRunner OS v2.077'}
          </p>
          <h1 className="text-lg font-bold uppercase tracking-wider text-[#39ff88] [text-shadow:0_0_10px_#39ff88]">
            Córdoba Capital
          </h1>
          <p className="text-[10px] text-[#39ff88]/60">
            {`${nodosVisibles.length} / ${NODOS.length} nodos en línea // ${infoNivel.altitud}`}
          </p>
        </header>

        <section aria-labelledby="titulo-niveles" className="flex flex-col gap-3">
          <h2 id="titulo-niveles" className="text-xs uppercase tracking-widest text-[#ff2bd6]">
            {'[ Selector de Nivel ]'}
          </h2>
          <div role="radiogroup" aria-labelledby="titulo-niveles" className="flex flex-col gap-2">
            {(Object.keys(NIVELES) as Nivel[]).map((clave) => {
              const n = NIVELES[clave]
              const activo = nivel === clave
              return (
                <button
                  key={clave}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setNivel(clave)}
                  className="flex flex-col items-start gap-0.5 border px-3 py-2 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06b6d4]"
                  style={{
                    borderColor: activo ? n.color : 'rgba(255,255,255,0.15)',
                    borderStyle: clave === 'Zero' ? 'dashed' : 'solid',
                    color: activo ? n.color : 'rgba(255,255,255,0.45)',
                    backgroundColor: activo ? `${n.color}1a` : 'transparent',
                    boxShadow: activo ? `0 0 12px ${n.color}55` : 'none',
                  }}
                >
                  <span className="text-[11px] font-bold">
                    {`${activo ? '■' : '□'} ${n.titulo}`}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest opacity-75">
                    {`(${n.subtitulo}) // ${n.altitud}`}
                  </span>
                </button>
              )
            })}
          </div>

          <IndicadorNiveles nivel={nivel} />

          <p className="text-[10px] leading-relaxed" style={{ color: `${infoNivel.color}cc` }}>
            {`> ${infoNivel.descripcion}`}
          </p>

          <button
            type="button"
            aria-pressed={verCupula}
            onClick={() => setVerCupula((v) => !v)}
            className="self-start border px-2 py-1 text-[10px] uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06b6d4]"
            style={{
              borderColor: verCupula ? COLORES.amarillo : 'rgba(255,255,255,0.15)',
              color: verCupula ? COLORES.amarillo : 'rgba(255,255,255,0.4)',
            }}
          >
            {`${verCupula ? '■' : '□'} Superponer Zona Uno (La Cúpula)`}
          </button>
        </section>

        <section
          aria-labelledby="titulo-decodificador"
          className="flex flex-col gap-2 border-t border-[#39ff88]/30 pt-3"
        >
          <h2 id="titulo-decodificador" className="text-xs uppercase tracking-widest text-[#06b6d4]">
            {'[ Decodificador de Datos ]'}
          </h2>
          <Decodificador key={seleccionado?.id ?? 'vacio'} nodo={seleccionado} />
        </section>
      </aside>

      <style>{`
        .leaflet-container { background: #05070a; font-family: inherit; }
        .leaflet-control-attribution { background: rgba(5,7,10,0.8) !important; color: #39ff8899 !important; font-size: 9px; }
        .leaflet-control-attribution a { color: #06b6d4 !important; }
        .tiles-base { transition: filter .8s ease; }
        .tiles-oscuros { filter: invert(1) hue-rotate(180deg) grayscale(0.85) brightness(0.75) contrast(1.15); }
        [data-nivel="Zero"] .tiles-oscuros { filter: invert(1) hue-rotate(250deg) grayscale(0.4) brightness(0.55) contrast(1.3) sepia(0.2); }
        [data-nivel="Zero"] .tiles-base:not(.tiles-oscuros) { filter: hue-rotate(60deg) brightness(0.7) saturate(1.6); }
        .plataforma {
          transition: fill-opacity .8s ease, stroke-width .6s ease, stroke .6s ease, fill .8s ease, stroke-opacity .6s ease;
        }
        [data-nivel="Central"] .plataforma { filter: drop-shadow(0 0 10px #06b6d4); }

        .etiqueta-sector, .etiqueta-calle { background: transparent; border: none; }
        .etiqueta-sector span {
          display: inline-block; white-space: nowrap;
          font-size: 10px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700;
          color: #06b6d4; text-shadow: 0 0 6px #06b6d4;
          border-left: 2px solid #06b6d4; padding-left: 4px; opacity: .85;
        }
        .etiqueta-calle span {
          position: absolute; display: inline-block; white-space: nowrap;
          font-size: 13px; font-weight: 700; letter-spacing: .25em; text-transform: uppercase;
          color: #ffd6f6; text-shadow: 0 0 3px #ff2bd6, 0 0 10px #ff2bd6;
          background: rgba(5,0,8,0.55); padding: 2px 6px;
        }

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

        .transicion-nivel { overflow: hidden; }
        .transicion-nivel::before {
          content: ''; position: absolute; inset: 0 0 auto 0; height: 30%;
          background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--c) 35%, transparent), transparent);
          transform: translateY(-100%); opacity: 1;
          animation: barrido 0.9s ease-out forwards;
        }
        @keyframes barrido {
          to { transform: translateY(340%); opacity: 0; }
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
          .transicion-nivel { display: none; }
        }
      `}</style>
    </div>
  )
}
