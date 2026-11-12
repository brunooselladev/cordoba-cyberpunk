# Persistencia del sitio

El mapa de conexiones ya no guarda en `localStorage`. Ahora los datos viven en el
servidor y se comparten entre navegadores y dispositivos.

## Cómo funciona

Hay una API genérica para guardar cualquier documento JSON:

```text
GET /api/documents/:clave   -> { key, data, updatedAt }  (404 si no existe)
PUT /api/documents/:clave   -> guarda { nodes, edges, ... } y devuelve updatedAt
```

El mapa usa la clave `mapa-conexiones`. Cuando abrís la página:

1. Pide el documento al servidor.
2. Si existe, lo muestra.
3. Si no existe, muestra el mapa base.
4. Al primer cambio, guarda todo el mapa en el servidor.
5. Si había datos viejos en `localStorage`, los migra una sola vez y borra la
   copia del navegador.

Los guardados se agrupan con un pequeño retraso para no mandar una petición por
cada tecla. Si falla, el estado del panel "Respaldo" muestra el error y reintenta.

## Desarrollo local

Si no existe `DATABASE_URL`, se usa SQLite a través de `node:sqlite` y el archivo
queda en:

```text
data/site.db
```

Esa carpeta está ignorada por git. Para respaldarla, copiá el archivo (mejor con
el servidor detenido) o usá el botón **Exportar** del mapa.

Al vincular el proyecto con Vercel, el CLI descarga las variables de desarrollo
en `.env.local`. Como ese archivo incluye `DATABASE_URL`, `pnpm dev` también usa
Postgres (la misma base de producción). Si querés volver a SQLite en local,
comentá o borrá `DATABASE_URL` de `.env.local`; el código vuelve solo a SQLite.

## Producción

Ya está configurado:

- Proyecto Vercel: `brunoosellas-projects/cordoba-cyberpunk`
- URL: https://cordoba-cyberpunk-lac.vercel.app
- Base: Neon `cordoba-cyberpunk-db`, plan Free, región `gru1` (São Paulo)
- Variables `DATABASE_URL` y `POSTGRES_URL` cargadas en Production, Preview y
  Development

La tabla `documents` se crea sola la primera vez. Para volver a desplegar:

```bash
vercel deploy --prod
```

Si algún día cambiás de proveedor (Supabase, Vercel Postgres, etc.), alcanza con
cambiar `DATABASE_URL` en las variables del proyecto y redeployar.

## Para agregar otra cosa persistente

Desde un componente React:

```ts
import { getSiteDocument, putSiteDocument } from '@/lib/site-document'

const guardado = await getSiteDocument<MiTipo>('mi-clave')
if (guardado) {
  // guardado.data
}

await putSiteDocument('mi-clave', { loQueSea: true })
```

La clave tiene que ser minúsculas, números, punto, guion o guion bajo, y empezar
con letra o número. El límite por documento es 2 MB.

## Seguridad

La API no tiene autenticación: cualquiera que pueda entrar al sitio puede leer y
escribir documentos. Para un uso privado está bien; si el sitio va a ser público,
conviene agregar una clave de edición o proteger `/api/documents` con el login
del hosting.
