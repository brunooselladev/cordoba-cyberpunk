'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

/* ====================================================================
  TACTICAL COUNTDOWN — Cyberpunk 2020
  -------------------------------------------------------------------
  Reloj de escena para el GM. Convierte tiempo real (mesa) en tiempo
  ficcional (personajes) con una razón configurable.

  Modelo de tiempo:
  - El estado guarda el restante ficcional en un instante "ancla".
  - En cada lectura se calcula: restante - (ahora - ancla) / ratio.
  - Pausar congela el ancla. Reanudar mueve el ancla.
  - Cambiar la razón durante una escena reancla el valor actual, así
    el tiempo ya transcurrido no se reinterpreta hacia atrás.
  ==================================================================== */

type Estado = 'idle' | 'running' | 'paused' | 'expired'
type Modo = 'gm' | 'player'
type Urgencia = 'calm' | 'tension' | 'critical' | 'danger' | 'expired'

interface RelojState {
  estado: Estado
  /** Segundos ficcionales restantes en el instante `ancla`. */
  restante: number
  /** Date.now() del ancla. */
  ancla: number
  /** Duración ficcional con la que arrancó la escena. */
  total: number
}

interface Accion {
  id: string
  nombre: string
  segundos: number
}

interface Tema {
  etiqueta: string
  codigo: string
  color: string
  borde: string
  tinte: string
  brillo: string
}

type CSSVars = CSSProperties & {
  '--accent'?: string
  '--accent-border'?: string
  '--accent-tint'?: string
  '--accent-glow'?: string
}

const TEMAS: Record<Urgencia, Tema> = {
  calm: {
    etiqueta: 'CALMA',
    codigo: 'NOMINAL',
    color: '#2ee6ff',
    borde: 'rgba(46, 230, 255, 0.55)',
    tinte: 'rgba(46, 230, 255, 0.07)',
    brillo: 'rgba(46, 230, 255, 0.45)',
  },
  tension: {
    etiqueta: 'TENSIÓN',
    codigo: 'ELEVADA',
    color: '#ffc247',
    borde: 'rgba(255, 194, 71, 0.55)',
    tinte: 'rgba(255, 194, 71, 0.08)',
    brillo: 'rgba(255, 194, 71, 0.45)',
  },
  critical: {
    etiqueta: 'CRÍTICO',
    codigo: 'SEVERO',
    color: '#ff8a1e',
    borde: 'rgba(255, 138, 30, 0.6)',
    tinte: 'rgba(255, 138, 30, 0.09)',
    brillo: 'rgba(255, 138, 30, 0.5)',
  },
  danger: {
    etiqueta: 'PELIGRO INMINENTE',
    codigo: 'CRÍTICO',
    color: '#ff3b30',
    borde: 'rgba(255, 59, 48, 0.7)',
    tinte: 'rgba(255, 59, 48, 0.11)',
    brillo: 'rgba(255, 59, 48, 0.65)',
  },
  expired: {
    etiqueta: 'TIEMPO AGOTADO',
    codigo: 'EXPIRADO',
    color: '#ff2b20',
    borde: 'rgba(255, 43, 32, 0.8)',
    tinte: 'rgba(255, 43, 32, 0.14)',
    brillo: 'rgba(255, 43, 32, 0.75)',
  },
}

const PRESETS_RATIO = [
  { valor: 10, nota: 'Tensión controlada' },
  { valor: 6, nota: 'Presión intensa' },
  { valor: 3, nota: 'Emergencia extrema' },
] as const

const ESCENAS_RAPIDAS = [
  'Auto-destrucción corporativa',
  'Equipo de seguridad',
  'Desactivación de bomba',
  'Escape antes de la extracción',
  'Intrusión al cyberdeck',
] as const

const CANTIDADES_ACCION = [5, 10, 25, 60] as const
const CLAVE_CONFIG = 'cordoba-cyberpunk-reloj-config-v2'

function limitar(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function ratioValido(n: number) {
  return Number.isFinite(n) && n >= 0.1 && n <= 999
}

/** Formatea segundos como MM:SS (o HH:MM:SS si hace falta). */
function formatear(segundos: number): string {
  const total = Math.max(0, Math.ceil(segundos))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function formatearNumero(n: number): string {
  if (Number.isInteger(n)) return String(n)
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function minutosSegundosAsegundos(min: string, seg: string): number {
  const m = Math.max(0, parseInt(min || '0', 10) || 0)
  const s = Math.max(0, parseInt(seg || '0', 10) || 0)
  return m * 60 + s
}

export default function RelojCuentaRegresiva() {
  const [modo, setModo] = useState<Modo>('gm')

  /* ---------------- Configuración ---------------- */
  const [titulo, setTitulo] = useState('')
  const [min, setMin] = useState('5')
  const [seg, setSeg] = useState('0')
  const [ratio, setRatio] = useState(6)
  const [presetRatio, setPresetRatio] = useState<number | null>(6)
  const [ratioCustom, setRatioCustom] = useState('6')
  const [configCargada, setConfigCargada] = useState(false)
  const [configAbierta, setConfigAbierta] = useState(true)
  const ratioInputRef = useRef<HTMLInputElement>(null)

  /* ---------------- Reloj ---------------- */
  const [reloj, setReloj] = useState<RelojState>({
    estado: 'idle',
    restante: 300,
    ancla: 0,
    total: 300,
  })
  const [ahora, setAhora] = useState(() => Date.now())

  /* ---------------- Acciones manuales ---------------- */
  const [nombreAccion, setNombreAccion] = useState('')
  const [segAccion, setSegAccion] = useState('25')
  const [acciones, setAcciones] = useState<Accion[]>([])
  const [deducidoTotal, setDeducidoTotal] = useState(0)
  const [bloqueoAccion, setBloqueoAccion] = useState(false)
  const bloqueoRef = useRef<number | undefined>(undefined)

  /* ---------------- Pantalla completa ---------------- */
  const contenedorRef = useRef<HTMLDivElement>(null)
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false)
  const [avisoPantalla, setAvisoPantalla] = useState('')

  /* ---------------- Derivados ---------------- */
  const duracionConfig = useMemo(
    () => minutosSegundosAsegundos(min, seg),
    [min, seg],
  )

  const restanteVivo =
    reloj.estado === 'running'
      ? Math.max(0, reloj.restante - (ahora - reloj.ancla) / 1000 / ratio)
      : reloj.restante

  const enEscena = reloj.estado === 'running' || reloj.estado === 'paused'
  const restanteMostrado =
    reloj.estado === 'idle' ? duracionConfig : restanteVivo
  const totalMostrado =
    reloj.estado === 'idle'
      ? Math.max(duracionConfig, 1)
      : Math.max(reloj.total, 1)
  const realRestante = Math.max(0, restanteMostrado) * ratio
  const progreso = limitar(restanteMostrado / totalMostrado, 0, 1)

  const expirado =
    reloj.estado === 'expired' ||
    (reloj.estado !== 'idle' && restanteMostrado <= 0)

  const urgencia: Urgencia =
    reloj.estado === 'idle'
      ? 'calm'
      : expirado
        ? 'expired'
        : progreso <= 0.1
          ? 'danger'
          : progreso <= 0.25
            ? 'critical'
            : progreso <= 0.5
              ? 'tension'
              : 'calm'

  const tema = TEMAS[urgencia]
  const estiloTema = {
    '--accent': tema.color,
    '--accent-border': tema.borde,
    '--accent-tint': tema.tinte,
    '--accent-glow': tema.brillo,
  } as CSSVars

  const ficTexto = formatear(restanteMostrado)
  const realTexto = formatear(realRestante)
  const totalTexto = formatear(totalMostrado)
  const ratioTexto = `${formatearNumero(ratio)}:1`
  const porcentajeTexto = `${
    totalMostrado > 0
      ? Math.round((restanteMostrado / totalMostrado) * 100)
      : 0
  }%`

  const estadoTexto =
    reloj.estado === 'idle'
      ? 'EN ESPERA'
      : reloj.estado === 'running'
        ? 'EN MARCHA'
        : reloj.estado === 'paused'
          ? 'EN PAUSA'
          : 'AGOTADO'

  const etiquetaUrgencia = reloj.estado === 'idle' ? 'STANDBY' : tema.etiqueta
  const codigoUrgencia = reloj.estado === 'idle' ? 'SIN INICIAR' : tema.codigo
  const configBloqueada = reloj.estado !== 'idle'

  const segundosAccion = Math.floor(Number(segAccion) || 0)
  const accionValida = segundosAccion > 0 && segundosAccion <= 9999
  const ratioPersonalizadoInvalido =
    ratioCustom.trim() !== '' && !ratioValido(Number(ratioCustom))
  const configInvalida = duracionConfig <= 0
  const escalaDigitos = ficTexto.length > 5 ? ' is-long' : ''

  const minutosRealesPorFiccion = 60 / ratio

  /* ---------------- Lectura y anclaje ---------------- */
  const restanteEn = useCallback(
    (t: number) => {
      if (reloj.estado !== 'running') return reloj.restante
      return Math.max(0, reloj.restante - (t - reloj.ancla) / 1000 / ratio)
    },
    [reloj, ratio],
  )

  const reanclarCon = useCallback(
    (nuevoRestante: number, nuevoEstado: Estado = reloj.estado) => {
      const t = Date.now()
      setReloj({
        estado: nuevoEstado,
        restante: Math.max(0, nuevoRestante),
        ancla: t,
        total: reloj.total,
      })
      setAhora(t)
    },
    [reloj.estado, reloj.total],
  )

  /* ---------------- Controles ---------------- */
  const iniciar = useCallback(() => {
    if (reloj.estado !== 'idle' || duracionConfig <= 0) return
    const t = Date.now()
    setReloj({
      estado: 'running',
      restante: duracionConfig,
      ancla: t,
      total: duracionConfig,
    })
    setAhora(t)
    setAcciones([])
    setDeducidoTotal(0)
    setConfigAbierta(false)
  }, [reloj.estado, duracionConfig])

  const pausar = useCallback(() => {
    if (reloj.estado !== 'running') return
    const t = Date.now()
    const restante = restanteEn(t)
    setReloj({
      ...reloj,
      estado: restante <= 0 ? 'expired' : 'paused',
      restante,
      ancla: t,
    })
    setAhora(t)
  }, [reloj, restanteEn])

  const reanudar = useCallback(() => {
    if (reloj.estado !== 'paused') return
    const t = Date.now()
    setReloj({ ...reloj, estado: 'running', ancla: t })
    setAhora(t)
  }, [reloj])

  const reiniciar = useCallback(() => {
    const t = Date.now()
    setReloj({
      estado: 'idle',
      restante: duracionConfig,
      ancla: t,
      total: duracionConfig,
    })
    setAhora(t)
    setAcciones([])
    setDeducidoTotal(0)
    setBloqueoAccion(false)
    setConfigAbierta(true)
  }, [duracionConfig])

  const ajustar = useCallback(
    (delta: number) => {
      if (!enEscena || delta === 0) return
      const t = Date.now()
      const actual = restanteEn(t)
      const nuevo = Math.max(0, actual + delta)
      setReloj({
        ...reloj,
        estado: nuevo <= 0 ? 'expired' : reloj.estado,
        restante: nuevo,
        ancla: t,
      })
      setAhora(t)
    },
    [enEscena, reloj, restanteEn],
  )

  const registrarAccion = useCallback(() => {
    if (!enEscena || !accionValida || bloqueoAccion) return
    const t = Date.now()
    const actual = restanteEn(t)
    const nuevo = Math.max(0, actual - segundosAccion)

    setReloj({
      ...reloj,
      estado: nuevo <= 0 ? 'expired' : reloj.estado,
      restante: nuevo,
      ancla: t,
    })
    setAhora(t)
    setAcciones((prev) =>
      [
        {
          id: `${t}-${segundosAccion}-${prev.length}`,
          nombre: nombreAccion.trim() || 'Acción sin nombre',
          segundos: segundosAccion,
        },
        ...prev,
      ].slice(0, 4),
    )
    setDeducidoTotal((prev) => prev + segundosAccion)

    // Evita que un doble clic accidental registre la misma acción dos veces.
    setBloqueoAccion(true)
    window.clearTimeout(bloqueoRef.current)
    bloqueoRef.current = window.setTimeout(() => setBloqueoAccion(false), 450)
  }, [
    accionValida,
    bloqueoAccion,
    enEscena,
    nombreAccion,
    reloj,
    restanteEn,
    segundosAccion,
  ])

  const aplicarRatio = useCallback(
    (n: number) => {
      if (!ratioValido(n)) return
      const t = Date.now()
      if (reloj.estado === 'running') {
        const restante = restanteEn(t)
        setReloj({ ...reloj, restante, ancla: t })
      }
      setRatio(n)
      setAhora(t)
    },
    [reloj, restanteEn],
  )

  const elegirPreset = useCallback(
    (n: number) => {
      setPresetRatio(n)
      setRatioCustom(String(n))
      aplicarRatio(n)
    },
    [aplicarRatio],
  )

  const cambiarRatioCustom = useCallback(
    (valor: string) => {
      const limpio = valor.replace(',', '.').replace(/[^0-9.]/g, '')
      setRatioCustom(limpio)
      const n = Number(limpio)
      if (ratioValido(n)) {
        setPresetRatio(
          PRESETS_RATIO.some((preset) => preset.valor === n) ? n : null,
        )
        aplicarRatio(n)
      } else {
        setPresetRatio(null)
      }
    },
    [aplicarRatio],
  )

  const normalizarDuracion = useCallback(() => {
    const m = Math.max(0, parseInt(min || '0', 10) || 0)
    const s = Math.max(0, parseInt(seg || '0', 10) || 0)
    const total = m * 60 + s
    setMin(String(Math.floor(total / 60)))
    setSeg(String(total % 60))
  }, [min, seg])

  /* ---------------- Pantalla completa ---------------- */
  const alternarPantallaCompleta = useCallback(() => {
    const el = contenedorRef.current
    if (!el) return

    if (!document.fullscreenElement) {
      const solicitud = el.requestFullscreen?.()
      if (solicitud) {
        solicitud.catch(() => {
          setAvisoPantalla('PANTALLA COMPLETA NO DISPONIBLE')
          window.setTimeout(() => setAvisoPantalla(''), 3000)
        })
      }
    } else {
      const salida = document.exitFullscreen?.()
      if (salida) salida.catch(() => {})
    }
  }, [])

  /* ---------------- Efectos ---------------- */
  useEffect(() => {
    const alCambiar = () =>
      setEsPantallaCompleta(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', alCambiar)
    alCambiar()
    return () => document.removeEventListener('fullscreenchange', alCambiar)
  }, [])

  /* Tick de 100 ms: el cálculo siempre sale de timestamps, no del tick. */
  useEffect(() => {
    if (reloj.estado !== 'running') return

    const id = window.setInterval(() => setAhora(Date.now()), 100)
    const refrescar = () => setAhora(Date.now())
    const alVolver = () => {
      if (!document.hidden) refrescar()
    }

    document.addEventListener('visibilitychange', alVolver)
    window.addEventListener('focus', refrescar)
    window.addEventListener('pageshow', refrescar)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', alVolver)
      window.removeEventListener('focus', refrescar)
      window.removeEventListener('pageshow', refrescar)
    }
  }, [reloj.estado])

  /* Expiración: se evalúa sobre el restante calculado por timestamp. */
  useEffect(() => {
    if (reloj.estado === 'running' && restanteVivo <= 0) {
      setReloj((prev) =>
        prev.estado === 'running'
          ? { ...prev, estado: 'expired', restante: 0, ancla: Date.now() }
          : prev,
      )
    }
  }, [reloj.estado, restanteVivo])

  /* Persistencia de configuración (no del estado de la escena). */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CLAVE_CONFIG)
      if (raw) {
        const guardada = JSON.parse(raw) as {
          titulo?: unknown
          min?: unknown
          seg?: unknown
          ratio?: unknown
          ratioCustom?: unknown
          presetRatio?: unknown
        }
        if (typeof guardada.titulo === 'string') {
          setTitulo(guardada.titulo.slice(0, 60))
        }
        if (typeof guardada.min === 'string' && /^\d{0,4}$/.test(guardada.min)) {
          setMin(guardada.min)
        }
        if (typeof guardada.seg === 'string' && /^\d{0,3}$/.test(guardada.seg)) {
          setSeg(guardada.seg)
        }
        if (typeof guardada.ratio === 'number' && ratioValido(guardada.ratio)) {
          setRatio(guardada.ratio)
        }
        if (typeof guardada.ratioCustom === 'string') {
          setRatioCustom(guardada.ratioCustom.slice(0, 8))
        }
        if (
          guardada.presetRatio === null ||
          [10, 6, 3].includes(guardada.presetRatio as number)
        ) {
          setPresetRatio(guardada.presetRatio as number | null)
        }
      }
    } catch {
      // Configuración corrupta: se usan los valores por defecto.
    }
    setConfigCargada(true)
  }, [])

  useEffect(() => {
    if (!configCargada) return
    try {
      window.localStorage.setItem(
        CLAVE_CONFIG,
        JSON.stringify({
          titulo,
          min,
          seg,
          ratio,
          ratioCustom,
          presetRatio,
        }),
      )
    } catch {
      // Sin almacenamiento disponible: la app sigue funcionando.
    }
  }, [configCargada, min, presetRatio, ratio, ratioCustom, seg, titulo])

  /* Atajo: ESPACIO pausa/reanuda. No se dispara sobre controles. */
  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (
        evento.code !== 'Space' ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.altKey
      ) {
        return
      }
      const objetivo = evento.target as HTMLElement | null
      if (
        objetivo?.closest(
          'input, textarea, select, button, a, [contenteditable="true"]',
        )
      ) {
        return
      }
      evento.preventDefault()
      if (reloj.estado === 'running') pausar()
      else if (reloj.estado === 'paused') reanudar()
      else if (reloj.estado === 'idle') iniciar()
    }

    window.addEventListener('keydown', alPresionar)
    return () => window.removeEventListener('keydown', alPresionar)
  }, [iniciar, pausar, reanudar, reloj.estado])

  useEffect(() => {
    return () => window.clearTimeout(bloqueoRef.current)
  }, [])

  /* ---------------- Piezas compartidas ---------------- */
  const etiquetaEstado = (
    <span
      className={`rlc-state ${reloj.estado === 'running' ? 'is-live' : ''} ${
        reloj.estado === 'paused' ? 'is-paused' : ''
      } ${reloj.estado === 'expired' ? 'is-dead' : ''}`}
      aria-live="polite"
    >
      <i aria-hidden />
      {estadoTexto}
    </span>
  )

  const barraProgreso = (
    <div
      className="rlc-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progreso * 100)}
      aria-label="Tiempo ficcional restante"
    >
      <div
        className="rlc-progress-fill"
        style={{ width: `${progreso * 100}%` }}
      />
      <div className="rlc-progress-segments" aria-hidden />
      <div className="rlc-progress-tick" style={{ left: '50%' }} aria-hidden />
      <div className="rlc-progress-tick" style={{ left: '25%' }} aria-hidden />
      <div className="rlc-progress-tick" style={{ left: '10%' }} aria-hidden />
    </div>
  )

  const chipUrgencia = (
    <span
      className={`rlc-urgency ${urgencia === 'danger' || urgencia === 'expired' ? 'is-alert' : ''}`}
    >
      <i aria-hidden />
      {etiquetaUrgencia} <b>// {codigoUrgencia}</b>
    </span>
  )

  /* ---------------- Panel GM ---------------- */
  const panelGM = (
    <>
      <header className="rlc-top">
        <div className="rlc-brand">
          <span className="rlc-mark" aria-hidden>
            NC
          </span>
          <div className="rlc-brand-copy">
            <strong>TACTICAL COUNTDOWN</strong>
            <span>CP2020 // RELOJ DE ESCENA</span>
          </div>
        </div>

        <div className="rlc-top-actions">
          {avisoPantalla && (
            <span className="rlc-top-warning" role="status">
              {avisoPantalla}
            </span>
          )}
          <a className="rlc-btn rlc-btn-ghost" href="/">
            HUB
          </a>
          <button
            type="button"
            className="rlc-btn rlc-btn-ghost"
            onClick={alternarPantallaCompleta}
            aria-pressed={esPantallaCompleta}
          >
            <span className="rlc-copy-wide">
              {esPantallaCompleta ? 'SALIR FS' : 'PANTALLA COMPLETA'}
            </span>
            <span className="rlc-copy-narrow">
              {esPantallaCompleta ? 'SALIR' : 'FS'}
            </span>
          </button>
          <button
            type="button"
            className="rlc-btn rlc-btn-accent"
            onClick={() => setModo('player')}
          >
            <span className="rlc-copy-wide">DISPLAY JUGADOR</span>
            <span className="rlc-copy-narrow">JUGADOR</span>
          </button>
        </div>
      </header>

      <main className="rlc-main">
        <section
          className={`rlc-panel rlc-console ${expirado ? 'is-expired' : ''}`}
          aria-label="Consola de cuenta regresiva"
        >
          <span className="rlc-corner tl" aria-hidden />
          <span className="rlc-corner tr" aria-hidden />
          <span className="rlc-corner bl" aria-hidden />
          <span className="rlc-corner br" aria-hidden />

          <div className="rlc-console-head">
            <span className="rlc-kicker">
              {reloj.estado === 'idle'
                ? 'ESCENARIO // LISTO PARA INICIAR'
                : expirado
                  ? 'ESCENARIO // BLOQUEADO'
                  : 'ESCENARIO // EN CURSO'}
            </span>
            {etiquetaEstado}
          </div>

          <div className="rlc-scene-wrap">
            <h1 className={`rlc-scene ${titulo ? '' : 'is-empty'}`}>
              {titulo || 'SIN ESCENARIO ASIGNADO'}
            </h1>
          </div>

          <div className="rlc-readout">
            {expirado && (
              <span className="rlc-expired-banner" aria-live="assertive">
                TIME EXPIRED
              </span>
            )}
            <span className="rlc-label">TIEMPO FICCIÓN</span>
            <div
              className={`rlc-digits rlc-mono${escalaDigitos}`}
              role="timer"
              aria-label={`Tiempo ficcional restante: ${ficTexto}`}
            >
              {ficTexto}
            </div>

            <div className="rlc-subreadout">
              <div className="rlc-subitem">
                <span>TIEMPO REAL RESTANTE</span>
                <strong className="rlc-mono rlc-amber">{realTexto}</strong>
              </div>
              <span className="rlc-subdivider" aria-hidden />
              <div className="rlc-subitem">
                <span>COMPRESIÓN</span>
                <strong className="rlc-mono rlc-cyan">{ratioTexto}</strong>
              </div>
            </div>
          </div>

          <div className="rlc-console-bottom">
            <div className="rlc-urgency-row">
              {chipUrgencia}
              <span className="rlc-pct rlc-mono">{porcentajeTexto}</span>
            </div>
            {barraProgreso}
            <div className="rlc-console-foot">
              <span>TOTAL {totalTexto}</span>
              <span>RESTANTE {ficTexto}</span>
              <span>REAL {realTexto}</span>
              <span className={expirado ? 'rlc-danger-text' : ''}>
                {expirado ? 'SISTEMA BLOQUEADO' : `RATIO ${ratioTexto}`}
              </span>
            </div>
          </div>
        </section>

        <aside className="rlc-panel rlc-rail" aria-label="Controles del GM">
          <span className="rlc-corner tl" aria-hidden />
          <span className="rlc-corner br" aria-hidden />

          <div className="rlc-rail-scroll">
            <section className="rlc-block">
              <div className="rlc-block-head">
                <span>01</span>
                <h2>CONFIGURACIÓN DE ESCENA</h2>
                {!configAbierta && (
                  <span className="rlc-block-summary">
                    {formatear(duracionConfig)} // {ratioTexto}
                  </span>
                )}
                <button
                  type="button"
                  className="rlc-collapse"
                  onClick={() => setConfigAbierta((abierta) => !abierta)}
                  aria-expanded={configAbierta}
                  aria-controls="rlc-config-body"
                  aria-label={
                    configAbierta
                      ? 'Ocultar configuración'
                      : 'Mostrar configuración'
                  }
                  title={
                    configAbierta
                      ? 'Ocultar configuración'
                      : 'Mostrar configuración'
                  }
                >
                  {configAbierta ? '−' : '+'}
                </button>
              </div>

              {configAbierta && (
                <div id="rlc-config-body" className="rlc-config-body">
                  <div className="rlc-field">
                    <label htmlFor="rlc-titulo">TÍTULO / DESCRIPCIÓN</label>
                    <input
                      id="rlc-titulo"
                      className="rlc-input"
                      value={titulo}
                      onChange={(evento) =>
                        setTitulo(evento.target.value.slice(0, 60))
                      }
                      placeholder="BOMBA EN EL EDIFICIO CORPORATIVO"
                      maxLength={60}
                      autoComplete="off"
                    />
                  </div>

              <div className="rlc-chips" aria-label="Títulos sugeridos">
                {ESCENAS_RAPIDAS.map((escena) => (
                  <button
                    key={escena}
                    type="button"
                    className="rlc-chip"
                    onClick={() => setTitulo(escena)}
                    title={`Usar "${escena}"`}
                  >
                    {escena}
                  </button>
                ))}
              </div>

              <div className="rlc-field">
                <div className="rlc-field-row">
                  <label>DURACIÓN FICCIONAL</label>
                  <span className="rlc-field-value">
                    TOTAL {formatear(duracionConfig)}
                  </span>
                </div>
                <div className="rlc-duration">
                  <label className="rlc-duration-part">
                    <span>MIN</span>
                    <input
                      id="rlc-dur-min"
                      className="rlc-input rlc-mono"
                      value={min}
                      onChange={(evento) =>
                        setMin(
                          evento.target.value.replace(/\D/g, '').slice(0, 4),
                        )
                      }
                      onBlur={normalizarDuracion}
                      inputMode="numeric"
                      disabled={configBloqueada}
                      aria-label="Minutos de duración ficcional"
                    />
                  </label>
                  <span className="rlc-duration-colon" aria-hidden>
                    :
                  </span>
                  <label className="rlc-duration-part">
                    <span>SEG</span>
                    <input
                      id="rlc-dur-seg"
                      className="rlc-input rlc-mono"
                      value={seg}
                      onChange={(evento) =>
                        setSeg(
                          evento.target.value.replace(/\D/g, '').slice(0, 3),
                        )
                      }
                      onBlur={normalizarDuracion}
                      inputMode="numeric"
                      disabled={configBloqueada}
                      aria-label="Segundos de duración ficcional"
                    />
                  </label>
                </div>
                <span className="rlc-hint">
                  {configBloqueada
                    ? 'Reiniciá la escena para editar la duración.'
                    : 'Tiempo dentro del juego. Se convierte al tiempo real según el ratio.'}
                </span>
              </div>

              <div className="rlc-field">
                <div className="rlc-field-row">
                  <span className="rlc-label-inline">
                    COMPRESIÓN TEMPORAL
                  </span>
                  <span className="rlc-field-value">{ratioTexto}</span>
                </div>
                <div className="rlc-presets">
                  {PRESETS_RATIO.map((preset) => (
                    <button
                      key={preset.valor}
                      type="button"
                      className="rlc-preset"
                      data-active={presetRatio === preset.valor}
                      onClick={() => elegirPreset(preset.valor)}
                      aria-pressed={presetRatio === preset.valor}
                    >
                      <strong className="rlc-mono">{preset.valor}:1</strong>
                      <span>{preset.nota}</span>
                    </button>
                  ))}
                </div>

                <div className="rlc-custom-ratio">
                  <button
                    type="button"
                    className="rlc-preset rlc-preset-custom"
                    data-active={presetRatio === null}
                    onClick={() => {
                      setPresetRatio(null)
                      ratioInputRef.current?.focus()
                    }}
                    aria-pressed={presetRatio === null}
                  >
                    <strong>CUSTOM</strong>
                    <span>Definí tu ratio</span>
                  </button>
                  <label className="rlc-custom-input">
                    <span>SEG REALES POR 1 SEG FICCIONAL</span>
                    <div>
                      <input
                        ref={ratioInputRef}
                        id="rlc-ratio-custom"
                        className="rlc-input rlc-mono"
                        value={ratioCustom}
                        onChange={(evento) =>
                          cambiarRatioCustom(evento.target.value)
                        }
                        inputMode="decimal"
                        aria-invalid={ratioPersonalizadoInvalido}
                        aria-label="Ratio personalizado de segundos reales por segundo ficcional"
                      />
                      <span className="rlc-custom-suffix">:1</span>
                    </div>
                  </label>
                </div>
                {ratioPersonalizadoInvalido ? (
                  <span className="rlc-hint rlc-danger-text">
                    Ingresá un número entre 0.1 y 999.
                  </span>
                ) : (
                  <div className="rlc-conversion">
                    <span>1 min real → {formatearNumero(minutosRealesPorFiccion)} s ficcionales</span>
                    <span>{formatearNumero(ratio)} s reales → 1 s ficcional</span>
                  </div>
                )}
              </div>
                </div>
              )}
            </section>

            <section className="rlc-block">
              <div className="rlc-block-head">
                <span>02</span>
                <h2>ACCIÓN DE PERSONAJE</h2>
              </div>
              <p className="rlc-hint">
                Descuenta tiempo ficcional por una acción declarada. No se
                mezcla con el tiempo que corre solo.
              </p>

              <div className="rlc-action-grid">
                <div className="rlc-field">
                  <label htmlFor="rlc-accion">ACCIÓN</label>
                  <input
                    id="rlc-accion"
                    className="rlc-input"
                    value={nombreAccion}
                    onChange={(evento) => setNombreAccion(evento.target.value)}
                    placeholder="Hackear terminal"
                    maxLength={48}
                    autoComplete="off"
                  />
                </div>
                <div className="rlc-field">
                  <label htmlFor="rlc-accion-seg">SEG FICCIONALES</label>
                  <input
                    id="rlc-accion-seg"
                    className="rlc-input rlc-mono"
                    value={segAccion}
                    onChange={(evento) =>
                      setSegAccion(
                        evento.target.value.replace(/\D/g, '').slice(0, 4),
                      )
                    }
                    inputMode="numeric"
                    aria-label="Segundos ficcionales que consume la acción"
                  />
                </div>
              </div>

              <div className="rlc-chips">
                {CANTIDADES_ACCION.map((cantidad) => (
                  <button
                    key={cantidad}
                    type="button"
                    className="rlc-chip rlc-chip-mono"
                    onClick={() => setSegAccion(String(cantidad))}
                  >
                    {cantidad}s
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="rlc-btn rlc-btn-accent rlc-btn-block"
                onClick={registrarAccion}
                disabled={!enEscena || !accionValida || bloqueoAccion}
              >
                {bloqueoAccion
                  ? 'ACCIÓN REGISTRADA'
                  : `REGISTRAR ACCIÓN${accionValida ? ` −${segundosAccion}s FIC` : ''}`}
              </button>

              <div className="rlc-ledger" aria-live="polite">
                {acciones.length === 0 ? (
                  <span className="rlc-hint">SIN ACCIONES REGISTRADAS</span>
                ) : (
                  <>
                    <ul>
                      {acciones.map((accion) => (
                        <li key={accion.id}>
                          <span>{accion.nombre}</span>
                          <b className="rlc-mono">−{accion.segundos}s</b>
                        </li>
                      ))}
                    </ul>
                    <span className="rlc-ledger-total">
                      TOTAL DEDUCIDO: {deducidoTotal}s FIC
                    </span>
                  </>
                )}
              </div>
            </section>
          </div>

          <section className="rlc-block rlc-controls">
            <div className="rlc-block-head">
              <span>03</span>
              <h2>CONTROLES</h2>
              <span className="rlc-controls-state">{estadoTexto}</span>
            </div>

            <div className="rlc-control-grid">
              <button
                type="button"
                className={`rlc-btn ${reloj.estado === 'idle' ? 'rlc-btn-accent' : ''}`}
                onClick={iniciar}
                disabled={reloj.estado !== 'idle' || configInvalida}
                title={
                  configInvalida
                    ? 'Configurá una duración mayor a 0'
                    : 'Iniciar la cuenta'
                }
              >
                START
              </button>
              <button
                type="button"
                className={`rlc-btn ${reloj.estado === 'running' ? 'rlc-btn-pause' : ''}`}
                onClick={pausar}
                disabled={reloj.estado !== 'running'}
                title="Congelar ambos relojes"
              >
                PAUSE
              </button>
              <button
                type="button"
                className={`rlc-btn ${reloj.estado === 'paused' ? 'rlc-btn-accent' : ''}`}
                onClick={reanudar}
                disabled={reloj.estado !== 'paused'}
                title="Continuar desde el tiempo exacto"
              >
                RESUME
              </button>
              <button
                type="button"
                className="rlc-btn rlc-btn-danger"
                onClick={reiniciar}
                title="Volver a la duración configurada"
              >
                RESET
              </button>
            </div>

            <div className="rlc-adjust-grid">
              {[
                { signo: '+', segundos: 10 },
                { signo: '−', segundos: 10 },
                { signo: '+', segundos: 30 },
                { signo: '−', segundos: 30 },
              ].map(({ signo, segundos }) => (
                <button
                  key={`${signo}${segundos}`}
                  type="button"
                  className={`rlc-btn rlc-btn-small ${signo === '+' ? 'rlc-btn-plus' : 'rlc-btn-minus'}`}
                  onClick={() =>
                    ajustar(signo === '+' ? segundos : -segundos)
                  }
                  disabled={!enEscena}
                  title={`${signo}${segundos} segundos ficcionales`}
                >
                  <span className="rlc-mono">
                    {signo}
                    {segundos}s
                  </span>
                  <small>FIC</small>
                </button>
              ))}
            </div>

            {expirado && (
              <p className="rlc-hint rlc-danger-text rlc-expired-hint">
                Cuenta agotada. Presioná RESET para preparar una nueva escena.
              </p>
            )}
            {!expirado && configInvalida && (
              <p className="rlc-hint rlc-danger-text">
                Definí una duración ficcional mayor a 0 para iniciar.
              </p>
            )}
            <p className="rlc-hint rlc-shortcut">
              <kbd>ESPACIO</kbd> pausa / reanuda. Los ajustes ± recalculan el
              tiempo real automáticamente.
            </p>
          </section>
        </aside>
      </main>
    </>
  )

  /* ---------------- Pantalla jugador ---------------- */
  const pantallaJugador = (
    <div className="rlc-player">
      <div className="rlc-player-hud">
        <span className="rlc-kicker">
          NIGHT CITY // TACTICAL DISPLAY // {ratioTexto}
        </span>
        <div className="rlc-player-actions">
          <button
            type="button"
            className="rlc-btn rlc-btn-ghost rlc-btn-tiny"
            onClick={alternarPantallaCompleta}
            aria-pressed={esPantallaCompleta}
          >
            {esPantallaCompleta ? 'SALIR FS' : 'FS'}
          </button>
          <button
            type="button"
            className="rlc-btn rlc-btn-ghost rlc-btn-tiny"
            onClick={() => setModo('gm')}
          >
            GM
          </button>
        </div>
      </div>

      <main className="rlc-player-center">
        {titulo && <h1 className="rlc-player-scene">{titulo}</h1>}

        <span className={`rlc-player-label ${expirado ? 'is-expired' : ''}`}>
          {expirado
            ? 'TIME EXPIRED // TIEMPO AGOTADO'
            : reloj.estado === 'idle'
              ? 'STANDBY // EN ESPERA'
              : 'TIEMPO FICCIÓN RESTANTE'}
        </span>

        <div
          className={`rlc-player-digits rlc-mono${escalaDigitos}`}
          role="timer"
          aria-label={`Tiempo ficcional restante: ${ficTexto}`}
        >
          {ficTexto}
        </div>

        <div className="rlc-player-urgency">{chipUrgencia}</div>

        <div className="rlc-player-progress">{barraProgreso}</div>
      </main>

      <footer className="rlc-player-foot">
        <div>
          <span>TIEMPO REAL RESTANTE</span>
          <strong className="rlc-mono rlc-amber">{realTexto}</strong>
        </div>
        <div>
          <span>COMPRESIÓN</span>
          <strong className="rlc-mono rlc-cyan">{ratioTexto}</strong>
        </div>
        <div>
          <span>ESTADO</span>
          <strong className="rlc-player-state-value">
            {etiquetaUrgencia}
          </strong>
        </div>
      </footer>
    </div>
  )

  return (
    <div
      ref={contenedorRef}
      className={`rlc-root ${modo === 'player' ? 'is-player' : 'is-gm'} ${expirado ? 'is-expired' : ''}`}
      data-urgency={urgencia}
      style={estiloTema}
    >
      <div className="rlc-grid" aria-hidden />
      <div className="rlc-vignette" aria-hidden />
      <div className="rlc-scanlines" aria-hidden />
      <div className="rlc-noise" aria-hidden />

      {modo === 'gm' ? panelGM : pantallaJugador}

      <style>{`
        /* ============================================================
           TACTICAL COUNTDOWN // estilos
           ============================================================ */

        .rlc-root {
          --accent: #2ee6ff;
          --accent-border: rgba(46, 230, 255, 0.55);
          --accent-tint: rgba(46, 230, 255, 0.07);
          --accent-glow: rgba(46, 230, 255, 0.45);
          --line: rgba(163, 197, 203, 0.17);
          --line-strong: rgba(163, 197, 203, 0.28);
          --text: #d8e7ea;
          --muted: #738b90;
          --dim: #465b60;
          --bg: #04070a;
          --panel: rgba(9, 14, 18, 0.9);
          --amber: #ffb020;
          --cyan: #2ee6ff;
          --red: #ff3b30;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-chakra), "Rajdhani", ui-sans-serif, system-ui, sans-serif;
          font-variant-numeric: tabular-nums;
          user-select: none;
        }

        .rlc-root.is-player {
          background: #030507;
        }

        .rlc-mono {
          font-family: ui-monospace, "Cascadia Mono", "SFMono-Regular", Menlo,
            Consolas, "Liberation Mono", monospace;
          font-variant-numeric: tabular-nums;
        }

        /* ---------- capas ambientales ---------- */
        .rlc-grid,
        .rlc-vignette,
        .rlc-scanlines,
        .rlc-noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
        }

        .rlc-grid {
          opacity: 0.45;
          background-image:
            linear-gradient(rgba(120, 170, 180, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 170, 180, 0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 85%);
        }

        .rlc-vignette {
          background:
            radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.55) 100%),
            radial-gradient(ellipse at 50% 60%, var(--accent-tint), transparent 65%);
          transition: background 0.4s ease;
        }

        .rlc-scanlines {
          opacity: 0.35;
          background: repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.028) 0,
            rgba(255, 255, 255, 0.028) 1px,
            transparent 1px,
            transparent 3px
          );
        }

        .rlc-noise {
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
        }

        /* ---------- barra superior ---------- */
        .rlc-top {
          position: relative;
          z-index: 20;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px 16px;
          min-height: 56px;
          padding: 9px 18px;
          border-bottom: 1px solid var(--line);
          background: rgba(4, 7, 10, 0.92);
          box-shadow: inset 0 2px 0 var(--accent);
          transition: box-shadow 0.3s ease;
        }

        .rlc-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .rlc-mark {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          flex: 0 0 auto;
          border: 1px solid var(--accent-border);
          color: var(--accent);
          background: var(--accent-tint);
          box-shadow: 0 0 14px var(--accent-glow);
          font-family: ui-monospace, monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .rlc-brand-copy {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .rlc-brand-copy strong {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.24em;
          color: var(--text);
          white-space: nowrap;
        }

        .rlc-brand-copy span {
          font-size: 8px;
          letter-spacing: 0.26em;
          color: var(--muted);
          white-space: nowrap;
        }

        .rlc-top-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .rlc-top-warning {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: var(--red);
        }

        /* ---------- layout principal ---------- */
        .rlc-main {
          position: relative;
          z-index: 10;
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 392px;
          gap: 14px;
          padding: 14px 18px 18px;
        }

        .rlc-panel {
          position: relative;
          border: 1px solid var(--line);
          background:
            linear-gradient(165deg, var(--accent-tint) 0%, transparent 32%),
            linear-gradient(180deg, rgba(12, 18, 22, 0.94), rgba(5, 9, 12, 0.97));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.035),
            0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .rlc-corner {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: var(--accent);
          opacity: 0.75;
          pointer-events: none;
          z-index: 2;
        }
        .rlc-corner.tl { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
        .rlc-corner.tr { top: -1px; right: -1px; border-top: 2px solid; border-right: 2px solid; }
        .rlc-corner.bl { bottom: -1px; left: -1px; border-bottom: 2px solid; border-left: 2px solid; }
        .rlc-corner.br { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }

        /* ---------- consola central ---------- */
        .rlc-console {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 0;
          padding: clamp(16px, 2.2vw, 30px);
          overflow: hidden;
        }

        .rlc-console::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 79px,
            rgba(163, 197, 203, 0.025) 79px,
            rgba(163, 197, 203, 0.025) 80px
          );
          mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
        }

        .rlc-console-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .rlc-kicker {
          font-size: 9px;
          letter-spacing: 0.28em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .rlc-state {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--muted);
          text-transform: uppercase;
          white-space: nowrap;
        }

        .rlc-state i {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--dim);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .rlc-state.is-live {
          color: var(--accent);
        }

        .rlc-state.is-live i {
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: rlc-blink 1.4s steps(1, end) infinite;
        }

        .rlc-state.is-paused {
          color: var(--amber);
        }

        .rlc-state.is-paused i {
          background: var(--amber);
          box-shadow: 0 0 8px rgba(255, 176, 32, 0.6);
        }

        .rlc-state.is-dead {
          color: var(--red);
        }

        .rlc-state.is-dead i {
          background: var(--red);
          box-shadow: 0 0 10px rgba(255, 43, 32, 0.8);
          animation: rlc-blink 1s steps(1, end) infinite;
        }

        .rlc-scene-wrap {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px 8px;
        }

        .rlc-scene {
          margin: 0;
          font-size: clamp(13px, 1.5vw, 19px);
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-align: center;
          color: var(--text);
          overflow-wrap: anywhere;
        }

        .rlc-scene.is-empty {
          color: var(--dim);
          font-weight: 400;
        }

        .rlc-readout {
          display: flex;
          flex: 1;
          min-height: 0;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-align: center;
          padding: 6px 0;
        }

        .rlc-label {
          font-size: 9px;
          letter-spacing: 0.34em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .rlc-digits {
          font-size: clamp(4.2rem, 12.5vw, 10rem);
          font-weight: 500;
          line-height: 0.88;
          letter-spacing: -0.055em;
          color: var(--accent);
          text-shadow:
            0 0 1px var(--accent),
            0 0 22px var(--accent-glow);
          white-space: nowrap;
          padding: 0.06em 0 0.02em;
          transition: color 0.3s ease;
        }

        .rlc-digits.is-long {
          font-size: clamp(3.2rem, 9vw, 7rem);
        }

        .rlc-subreadout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 3vw, 38px);
          margin-top: clamp(6px, 1.2vh, 14px);
          flex-wrap: wrap;
        }

        .rlc-subitem {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .rlc-subitem span {
          font-size: 8px;
          letter-spacing: 0.24em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .rlc-subitem strong {
          font-size: clamp(1.35rem, 2.6vw, 2.2rem);
          font-weight: 500;
          letter-spacing: 0.02em;
          line-height: 1.15;
        }

        .rlc-amber { color: var(--amber); text-shadow: 0 0 16px rgba(255, 176, 32, 0.25); }
        .rlc-cyan { color: var(--cyan); text-shadow: 0 0 16px rgba(46, 230, 255, 0.22); }
        .rlc-danger-text { color: var(--red); }

        .rlc-subdivider {
          width: 1px;
          height: 34px;
          background: var(--line);
        }

        .rlc-expired-banner {
          font-size: clamp(10px, 1.2vw, 14px);
          font-weight: 700;
          letter-spacing: 0.42em;
          color: var(--red);
          text-shadow: 0 0 18px rgba(255, 43, 32, 0.7);
          padding-bottom: 4px;
          animation: rlc-flicker 2s steps(1, end) infinite;
        }

        .rlc-console-bottom {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rlc-urgency-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .rlc-urgency {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--accent-border);
          background: var(--accent-tint);
          color: var(--accent);
          padding: 5px 10px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .rlc-urgency i {
          width: 6px;
          height: 6px;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .rlc-urgency b {
          font-weight: 400;
          color: var(--muted);
        }

        .rlc-urgency.is-alert {
          animation: rlc-breathe 1.7s ease-in-out infinite;
        }

        .rlc-pct {
          font-size: clamp(1rem, 1.6vw, 1.35rem);
          color: var(--muted);
        }

        /* ---------- barra de progreso ---------- */
        .rlc-progress {
          position: relative;
          height: 13px;
          border: 1px solid var(--line-strong);
          background:
            repeating-linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025) 0,
              rgba(255, 255, 255, 0.025) 2.5%,
              transparent 2.5%,
              transparent 5%
            ),
            rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }

        .rlc-progress-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: var(--accent);
          box-shadow: 0 0 18px var(--accent-glow);
          transition: width 0.12s linear, background 0.3s ease;
        }

        .rlc-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.28),
            transparent 45%,
            rgba(0, 0, 0, 0.22)
          );
        }

        .rlc-progress-segments {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent calc(2.5% - 1px),
            rgba(4, 7, 10, 0.9) calc(2.5% - 1px),
            rgba(4, 7, 10, 0.9) 2.5%
          );
        }

        .rlc-progress-tick {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: rgba(255, 255, 255, 0.18);
          z-index: 2;
        }

        .rlc-console-foot {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 6px 14px;
          font-size: 8px;
          letter-spacing: 0.17em;
          color: var(--dim);
          text-transform: uppercase;
        }

        /* ---------- barra lateral ---------- */
        .rlc-rail {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .rlc-rail-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--line-strong) transparent;
        }

        .rlc-rail-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .rlc-rail-scroll::-webkit-scrollbar-thumb {
          background: var(--line-strong);
        }

        .rlc-block {
          padding: 13px 15px;
          border-bottom: 1px solid var(--line);
        }

        .rlc-block:last-child {
          border-bottom: 0;
        }

        .rlc-block-head {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
        }

        .rlc-block-head > span:first-child {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          color: var(--accent);
          letter-spacing: 0.1em;
        }

        .rlc-block-head h2 {
          margin: 0;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .rlc-controls-state {
          margin-left: auto;
          font-size: 8px;
          letter-spacing: 0.16em;
          color: var(--accent);
          text-transform: uppercase;
        }

        .rlc-block-summary {
          margin-left: auto;
          font-family: ui-monospace, monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          color: var(--dim);
          white-space: nowrap;
        }

        .rlc-collapse {
          margin-left: auto;
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          flex: 0 0 auto;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          font-family: ui-monospace, monospace;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .rlc-block-summary + .rlc-collapse {
          margin-left: 6px;
        }

        .rlc-collapse:hover {
          color: var(--accent);
          border-color: var(--accent-border);
        }

        .rlc-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .rlc-field + .rlc-field,
        .rlc-chips + .rlc-field,
        .rlc-field + .rlc-chips,
        .rlc-chips + .rlc-chips {
          margin-top: 10px;
        }

        .rlc-field label,
        .rlc-label-inline {
          font-size: 8px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted);
        }

        .rlc-field-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .rlc-field-value {
          font-family: ui-monospace, monospace;
          font-size: 9px;
          color: var(--accent);
          letter-spacing: 0.08em;
        }

        .rlc-input {
          width: 100%;
          min-width: 0;
          background: rgba(0, 0, 0, 0.38);
          border: 1px solid var(--line);
          color: var(--text);
          padding: 8px 9px;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.2;
          outline: none;
          border-radius: 0;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          user-select: text;
        }

        .rlc-input::placeholder {
          color: var(--dim);
          font-size: 11px;
          letter-spacing: 0.04em;
        }

        .rlc-input:hover:not(:disabled) {
          border-color: var(--line-strong);
        }

        .rlc-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 1px var(--accent) inset, 0 0 12px var(--accent-tint);
        }

        .rlc-input:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .rlc-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .rlc-chip {
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          padding: 3px 6px;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 0.05em;
          line-height: 1.4;
          cursor: pointer;
          text-align: left;
          transition: color 0.15s ease, border-color 0.15s ease;
          touch-action: manipulation;
        }

        .rlc-chip:hover {
          color: var(--text);
          border-color: var(--accent-border);
        }

        .rlc-chip-mono {
          font-family: ui-monospace, monospace;
          font-size: 9px;
        }

        .rlc-duration {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: end;
          gap: 6px;
        }

        .rlc-duration-part {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rlc-duration-part > span {
          font-size: 8px;
          letter-spacing: 0.18em;
          color: var(--dim);
        }

        .rlc-duration-part .rlc-input {
          font-size: 19px;
          text-align: center;
          padding: 7px 8px;
          letter-spacing: 0.1em;
        }

        .rlc-duration-colon {
          font-family: ui-monospace, monospace;
          font-size: 17px;
          color: var(--muted);
          padding-bottom: 8px;
        }

        .rlc-hint {
          display: block;
          margin-top: 6px;
          font-size: 8.5px;
          line-height: 1.5;
          letter-spacing: 0.05em;
          color: var(--dim);
        }

        .rlc-presets {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .rlc-preset {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
          border: 1px solid var(--line);
          background: transparent;
          color: var(--muted);
          padding: 7px 8px;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
          touch-action: manipulation;
        }

        .rlc-preset strong {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: 0.02em;
        }

        .rlc-preset span {
          font-size: 7px;
          letter-spacing: 0.04em;
          line-height: 1.3;
        }

        .rlc-preset:hover {
          border-color: var(--line-strong);
          color: var(--text);
        }

        .rlc-preset[data-active='true'] {
          border-color: var(--accent);
          background: var(--accent-tint);
          color: var(--accent);
          box-shadow: inset 0 0 18px var(--accent-tint);
        }

        .rlc-preset[data-active='true'] strong {
          color: var(--accent);
        }

        .rlc-custom-ratio {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 6px;
          margin-top: 5px;
        }

        .rlc-preset-custom {
          justify-content: center;
          min-width: 76px;
        }

        .rlc-custom-input {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .rlc-custom-input > span {
          font-size: 7px;
          letter-spacing: 0.1em;
          color: var(--dim);
        }

        .rlc-custom-input > div {
          display: flex;
          align-items: stretch;
        }

        .rlc-custom-input .rlc-input {
          font-size: 15px;
          padding: 6px 8px;
          text-align: center;
        }

        .rlc-custom-suffix {
          display: grid;
          place-items: center;
          padding: 0 8px;
          border: 1px solid var(--line);
          border-left: 0;
          color: var(--accent);
          font-family: ui-monospace, monospace;
          font-size: 11px;
        }

        .rlc-conversion {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 4px 10px;
          margin-top: 6px;
          font-size: 8px;
          letter-spacing: 0.05em;
          color: var(--dim);
        }

        /* ---------- acciones ---------- */
        .rlc-action-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 92px;
          gap: 7px;
          margin-top: 10px;
        }

        .rlc-ledger {
          margin-top: 10px;
          border-top: 1px solid var(--line);
          padding-top: 8px;
          min-height: 22px;
        }

        .rlc-ledger ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rlc-ledger li {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
          font-size: 9px;
          color: var(--muted);
        }

        .rlc-ledger li span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .rlc-ledger li b {
          color: var(--red);
          font-weight: 500;
          white-space: nowrap;
        }

        .rlc-ledger-total {
          display: block;
          margin-top: 6px;
          font-family: ui-monospace, monospace;
          font-size: 8px;
          letter-spacing: 0.1em;
          color: var(--dim);
        }

        /* ---------- botones ---------- */
        .rlc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: 34px;
          padding: 7px 11px;
          border: 1px solid var(--line-strong);
          background: rgba(255, 255, 255, 0.018);
          color: var(--text);
          font-family: inherit;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          border-radius: 0;
          transition:
            border-color 0.14s ease,
            background 0.14s ease,
            color 0.14s ease,
            box-shadow 0.14s ease;
          touch-action: manipulation;
          white-space: nowrap;
        }

        .rlc-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-tint);
        }

        .rlc-btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .rlc-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .rlc-btn-ghost {
          min-height: 30px;
          padding: 5px 9px;
          border-color: var(--line);
          color: var(--muted);
          background: transparent;
          font-size: 8px;
        }

        .rlc-btn-tiny {
          min-height: 26px;
          padding: 3px 8px;
          font-size: 8px;
        }

        .rlc-btn-accent {
          border-color: var(--accent-border);
          background: var(--accent-tint);
          color: var(--accent);
          box-shadow: inset 0 0 18px var(--accent-tint);
        }

        .rlc-btn-pause {
          border-color: rgba(255, 176, 32, 0.5);
          background: rgba(255, 176, 32, 0.08);
          color: var(--amber);
        }

        .rlc-btn-danger {
          border-color: rgba(255, 59, 48, 0.42);
          background: rgba(255, 59, 48, 0.06);
          color: #ff6a5f;
        }

        .rlc-btn-danger:hover:not(:disabled) {
          border-color: var(--red);
          background: rgba(255, 59, 48, 0.14);
          color: #ff8b82;
        }

        .rlc-btn-plus {
          color: var(--cyan);
          border-color: rgba(46, 230, 255, 0.25);
        }

        .rlc-btn-minus {
          color: #ff7a70;
          border-color: rgba(255, 59, 48, 0.25);
        }

        .rlc-btn-block {
          width: 100%;
          margin-top: 8px;
          min-height: 38px;
        }

        .rlc-control-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
        }

        .rlc-control-grid .rlc-btn {
          min-height: 40px;
          font-size: 10px;
        }

        .rlc-adjust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          margin-top: 5px;
        }

        .rlc-btn-small {
          flex-direction: column;
          gap: 0;
          min-height: 38px;
          padding: 4px 2px;
          letter-spacing: 0.04em;
        }

        .rlc-btn-small span {
          font-size: 11px;
          font-weight: 600;
        }

        .rlc-btn-small small {
          font-size: 6px;
          letter-spacing: 0.15em;
          opacity: 0.6;
        }

        .rlc-expired-hint {
          margin-top: 8px;
        }

        .rlc-shortcut {
          border-top: 1px solid var(--line);
          padding-top: 7px;
          margin-top: 8px;
        }

        .rlc-shortcut kbd {
          font-family: ui-monospace, monospace;
          font-size: 8px;
          color: var(--muted);
          border: 1px solid var(--line);
          padding: 1px 4px;
          margin-right: 2px;
        }

        /* ---------- pantalla jugador ---------- */
        .rlc-player {
          position: relative;
          z-index: 10;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding: clamp(14px, 2vw, 30px);
        }

        .rlc-player-hud {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .rlc-player-actions {
          display: flex;
          gap: 5px;
          opacity: 0.45;
          transition: opacity 0.2s ease;
        }

        .rlc-player-actions:hover,
        .rlc-player-actions:focus-within {
          opacity: 1;
        }

        .rlc-player-center {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: clamp(4px, 1.3vh, 16px);
          text-align: center;
          padding: 8px 0;
        }

        .rlc-player-scene {
          margin: 0;
          max-width: 92%;
          font-size: clamp(0.95rem, 1.7vw, 1.65rem);
          font-weight: 500;
          letter-spacing: 0.22em;
          line-height: 1.3;
          text-transform: uppercase;
          color: var(--muted);
          overflow-wrap: anywhere;
        }

        .rlc-player-label {
          font-size: clamp(0.58rem, 0.85vw, 0.85rem);
          font-weight: 500;
          letter-spacing: 0.4em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .rlc-player-label.is-expired {
          color: var(--red);
          text-shadow: 0 0 18px rgba(255, 43, 32, 0.7);
          animation: rlc-flicker 2s steps(1, end) infinite;
        }

        .rlc-player-digits {
          font-size: min(23vw, 40vh);
          font-weight: 500;
          line-height: 0.82;
          letter-spacing: -0.06em;
          color: var(--accent);
          text-shadow:
            0 0 2px var(--accent),
            0 0 34px var(--accent-glow),
            0 0 90px var(--accent-glow);
          white-space: nowrap;
          padding: 0.04em 0;
        }

        .rlc-player-digits.is-long {
          font-size: min(16vw, 28vh);
        }

        .rlc-player-urgency {
          margin-top: 2px;
        }

        .rlc-player-urgency .rlc-urgency {
          font-size: clamp(0.6rem, 0.9vw, 0.9rem);
          padding: 7px 13px;
          letter-spacing: 0.24em;
        }

        .rlc-player-progress {
          width: min(86vw, 1400px);
          margin-top: clamp(6px, 2vh, 22px);
        }

        .rlc-player-progress .rlc-progress {
          height: clamp(10px, 1.2vh, 16px);
        }

        .rlc-player-foot {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: clamp(24px, 6vw, 100px);
          padding-top: clamp(8px, 1.6vh, 18px);
          border-top: 1px solid var(--line);
        }

        .rlc-player-foot > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }

        .rlc-player-foot span {
          font-size: clamp(0.54rem, 0.72vw, 0.72rem);
          letter-spacing: 0.28em;
          color: var(--muted);
          text-transform: uppercase;
        }

        .rlc-player-foot strong {
          font-size: clamp(1.35rem, 2.9vw, 2.9rem);
          font-weight: 500;
          line-height: 1.1;
          color: var(--text);
        }

        .rlc-player-state-value {
          color: var(--accent);
          text-shadow: 0 0 18px var(--accent-glow);
        }

        /* ---------- estados de urgencia ---------- */
        [data-urgency='critical'] .rlc-console,
        [data-urgency='danger'] .rlc-console,
        [data-urgency='expired'] .rlc-console {
          border-color: var(--accent-border);
          box-shadow:
            inset 0 0 80px var(--accent-tint),
            0 0 32px rgba(0, 0, 0, 0.4);
        }

        [data-urgency='danger'] .rlc-console,
        [data-urgency='expired'] .rlc-console {
          animation: rlc-breathe 1.8s ease-in-out infinite;
        }

        [data-urgency='expired'] .rlc-progress {
          border-color: var(--red);
          animation: rlc-alarm 1.1s steps(1, end) infinite;
        }

        [data-urgency='expired'] .rlc-digits {
          color: var(--red);
        }

        .rlc-root.is-expired .rlc-grid {
          opacity: 0.7;
        }

        .rlc-root.is-player[data-urgency='danger'] .rlc-vignette,
        .rlc-root.is-player[data-urgency='expired'] .rlc-vignette {
          background:
            radial-gradient(ellipse at center, transparent 25%, rgba(90, 0, 0, 0.3) 100%),
            radial-gradient(ellipse at 50% 60%, var(--accent-tint), transparent 68%);
        }

        /* ---------- animaciones ---------- */
        @keyframes rlc-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }

        @keyframes rlc-breathe {
          0%, 100% {
            box-shadow:
              inset 0 0 60px var(--accent-tint),
              0 0 0 rgba(0, 0, 0, 0);
          }
          50% {
            box-shadow:
              inset 0 0 120px var(--accent-tint),
              0 0 24px var(--accent-glow);
          }
        }

        @keyframes rlc-alarm {
          0%, 100% { box-shadow: 0 0 0 rgba(255, 43, 32, 0); }
          50% { box-shadow: 0 0 22px rgba(255, 43, 32, 0.55); }
        }

        @keyframes rlc-flicker {
          0%, 92%, 100% { opacity: 1; }
          93% { opacity: 0.35; }
          95% { opacity: 1; }
          97% { opacity: 0.55; }
        }

        .rlc-copy-narrow {
          display: none;
        }

        /* ---------- responsive ---------- */
        @media (max-width: 1120px) {
          .rlc-main {
            grid-template-columns: minmax(0, 1fr) 350px;
          }
          .rlc-digits {
            font-size: clamp(3.8rem, 12vw, 8rem);
          }
        }

        @media (max-width: 980px) {
          .rlc-root.is-gm {
            height: auto;
            min-height: 100dvh;
            overflow: visible;
          }

          .rlc-top {
            position: sticky;
            top: 0;
            z-index: 30;
          }

          .rlc-main {
            display: flex;
            flex-direction: column;
            padding: 10px;
            gap: 10px;
          }

          .rlc-console {
            min-height: 48vh;
            padding: 16px 14px;
          }

          .rlc-digits {
            font-size: clamp(3.4rem, 17vw, 6.5rem);
          }

          .rlc-rail {
            overflow: visible;
          }

          .rlc-rail-scroll {
            overflow: visible;
          }

          .rlc-player {
            height: 100dvh;
          }
        }

        @media (max-width: 640px) {
          .rlc-brand-copy strong {
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .rlc-brand-copy span {
            display: none;
          }
          .rlc-top {
            padding: 8px 10px;
          }
          .rlc-top-actions {
            gap: 4px;
          }
          .rlc-copy-wide {
            display: none;
          }
          .rlc-copy-narrow {
            display: inline;
          }
          .rlc-btn {
            min-height: 32px;
            padding: 6px 8px;
            letter-spacing: 0.1em;
          }
          .rlc-console {
            min-height: 43vh;
          }
          .rlc-subreadout {
            gap: 14px;
          }
          .rlc-subitem strong {
            font-size: 1.3rem;
          }
          .rlc-player-foot {
            gap: 14px;
          }
          .rlc-player-foot span {
            font-size: 0.5rem;
            letter-spacing: 0.12em;
            text-align: center;
          }
          .rlc-player-foot strong {
            font-size: 1.05rem;
          }
          .rlc-action-grid {
            grid-template-columns: minmax(0, 1fr) 82px;
          }
          .rlc-player-digits {
            font-size: min(26vw, 34vh);
          }
          .rlc-player-digits.is-long {
            font-size: min(17vw, 24vh);
          }
        }

        @media (max-height: 760px) and (min-width: 981px) {
          .rlc-digits {
            font-size: clamp(3rem, 8.5vw, 6.4rem);
          }
          .rlc-console {
            padding: 14px 20px;
          }
          .rlc-readout {
            padding: 2px 0;
          }
          .rlc-block {
            padding: 10px 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rlc-root *,
          .rlc-root *::before,
          .rlc-root *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }

        .rlc-btn:focus-visible,
        .rlc-chip:focus-visible,
        .rlc-preset:focus-visible,
        .rlc-input:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}
