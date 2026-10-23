import { timingSafeEqual } from 'node:crypto'
import type { Endpoint, Payload, PayloadRequest } from 'payload'

/**
 * Importación desde ford.cr lanzada desde el servidor (Railway/Azure tienen
 * salida a internet y los archivos quedan en su almacenamiento). Solo administradores.
 *   POST /api/import-ford   → inicia
 *   GET  /api/import-ford   → estado y bitácora
 */
const state: { running: boolean; startedAt?: string; finishedAt?: string; error?: string; log: string[] } = { running: false, log: [] }

const isAdmin = (user: unknown) => (user as { role?: string } | null)?.role === 'admin'

function hasBootstrapToken(req: PayloadRequest) {
  const expected = process.env.FORD_IMPORT_BOOTSTRAP_TOKEN
  const supplied = req.headers.get('x-ford-import-token')
    ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!expected || !supplied) return false
  const separator = expected.indexOf('.')
  const expiresAt = Number(expected.slice(0, separator))
  if (separator < 1 || !Number.isFinite(expiresAt) || expiresAt <= Date.now() / 1000) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(supplied)
  return a.length === b.length && timingSafeEqual(a, b)
}

function startImport(payload: Payload) {
  if (state.running) return false
  Object.assign(state, { running: true, startedAt: new Date().toISOString(), finishedAt: undefined, error: undefined, log: [] })
  const log = (...a: unknown[]) => {
    state.log.push(`${new Date().toISOString()} ${a.map(String).join(' ')}`)
    if (state.log.length > 500) state.log.shift()
    console.log('[import]', ...a)
  }
  import('../../import/run')
    .then(({ runImport }) => runImport(payload, { source: 'live', log }))
    .catch((error) => { state.error = (error as Error).message; log('error', (error as Error).message) })
    .finally(() => { state.running = false; state.finishedAt = new Date().toISOString() })
  return true
}

export const importFordEndpoints: Endpoint[] = [
  {
    path: '/import-ford',
    method: 'get',
    handler: async (req) => (isAdmin(req.user) ? Response.json(state) : Response.json({ error: 'No autorizado' }, { status: 403 })),
  },
  {
    path: '/import-ford',
    method: 'post',
    handler: async (req) => {
      if (!isAdmin(req.user)) return Response.json({ error: 'No autorizado' }, { status: 403 })
      if (state.running) return Response.json({ error: 'Ya hay una importación en curso', state }, { status: 409 })
      return Response.json({ started: startImport(req.payload) })
    },
  },
  {
    // Pipeline-only first-run bootstrap. Inert unless the pipeline supplies
    // a random token, then removes the app setting after the import completes.
    path: '/import-ford/bootstrap',
    method: 'get',
    handler: async (req) => hasBootstrapToken(req)
      ? Response.json({ running: state.running, finishedAt: state.finishedAt, error: Boolean(state.error) })
      : Response.json({ error: 'No autorizado' }, { status: 403 }),
  },
  {
    path: '/import-ford/bootstrap',
    method: 'post',
    handler: async (req) => {
      if (!hasBootstrapToken(req)) return Response.json({ error: 'No autorizado' }, { status: 403 })
      if (state.running) return Response.json({ error: 'Ya hay una importación en curso' }, { status: 409 })
      return Response.json({ started: startImport(req.payload) }, { status: 202 })
    },
  },
]
