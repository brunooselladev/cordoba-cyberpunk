/**
 * Cliente para guardar cualquier contenido del sitio en el servidor.
 *
 * Ejemplo:
 *   const mapa = await getSiteDocument<Mapa>('mapa-conexiones')
 *   await putSiteDocument('mapa-conexiones', mapa)
 *
 * No usa localStorage: el dato vive en la base del servidor.
 */

type SiteDocumentResponse<T> = {
  key: string
  data: T
  updatedAt: string
}

export async function getSiteDocument<T>(
  key: string,
): Promise<{ data: T; updatedAt: string } | null> {
  const response = await fetch(`/api/documents/${encodeURIComponent(key)}`, {
    cache: 'no-store',
  })

  if (response.status === 404) return null

  if (!response.ok) {
    throw new Error(`No se pudo leer "${key}" (HTTP ${response.status}).`)
  }

  const payload = (await response.json()) as SiteDocumentResponse<T>

  return { data: payload.data, updatedAt: payload.updatedAt }
}

export async function putSiteDocument<T>(
  key: string,
  data: T,
): Promise<{ data: T; updatedAt: string }> {
  const response = await fetch(`/api/documents/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`No se pudo guardar "${key}" (HTTP ${response.status}).`)
  }

  const payload = (await response.json()) as SiteDocumentResponse<T>

  return { data: payload.data, updatedAt: payload.updatedAt }
}
