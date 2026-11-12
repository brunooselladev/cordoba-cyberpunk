import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'

/**
 * Almacenamiento de documentos JSON del sitio.
 *
 * - En desarrollo (o en cualquier host con disco persistente) usa SQLite con
 *   `node:sqlite`, sin dependencias nativas ni servicios externos.
 * - Si existe `DATABASE_URL`, usa Postgres. Eso permite desplegar en Vercel,
 *   Neon, Supabase, etc. sin cambiar el código de las rutas.
 *
 * La tabla es genérica a propósito: guarda `{ key, data, updatedAt }` para que
 * el mapa de conexiones y cualquier función futura compartan la misma base.
 */

export type StoredDocument = {
  data: unknown
  updatedAt: string
}

type DocumentBackend = {
  get(key: string): Promise<StoredDocument | null>
  put(key: string, data: unknown): Promise<StoredDocument>
}

type GlobalWithStore = typeof globalThis & {
  __cordobaDocumentBackend?: Promise<DocumentBackend>
}

const globalWithStore = globalThis as GlobalWithStore

export function getDocumentStore(): Promise<DocumentBackend> {
  if (!globalWithStore.__cordobaDocumentBackend) {
    globalWithStore.__cordobaDocumentBackend = createBackend()
  }

  return globalWithStore.__cordobaDocumentBackend
}

async function createBackend(): Promise<DocumentBackend> {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL

  if (connectionString) {
    return createPostgresBackend(connectionString)
  }

  if (process.env.VERCEL) {
    throw new Error(
      'Falta DATABASE_URL (o POSTGRES_URL). Vercel no tiene disco persistente, así que SQLite no sirve en producción.',
    )
  }

  return createSqliteBackend()
}

function resolveSqlitePath() {
  if (process.env.SITE_DB_PATH) {
    return path.resolve(process.env.SITE_DB_PATH)
  }

  return path.join(process.cwd(), 'data', 'site.db')
}

function createSqliteBackend(): DocumentBackend {
  const dbPath = resolveSqlitePath()
  mkdirSync(path.dirname(dbPath), { recursive: true })

  const db = new DatabaseSync(dbPath)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS documents (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)

  const select = db.prepare(
    'SELECT data, updated_at FROM documents WHERE key = ?',
  )
  const upsert = db.prepare(`
    INSERT INTO documents (key, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `)

  return {
    async get(key) {
      const row = select.get(key) as
        | { data: string; updated_at: string }
        | undefined

      if (!row) return null

      return {
        data: JSON.parse(row.data),
        updatedAt: row.updated_at,
      }
    },

    async put(key, data) {
      const updatedAt = new Date().toISOString()
      upsert.run(key, JSON.stringify(data), updatedAt)

      return { data, updatedAt }
    },
  }
}

async function createPostgresBackend(
  connectionString: string,
): Promise<DocumentBackend> {
  const { Pool } = await import('pg')
  const pool = new Pool({ connectionString })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      key TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  return {
    async get(key) {
      const result = await pool.query(
        'SELECT data, updated_at FROM documents WHERE key = $1',
        [key],
      )

      if (result.rowCount === 0) return null

      const row = result.rows[0] as { data: unknown; updated_at: Date | string }

      return {
        data: row.data,
        updatedAt: new Date(row.updated_at).toISOString(),
      }
    },

    async put(key, data) {
      const result = await pool.query(
        `INSERT INTO documents (key, data, updated_at)
         VALUES ($1, $2::jsonb, now())
         ON CONFLICT (key) DO UPDATE SET
           data = excluded.data,
           updated_at = now()
         RETURNING updated_at`,
        [key, JSON.stringify(data)],
      )

      const row = result.rows[0] as { updated_at: Date | string }

      return {
        data,
        updatedAt: new Date(row.updated_at).toISOString(),
      }
    },
  }
}
