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
   - zona:        "Zero" (submundo), "Central" (plataformas),
                  "Uno" (La Cúpula) o "Todas" (atraviesa los niveles)
   - descripcion: texto que aparece en el decodificador
   - colorIcono:  "magenta", "rojo", "naranja", "gris", "verde",
                  "cian", "amarillo", "blanco" u "oxido"
   - chico:       (opcional) true para un marcador pequeño
   ===================================================================== */
const NODOS: Nodo[] = [
  // ---------- ZONA ZERO (Submundo / Bajo las plataformas) ----------
  {
    id: 1,
    nombre: 'Bar del Cariño',
    lat: -31.4245,
    lng: -64.15,
    zona: 'Zero',
    descripcion:
      'Taberna en el Viejo San Vicente, afuera de la sombra de las plataformas. Foco de apuestas, prostitución y mercado negro incipiente.',
    colorIcono: 'magenta',
  },
  {
    id: 2,
    nombre: 'Ex Archivo de la Memoria',
    lat: -31.4166,
    lng: -64.1834,
    zona: 'Zero',
    descripcion:
      'Base de Los Historiadores y La Nona. Apretado entre la Gran Falla de La Cañada y los muros del Búnker del Gremio.',
    colorIcono: 'magenta',
  },
  {
    id: 4,
    nombre: 'Mercado Norte (Submundo)',
    lat: -31.4118,
    lng: -64.1818,
    zona: 'Zero',
    descripcion:
      'Territorio de Los Felinos y El Gambito. Laberinto de tecnología robada que respira debajo de las plataformas.',
    colorIcono: 'naranja',
  },
  {
    id: 3,
    nombre: 'Cuartel Policía Municipal',
    lat: -31.411,
    lng: -64.172,
    zona: 'Zero',
    descripcion: 'Ex Cochera Municipal junto al río. Base de operaciones del Sargento.',
    colorIcono: 'rojo',
  },
  {
    id: 5,
    nombre: 'Galpón del Río',
    lat: -31.4065,
    lng: -64.165,
    zona: 'Zero',
    descripcion: 'Piso franco abandonado en la vieja costanera tóxica.',
    colorIcono: 'gris',
  },
  {
    id: 13,
    nombre: 'Boca de Alcantarilla C-4',
    lat: -31.4248,
    lng: -64.1948,
    zona: 'Zero',
    descripcion:
      'Entrada oxidada al colector pluvial. El agua que baja de las plataformas cae acá como lluvia ácida perpetua.',
    colorIcono: 'oxido',
  },
  {
    id: 14,
    nombre: 'Pasaje Derrumbado',
    lat: -31.4085,
    lng: -64.1845,
    zona: 'Zero',
    descripcion:
      'Túnel colapsado cuando bajaron los pilotes de la Placa Centro. Solo pasan los que conocen las grietas.',
    colorIcono: 'oxido',
  },
  {
    id: 15,
    nombre: 'Asentamiento en la grieta',
    lat: -31.4305,
    lng: -64.1895,
    zona: 'Zero',
    descripcion:
      'Casillas colgadas de las paredes de la falla. Viven de lo que cae de arriba y de lo que sube de abajo.',
    colorIcono: 'verde',
  },
  {
    id: 16,
    nombre: 'Búnker Raíz del Gremio - Acceso Restringido',
    lat: -31.4186,
    lng: -64.1765,
    zona: 'Zero',
    descripcion:
      'Muros de hormigón armado alrededor de las raíces de El Panal. Militarizado por el Gremio. Tirar a matar sin aviso previo.',
    colorIcono: 'rojo',
  },

  // ---------- ZONA CENTRAL (Mega-plataformas superiores) ----------
  {
    id: 12,
    nombre: 'Mega-Shopping A-1',
    lat: -31.4065,
    lng: -64.1885,
    zona: 'Central',
    descripcion: 'Complejo comercial de élite sobre la Placa Centro.',
    colorIcono: 'cian',
  },
  {
    id: 7,
    nombre: 'Ascensor Vieja Terminal',
    lat: -31.4258,
    lng: -64.1755,
    zona: 'Central',
    descripcion:
      'Peaje y montacargas industrial masivo que conecta las plataformas con el submundo. Custodiado por el Gremio.',
    colorIcono: 'cian',
  },
  {
    id: 9,
    nombre: 'Muro Bulevar Illia',
    lat: -31.4275,
    lng: -64.1885,
    zona: 'Central',
    descripcion:
      'Paredón corporativo con ascensores VIP en el borde de la Placa Nueva Córdoba.',
    colorIcono: 'cian',
  },
  {
    id: 20,
    nombre: 'Estación de Tranvía Flotante',
    lat: -31.4125,
    lng: -64.183,
    zona: 'Central',
    descripcion: 'Nodo T-1. Cruce de las líneas Magenta Norte y Magenta Sur sobre la Placa Centro.',
    colorIcono: 'magenta',
    chico: true,
  },
  {
    id: 21,
    nombre: 'Estación de Tranvía Flotante',
    lat: -31.4205,
    lng: -64.1869,
    zona: 'Central',
    descripcion: 'Nodo T-2. Trasbordo con la línea transversal hacia la Placa Alberdi.',
    colorIcono: 'magenta',
    chico: true,
  },
  {
    id: 22,
    nombre: 'Estación de Tranvía Flotante',
    lat: -31.4205,
    lng: -64.1763,
    zona: 'Central',
    descripcion: 'Nodo T-3. Suspendida sobre la copa de El Panal. Control biométrico obligatorio.',
    colorIcono: 'magenta',
    chico: true,
  },

  // ---------- ZONA UNO (La Cúpula) ----------
  {
    id: 10,
    nombre: 'Casa de Gobierno (Sede de los Bots)',
    lat: -31.3765,
    lng: -64.2365,
    zona: 'Uno',
    descripcion:
      'Cerro de las Rosas / Valle Escondido. Cúpula inalcanzable de los senadores-bots. Última parada del Tren Circunvalar.',
    colorIcono: 'amarillo',
  },

  // ---------- ATRAVIESA TODOS LOS NIVELES ----------
  {
    id: 11,
    nombre: 'El Panal (Nivel Raíz)',
    lat: -31.4172,
    lng: -64.1765,
    zona: 'Todas',
    descripcion:
      'Estructura colosal de hormigón que atraviesa todos los niveles. En la Zona Zero, sus raíces están fortificadas por el Gremio.',
    colorIcono: 'blanco',
  },
]

/* ---------------------------------------------------------------------
   CALLES VIEJAS — solo visibles en el Submundo (Zona Zero)
   rotacion: grados (0 = horizontal, 90 = vertical)
   --------------------------------------------------------------------- */
const CALLES_VIEJAS: { nombre: string; lat: number; lng: number; rotacion: number }[] = [
  { nombre: 'Calle San Martín', lat: -31.4045, lng: -64.1818, rotacion: -82 },
  { nombre: 'La Gran Falla', lat: -31.4365, lng: -64.1985, rotacion: -64 },
  { nombre: 'Av. Colón', lat: -31.4108, lng: -64.205, rotacion: -4 },
  { nombre: 'Río Suquía', lat: -31.4015, lng: -64.168, rotacion: 18 },
]

/* ===================== FIN DE LA ZONA EDITABLE ===================== */

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import {
  Circle,
  MapContainer,
  Marker,
  Pane,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet'

type Zona = 'Zero' | 'Central' | 'Uno' | 'Todas'
type Capa = Exclude<Zona, 'Todas'>
type ColorIcono = keyof typeof COLORES
type LatLng = [number, number]

type Nodo = {
  id: number
  nombre: string
  lat: number
  lng: number
  zona: Zona
  descripcion: string
  colorIcono: ColorIcono
  chico?: boolean
}

const COLORES = {
  magenta: '#ff2bd6',
  rojo: '#ff1a1a',
  naranja: '#ff9a1f',
  gris: '#9aa3ad',
  verde: '#7cff2b',
  cian: '#06e0ff',
  amarillo: '#ffe62b',
  blanco: '#ffffff',
  oxido: '#c2571a',
}

const CENTRO: LatLng = [-31.412, -64.19]

// CARTO Dark Matter requires a free key (carto.com/basemaps/apikey); without it we darken OSM tiles.
const CARTO_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY

/* ---------- Geometría: Mega-plataformas irregulares ---------- */
const PLATAFORMAS: { nombre: string; etiqueta: LatLng; forma: LatLng[] }[] = [
  {
    nombre: 'Placa Centro',
    etiqueta: [-31.4022, -64.1835],
    forma: [
      [-31.4005, -64.1935],
      [-31.3985, -64.1775],
      [-31.4058, -64.1668],
      [-31.4168, -64.1702],
      [-31.4192, -64.1818],
      [-31.4128, -64.1962],
    ],
  },
  {
    nombre: 'Placa Nueva Córdoba',
    etiqueta: [-31.4335, -64.1925],
    forma: [
      [-31.4178, -64.1938],
      [-31.4192, -64.1728],
      [-31.4322, -64.1772],
      [-31.4378, -64.1898],
      [-31.4298, -64.2005],
    ],
  },
  {
    nombre: 'Placa Alberdi',
    etiqueta: [-31.4055, -64.2125],
    forma: [
      [-31.4032, -64.2172],
      [-31.4045, -64.1975],
      [-31.4148, -64.1908],
      [-31.4212, -64.2018],
      [-31.4158, -64.2185],
    ],
  },
  {
    nombre: 'Esquirla 7',
    etiqueta: [-31.4148, -64.1758],
    forma: [
      [-31.4092, -64.1868],
      [-31.4118, -64.1752],
      [-31.4245, -64.1788],
      [-31.4218, -64.1912],
    ],
  },
]

/* ---------- Geometría: La Cañada / La Gran Falla ---------- */
const FALLA_EJE: LatLng[] = [
  [-31.4415, -64.1975],
  [-31.4352, -64.1948],
  [-31.4298, -64.1922],
  [-31.4248, -64.1908],
  [-31.4202, -64.1885],
  [-31.4166, -64.1868],
  [-31.4122, -64.1872],
  [-31.4072, -64.1879],
  [-31.4022, -64.1868],
  [-31.3968, -64.1852],
]
const FALLA_ANCHOS = [0.0007, 0.0016, 0.0011, 0.0023, 0.0012, 0.0018, 0.001, 0.0025, 0.0013, 0.0006]

function construirFalla(): LatLng[] {
  const oeste = FALLA_EJE.map(([lat, lng], i): LatLng => [
    lat + (i % 2 ? 0.0004 : -0.0003),
    lng - FALLA_ANCHOS[i] * (i % 3 === 0 ? 1.5 : 1),
  ])
  const este = FALLA_EJE.map(([lat, lng], i): LatLng => [
    lat + (i % 2 ? -0.0003 : 0.0005),
    lng + FALLA_ANCHOS[i] * (i % 2 ? 0.7 : 1.3),
  ])
  return [...oeste, ...este.reverse()]
}
const FALLA = construirFalla()

/* ---------- Geometría: Búnker del Gremio (hexágono) ---------- */
const PANAL: LatLng = [-31.4172, -64.1765]
const BUNKER: LatLng[] = Array.from({ length: 6 }, (_, i) => {
  const ang = (Math.PI / 3) * i + Math.PI / 6
  const r = 0.0019
  return [PANAL[0] + r * Math.sin(ang), PANAL[1] + (r * Math.cos(ang)) / Math.cos((31.42 * Math.PI) / 180)]
})

/* ---------- Geometría: Tránsito ---------- */
const ANILLO_CENTRO: LatLng = [-31.419, -64.192]
const ANILLO_RADIO = 3150
const ANILLO_NO: LatLng = (() => {
  const dLat = (ANILLO_RADIO * Math.SQRT1_2) / 111320
  const dLng = dLat / Math.cos((31.42 * Math.PI) / 180)
  return [ANILLO_CENTRO[0] + dLat, ANILLO_CENTRO[1] - dLng]
})()
const RAMAL_NOROESTE: LatLng[] = [ANILLO_NO, [-31.3935, -64.2205], [-31.3858, -64.2262], [-31.3785, -64.2348]]
const ETIQUETA_TREN: LatLng = [-31.3905, -64.2085]

const TRANVIAS: LatLng[][] = [
  [
    [-31.4002, -64.2055],
    [-31.4125, -64.183],
    [-31.4205, -64.1763],
    [-31.4288, -64.1698],
  ],
  [
    [-31.4372, -64.1952],
    [-31.4205, -64.1869],
    [-31.4125, -64.183],
    [-31.3992, -64.1718],
  ],
  [
    [-31.4215, -64.2135],
    [-31.4205, -64.1869],
    [-31.4205, -64.1763],
    [-31.4195, -64.1665],
  ],
]

/* ---------- Geometría: Zona Uno ---------- */
const ZONA_UNO: LatLng[] = [
  [-31.3615, -64.2428],
  [-31.3652, -64.2232],
  [-31.3768, -64.2195],
  [-31.3878, -64.2318],
  [-31.3825, -64.2535],
  [-31.3682, -64.2565],
]

const CAPAS: Record<
  Capa,
  { titulo: string; subtitulo: string; altitud: string; color: string; descripcion: string }
> = {
  Uno: {
    titulo: 'Zona Uno',
    subtitulo: 'La Cúpula // Noroeste',
    altitud: 'ALT +300m',
    color: COLORES.amarillo,
    descripcion: 'Enclave de los senadores-bots. Solo accesible por el ramal del Tren Circunvalar.',
  },
  Central: {
    titulo: 'Zona Central',
    subtitulo: 'Mega-plataformas',
    altitud: 'ALT +120m',
    color: COLORES.cian,
    descripcion: 'Placas de hormigón asimétricas. Tranvías flotantes. La Gran Falla: sepultada.',
  },
  Zero: {
    titulo: 'Zona Zero',
    subtitulo: 'Submundo',
    altitud: 'ALT -40m',
    color: COLORES.magenta,
    descripcion: 'Centro viejo hundido. Las placas son ahora el techo. La falla queda expuesta.',
  },
}
const ORDEN_CAPAS: Capa[] = ['Uno', 'Central', 'Zero']

function crearIcono(color: string, seleccionado: boolean, chico = false) {
  const size = chico ? (seleccionado ? 16 : 11) : seleccionado ? 26 : 18
  return L.divIcon({
    className: 'nodo-cyber',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="nodo-cyber__punto${chico ? ' nodo-cyber__punto--estacion' : ''}${seleccionado ? ' nodo-cyber__punto--activo' : ''}" style="--c:${color}"></span>`,
  })
}

function crearEtiqueta(clase: string, texto: string, rotacion = 0) {
  return L.divIcon({
    className: clase,
    iconSize: [0, 0],
    html: `<span style="transform:translate(-50%,-50%) rotate(${rotacion}deg)">${texto}</span>`,
  })
}

function VolarAlNodo({ nodo }: { nodo: Nodo | null }) {
  const map = useMap()
  useEffect(() => {
    if (nodo) map.flyTo([nodo.lat, nodo.lng], Math.max(map.getZoom(), 15), { duration: 0.8 })
  }, [nodo, map])
  return null
}

function Encuadre({ uno }: { uno: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (uno) {
      map.flyToBounds(L.latLngBounds([...ZONA_UNO, ...FALLA, [-31.4245, -64.15]]), {
        padding: [40, 40],
        duration: 1.1,
      })
    } else {
      map.flyTo(CENTRO, 14, { duration: 1.1 })
    }
  }, [uno, map])
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
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#06e0ff]/80">
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

function IndicadorCapas({ activas }: { activas: Record<Capa, boolean> }) {
  return (
    <div className="flex items-stretch gap-3" aria-hidden="true">
      <div className="flex w-3 flex-col gap-1">
        {ORDEN_CAPAS.map((c) => {
          const { color } = CAPAS[c]
          return (
            <div
              key={c}
              className="h-4 border transition-all duration-500"
              style={{
                borderColor: color,
                borderStyle: c === 'Zero' ? 'dashed' : 'solid',
                backgroundColor: activas[c] ? color : 'transparent',
                boxShadow: activas[c] ? `0 0 10px ${color}` : 'none',
              }}
            />
          )
        })}
      </div>
      <div className="flex flex-1 flex-col justify-between text-[10px] uppercase tracking-widest">
        {ORDEN_CAPAS.map((c, i) => (
          <span
            key={c}
            style={{ color: activas[c] ? CAPAS[c].color : 'rgba(255,255,255,0.3)' }}
          >
            {`NIVEL ${i < 2 ? '+' : ''}${2 - i} // ${CAPAS[c].subtitulo}`}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function MapaCordoba() {
  const [activas, setActivas] = useState<Record<Capa, boolean>>({
    Uno: false,
    Central: true,
    Zero: false,
  })
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null)

  const hayAlguna = activas.Zero || activas.Central || activas.Uno
  const enSubmundo = activas.Zero
  const verPlataformas = activas.Central || activas.Zero
  const verTren = activas.Central || activas.Uno

  const nodosVisibles = useMemo(
    () => NODOS.filter((n) => (n.zona === 'Todas' ? hayAlguna : activas[n.zona])),
    [activas, hayAlguna],
  )

  const seleccionado = nodosVisibles.find((n) => n.id === seleccionadoId) ?? null
  const capaPrincipal: Capa = enSubmundo ? 'Zero' : activas.Central ? 'Central' : 'Uno'
  const infoCapa = CAPAS[capaPrincipal]

  const alternar = (c: Capa) => setActivas((prev) => ({ ...prev, [c]: !prev[c] }))

  const estiloPlataforma = enSubmundo
    ? {
        color: COLORES.cian,
        weight: 1.5,
        opacity: 0.6,
        dashArray: '8 7',
        fillColor: '#0b1220',
        fillOpacity: 0.15,
      }
    : {
        color: COLORES.cian,
        weight: 3,
        opacity: 1,
        dashArray: undefined,
        fillColor: '#070b14',
        fillOpacity: 0.95,
      }

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-[#05070a] font-mono text-[#39ff88]"
      data-nivel={capaPrincipal}
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

        {/* Submundo: z-index bajo en Central, sube por encima de las placas en Zero (ver CSS) */}
        <Pane name="submundo">
          {verPlataformas && (
            <>
              <Polygon
                positions={FALLA}
                pathOptions={{
                  color: COLORES.oxido,
                  weight: 2,
                  fillColor: COLORES.verde,
                  fillOpacity: enSubmundo ? 0.42 : 0.25,
                  className: 'falla',
                }}
                interactive={false}
              />
              <Polyline
                positions={FALLA_EJE}
                pathOptions={{ color: '#020402', weight: 3, opacity: 0.9 }}
                interactive={false}
              />
            </>
          )}
          {enSubmundo && (
            <Polygon
              positions={BUNKER}
              pathOptions={{
                color: COLORES.rojo,
                weight: 3,
                fillColor: COLORES.rojo,
                fillOpacity: 0.28,
                className: 'bunker',
              }}
              interactive={false}
            />
          )}
        </Pane>

        <Pane name="plataformas">
          {verPlataformas &&
            PLATAFORMAS.map((p) => (
              <Polygon
                key={p.nombre}
                positions={p.forma}
                pathOptions={{ ...estiloPlataforma, className: 'plataforma' }}
                interactive={false}
              />
            ))}
        </Pane>

        <Pane name="transito">
          {verTren && (
            <>
              <Circle
                center={ANILLO_CENTRO}
                radius={ANILLO_RADIO}
                pathOptions={{
                  color: COLORES.cian,
                  weight: 3,
                  dashArray: '14 10',
                  fill: false,
                  className: 'tren',
                }}
                interactive={false}
              />
              <Polyline
                positions={RAMAL_NOROESTE}
                pathOptions={{ color: COLORES.cian, weight: 3, dashArray: '14 10', className: 'tren' }}
                interactive={false}
              />
            </>
          )}
          {activas.Central &&
            TRANVIAS.map((linea, i) => (
              <Polyline
                key={`tranvia-${i}`}
                positions={linea}
                pathOptions={{
                  color: COLORES.magenta,
                  weight: 1.5,
                  opacity: enSubmundo ? 0.35 : 0.95,
                  className: 'tranvia',
                }}
                interactive={false}
              />
            ))}
          {activas.Uno && (
            <Polygon
              positions={ZONA_UNO}
              pathOptions={{
                color: COLORES.amarillo,
                weight: 2,
                fillColor: COLORES.amarillo,
                fillOpacity: 0.18,
                className: 'zona-uno',
              }}
              interactive={false}
            />
          )}
        </Pane>

        {activas.Central &&
          PLATAFORMAS.map((p) => (
            <Marker
              key={`et-${p.nombre}`}
              position={p.etiqueta}
              icon={crearEtiqueta('etiqueta-placa', p.nombre)}
              interactive={false}
              keyboard={false}
              opacity={enSubmundo ? 0.35 : 1}
            />
          ))}

        {verTren && (
          <Marker
            position={ETIQUETA_TREN}
            icon={crearEtiqueta('etiqueta-tren', 'Tren Circunvalar de Alta Velocidad', -38)}
            interactive={false}
            keyboard={false}
          />
        )}

        {enSubmundo &&
          CALLES_VIEJAS.map((c) => (
            <Marker
              key={c.nombre}
              position={[c.lat, c.lng]}
              icon={crearEtiqueta('etiqueta-calle', c.nombre, c.rotacion)}
              interactive={false}
              keyboard={false}
            />
          ))}

        {nodosVisibles.map((nodo) => (
          <Marker
            key={nodo.id}
            position={[nodo.lat, nodo.lng]}
            icon={crearIcono(COLORES[nodo.colorIcono], nodo.id === seleccionadoId, nodo.chico)}
            title={nodo.nombre}
            alt={nodo.nombre}
            keyboard
            zIndexOffset={nodo.chico ? 500 : 1000}
            eventHandlers={{ click: () => setSeleccionadoId(nodo.id) }}
          />
        ))}

        <Encuadre uno={activas.Uno} />
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
        key={capaPrincipal}
        className="transicion-nivel pointer-events-none absolute inset-0 z-[402]"
        style={{ '--c': infoCapa.color } as React.CSSProperties}
        aria-hidden="true"
      />

      <aside className="absolute inset-x-3 bottom-3 z-[500] flex max-h-[55dvh] flex-col gap-4 overflow-y-auto border border-[#39ff88]/70 bg-[#05070a]/90 p-4 shadow-[0_0_24px_rgba(57,255,136,0.25)] backdrop-blur-sm md:inset-x-auto md:bottom-auto md:left-4 md:top-4 md:max-h-[calc(100dvh-2rem)] md:w-80">
        <header className="flex flex-col gap-1 border-b border-[#39ff88]/30 pb-3">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#06e0ff]">
            {'// NetRunner OS v2.077'}
          </p>
          <h1 className="text-lg font-bold uppercase tracking-wider text-[#39ff88] [text-shadow:0_0_10px_#39ff88]">
            Córdoba Capital
          </h1>
          <p className="text-[10px] text-[#39ff88]/60">
            {`${nodosVisibles.length} / ${NODOS.length} nodos en línea // ${hayAlguna ? infoCapa.altitud : 'SIN SEÑAL'}`}
          </p>
        </header>

        <section aria-labelledby="titulo-capas" className="flex flex-col gap-3">
          <h2 id="titulo-capas" className="text-xs uppercase tracking-widest text-[#ff2bd6]">
            {'[ root@cba:~# toggle --zona ]'}
          </h2>
          <div role="group" aria-labelledby="titulo-capas" className="flex flex-col gap-2">
            {ORDEN_CAPAS.map((clave) => {
              const c = CAPAS[clave]
              const activo = activas[clave]
              return (
                <button
                  key={clave}
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  onClick={() => alternar(clave)}
                  className="flex items-center justify-between gap-3 border px-3 py-2 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#06e0ff]"
                  style={{
                    borderColor: activo ? c.color : 'rgba(255,255,255,0.15)',
                    borderStyle: clave === 'Zero' ? 'dashed' : 'solid',
                    color: activo ? c.color : 'rgba(255,255,255,0.45)',
                    backgroundColor: activo ? `${c.color}1a` : 'transparent',
                    boxShadow: activo ? `0 0 12px ${c.color}55` : 'none',
                  }}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold uppercase">{`> ${c.titulo}`}</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-75">
                      {`${c.subtitulo} // ${c.altitud}`}
                    </span>
                  </span>
                  <span className="text-[11px] font-bold">{activo ? '[ON ]' : '[OFF]'}</span>
                </button>
              )
            })}
          </div>

          <IndicadorCapas activas={activas} />

          <p className="text-[10px] leading-relaxed" style={{ color: `${infoCapa.color}cc` }}>
            {hayAlguna ? `> ${infoCapa.descripcion}` : '> Todas las capas apagadas. Solo queda el mapa base.'}
          </p>

          <ul className="flex flex-col gap-1 border-t border-white/10 pt-2 text-[9px] uppercase tracking-widest text-white/50">
            <li className="flex items-center gap-2">
              <span className="inline-block h-0 w-5 border-t-2 border-dashed border-[#06e0ff]" />
              Tren Circunvalar
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-0 w-5 border-t border-[#ff2bd6]" />
              Tranvía Flotante
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-5 border border-[#c2571a] bg-[#7cff2b]/40" />
              La Gran Falla (Cañada)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-2 w-5 border border-[#ff1a1a] bg-[#ff1a1a]/30" />
              Zona militarizada
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="titulo-decodificador"
          className="flex flex-col gap-2 border-t border-[#39ff88]/30 pt-3"
        >
          <h2 id="titulo-decodificador" className="text-xs uppercase tracking-widest text-[#06e0ff]">
            {'[ Decodificador de Datos ]'}
          </h2>
          <Decodificador key={seleccionado?.id ?? 'vacio'} nodo={seleccionado} />
        </section>
      </aside>

      <style>{`
        .leaflet-container { background: #05070a; font-family: inherit; }
        .leaflet-control-attribution { background: rgba(5,7,10,0.8) !important; color: #39ff8899 !important; font-size: 9px; }
        .leaflet-control-attribution a { color: #06e0ff !important; }
        .tiles-oscuros { filter: invert(1) hue-rotate(180deg) grayscale(0.85) brightness(0.75) contrast(1.15); }
        [data-nivel="Zero"] .tiles-oscuros { filter: invert(1) hue-rotate(250deg) grayscale(0.5) brightness(0.5) contrast(1.3); }
        [data-nivel="Zero"] .tiles-base:not(.tiles-oscuros) { filter: hue-rotate(60deg) brightness(0.7) saturate(1.6); }

        .leaflet-submundo-pane { z-index: 405; opacity: .6; transition: opacity .8s ease; }
        .leaflet-plataformas-pane { z-index: 415; }
        .leaflet-transito-pane { z-index: 425; }
        [data-nivel="Zero"] .leaflet-submundo-pane { z-index: 420; opacity: 1; }

        .plataforma { transition: fill-opacity .8s ease, stroke-width .6s ease, stroke-opacity .6s ease; }
        [data-nivel="Central"] .plataforma { filter: drop-shadow(0 0 8px #06e0ff) drop-shadow(0 6px 0 #02060c); }
        .falla { filter: drop-shadow(0 0 6px #7cff2b); }
        .bunker { filter: drop-shadow(0 0 10px #ff1a1a); }
        .tren { filter: drop-shadow(0 0 6px #06e0ff); }
        .tranvia { filter: drop-shadow(0 0 4px #ff2bd6); transition: stroke-opacity .6s ease; }
        .zona-uno { filter: drop-shadow(0 0 14px #ffe62b); }

        .etiqueta-placa, .etiqueta-calle, .etiqueta-tren { background: transparent; border: none; }
        .etiqueta-placa span, .etiqueta-calle span, .etiqueta-tren span {
          position: absolute; display: inline-block; white-space: nowrap; text-transform: uppercase; font-weight: 700;
        }
        .etiqueta-placa span {
          font-size: 10px; letter-spacing: .2em; color: #06e0ff; text-shadow: 0 0 6px #06e0ff;
          border-left: 2px solid #06e0ff; padding-left: 4px;
        }
        .etiqueta-tren span {
          font-size: 10px; letter-spacing: .25em; color: #05070a; background: #06e0ff;
          padding: 2px 6px; box-shadow: 0 0 12px #06e0ff;
        }
        .etiqueta-calle span {
          font-size: 13px; letter-spacing: .25em;
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
        .nodo-cyber__punto--estacion { border-radius: 1px; border-width: 1px; transform: rotate(45deg); }
        .nodo-cyber:hover .nodo-cyber__punto { transform: scale(1.25); }
        .nodo-cyber:hover .nodo-cyber__punto--estacion { transform: rotate(45deg) scale(1.3); }
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
        @keyframes barrido { to { transform: translateY(340%); opacity: 0; } }

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
