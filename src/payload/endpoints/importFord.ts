import type { Endpoint } from 'payload'

/**
 * Importación desde ford.cr lanzada desde el servidor (Railway/Azure tienen
 * salida a internet y los archivos quedan en su almacenamiento). Solo administradores.
 *   POST /api/import-ford   → inicia
 *   GET  /api/import-ford   → estado y bitácora
 */
const state: { running: boolean; startedAt?: string; finishedAt?: string; error?: string; log: string[] } = { running: false, log: [] }

const isAdmin = (user: unknown) => (user as { role?: string } | null)?.role === 'admin'

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
      const { runImport } = await import('../../import/run')
      Object.assign(state, { running: true, startedAt: new Date().toISOString(), finishedAt: undefined, error: undefined, log: [] })
      const log = (...a: unknown[]) => { state.log.push(`${new Date().toISOString()} ${a.map(String).join(' ')}`); if (state.log.length > 500) state.log.shift(); console.log('[import]', ...a) }
      runImport(req.payload, { source: 'live', log })
        .catch((error) => { state.error = (error as Error).message; log('error', (error as Error).message) })
        .finally(() => { state.running = false; state.finishedAt = new Date().toISOString() })
      return Response.json({ started: true })
    },
  },
]
