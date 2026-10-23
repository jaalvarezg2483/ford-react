import type { Endpoint } from 'payload'
import { getContentPage } from '../../lib/contentPages'
import { json, queryOf } from '../../lib/http'

/** Páginas de contenido administrables: GET /api/content-page?path=/servicios */
export const contentEndpoints: Endpoint[] = [
  {
    path: '/content-page',
    method: 'get',
    handler: async (req) => {
      const path = (queryOf(req as Request).get('path') || '').replace(/\/$/, '')
      const page = path.startsWith('/') ? await getContentPage(path) : null
      return page ? json(page) : json({ error: 'No encontrada' }, 404)
    },
  },
]
