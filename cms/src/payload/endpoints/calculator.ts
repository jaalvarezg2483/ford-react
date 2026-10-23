import type { Endpoint } from 'payload'
import { calculators } from '../../lib/data'
import { json } from '../../lib/http'

/**
 * Calculadora, selección de modelos, accesorios, PDF de cotización y datos de apoyo.
 * Cada endpoint queda en /api/<path> (no usar nombres de colecciones: leads, pages, posts, families, media…).
 */
export const calculatorEndpoints: Endpoint[] = [
  {
    path: '/calculator/entities',
    method: 'get',
    handler: async () => json(await calculators()),
  },
]
