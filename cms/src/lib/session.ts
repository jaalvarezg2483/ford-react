import { randomBytes } from 'node:crypto'
import type { Pool } from 'pg'
import { payloadClient } from './payload'

/**
 * Sesión del visitante (equivalente a la sesión PHP del Symfony): guarda la
 * calculadora, los accesorios elegidos y el avance de citas. Cookie httpOnly
 * con un id aleatorio; los datos viven en PostgreSQL (tabla site_sessions).
 */
const COOKIE = 'FORDSESSID'
const MAX_AGE_S = 60 * 60 * 24

export type Session = {
  id: string
  isNew: boolean
  data: Record<string, any>
  get(key: string, fallback?: any): any
  set(key: string, value: unknown): void
  remove(key: string): void
  save(): Promise<void>
  cookie(): string | null
}

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie') || ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

async function pool() {
  const payload = await payloadClient()
  return (payload.db as any).pool as Pool
}

export async function getSession(req: Request): Promise<Session> {
  let id = readCookie(req, COOKIE)
  let data: Record<string, any> = {}
  let isNew = false
  if (id && /^[a-f0-9]{48}$/.test(id)) {
    const res = await (await pool()).query("SELECT data FROM site_sessions WHERE id = $1 AND updated_at > now() - interval '1 day'", [id])
    if (res.rows[0]) data = res.rows[0].data
  } else {
    id = randomBytes(24).toString('hex')
    isNew = true
  }
  let dirty = false
  const sid = id!
  return {
    id: sid,
    isNew,
    data,
    get: (key, fallback) => (key in data && data[key] !== null && data[key] !== undefined ? data[key] : fallback),
    set: (key, value) => { data[key] = value; dirty = true },
    remove: (key) => { if (key in data) { delete data[key]; dirty = true } },
    async save() {
      if (!dirty && !isNew) return
      await (await pool()).query(
        'INSERT INTO site_sessions (id, data, updated_at) VALUES ($1, $2, now()) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()',
        [sid, JSON.stringify(data)],
      )
      dirty = false
      // Limpieza ocasional de sesiones vencidas para que la tabla no crezca sin límite.
      if (Math.random() < 0.01) {
        void (await pool()).query("DELETE FROM site_sessions WHERE updated_at < now() - interval '2 days'").catch(() => {})
      }
    },
    cookie: () => (isNew ? `${COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_S}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}` : null),
  }
}

/** Agrega la cookie de sesión (si es nueva) a una respuesta. */
export function withSession(res: Response, session: Session): Response {
  const c = session.cookie()
  if (c) res.headers.append('Set-Cookie', c)
  return res
}
