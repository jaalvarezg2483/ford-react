import type { Payload } from 'payload'
import { CONTENT_PATHS, importContentPages } from '../../import/contentPages'
import { bumpSiteVersion } from '../../lib/siteVersion'

/**
 * En Railway/Azure el dump a veces llega sin `content-pages`. Las crea al arrancar
 * (HTML archivado en `pages` o, si falta, el sitio publicado) sin pisar lo ya editado.
 */
export async function seedContentPages(payload: Payload) {
  const res = await payload.find({ collection: 'content-pages', limit: 500, depth: 0, pagination: false, overrideAccess: true })
  const have = new Set((res.docs as { path?: string }[]).map((d) => d.path).filter(Boolean))
  const missing = CONTENT_PATHS.filter((p) => !have.has(p))
  if (!missing.length) return
  payload.logger.info({ missing }, 'Sembrando páginas de contenido que faltan en el CMS')
  await importContentPages(payload, (m) => payload.logger.info(String(m)), { only: missing, createOnly: true })
  bumpSiteVersion()
}
