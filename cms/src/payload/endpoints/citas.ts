import type { Endpoint } from 'payload'
import { GatewayUnavailable } from '../../lib/gateway'
import { dispatch } from '../../lib/citas/flow'
import { json, readFields } from '../../lib/http'
import { getSession, withSession } from '../../lib/session'

function citasHandler(action: string): Endpoint['handler'] {
  return async (req) => {
    const request = req as Request
    const session = await getSession(request)
    try {
      const fields = request.method === 'POST' ? await readFields(request) : {}
      const result = await dispatch(action, fields, session, new URL(request.url, 'http://localhost'))
      await session.save()
      return result ? withSession(result, session) : json({}, 404, session)
    } catch (error) {
      if (error instanceof GatewayUnavailable) return json({ status: false, error: 'Servicio de citas no disponible' }, 503, session)
      console.error(`Citas ${action} falló`, error instanceof Error ? error.message : error)
      return json({ status: false, error: 'Error' }, 500, session)
    }
  }
}

/**
 * Citas de taller (microservicios Purdy).
 * Cada endpoint queda en /api/<path> (no usar nombres de colecciones: leads, pages, posts, families, media…).
 */
export const citasEndpoints: Endpoint[] = [
  { path: '/citas/session', method: 'get', handler: citasHandler('session') },
  { path: '/citas/user-vehicles', method: 'post', handler: citasHandler('user-vehicles') },
  { path: '/citas/validate-odometer', method: 'post', handler: citasHandler('validate-odometer') },
  { path: '/citas/available-schedules', method: 'post', handler: citasHandler('available-schedules') },
  { path: '/citas/cancel-appointment', method: 'post', handler: citasHandler('cancel-appointment') },
  { path: '/citas/create-appointment', method: 'post', handler: citasHandler('create-appointment') },
  { path: '/citas/sucursals-list', method: 'post', handler: citasHandler('sucursals-list') },
  { path: '/citas/save/details', method: 'post', handler: citasHandler('save/details') },
  { path: '/citas/save/branch/date', method: 'post', handler: citasHandler('save/branch/date') },
  { path: '/citas/delete_plate', method: 'post', handler: citasHandler('delete_plate') },
  { path: '/citas/getParameters', method: 'get', handler: citasHandler('getParameters') },
]
