import { NextResponse } from 'next/server'
import { getDocumentStore } from '@/lib/server/document-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const KEY_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/
const MAX_BODY_BYTES = 2 * 1024 * 1024

type RouteContext = {
  params: Promise<{ key: string }>
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(_request: Request, context: RouteContext) {
  const { key } = await context.params

  if (!KEY_PATTERN.test(key)) {
    return jsonError('Clave inválida.')
  }

  try {
    const document = await (await getDocumentStore()).get(key)

    if (!document) {
      return jsonError('El documento no existe.', 404)
    }

    return NextResponse.json(
      { key, ...document },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error(`[documents] No se pudo leer "${key}"`, error)
    return jsonError('No se pudo leer el documento.', 500)
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { key } = await context.params

  if (!KEY_PATTERN.test(key)) {
    return jsonError('Clave inválida.')
  }

  const raw = await request.text()

  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return jsonError('El documento supera el límite de 2 MB.', 413)
  }

  let data: unknown

  try {
    data = JSON.parse(raw)
  } catch {
    return jsonError('El cuerpo no es JSON válido.')
  }

  if (data === null || typeof data !== 'object') {
    return jsonError('El documento debe ser un objeto o un array JSON.')
  }

  try {
    const saved = await (await getDocumentStore()).put(key, data)

    return NextResponse.json({ key, ...saved })
  } catch (error) {
    console.error(`[documents] No se pudo guardar "${key}"`, error)
    return jsonError('No se pudo guardar el documento.', 500)
  }
}
