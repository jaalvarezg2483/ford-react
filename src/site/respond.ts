import { env } from '@/lib/env'
import { getPage } from './data'
import { renderPage } from './render'
import { robotsHeader, toPublicHtml } from './public-url'

/** Respuesta HTML del sitio público (página completa o fragmento AJAX). */
export function html(body: string, status = 200): Response {
  return new Response(toPublicHtml(body), { status, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache', ...robotsHeader() } })
}

/** Misma página 404 del sitio anterior. */
export async function notFound(req?: Request): Promise<Response> {
  const page = await getPage('/__404').catch(() => null)
  if (!page) return new Response('Not Found', { status: 404 })
  return html(await renderPage(page), 404)
}

/**
 * Origen público de la petición. Detrás de Railway/Azure `req.url` trae el host
 * interno (0.0.0.0:3000), así que se usan los encabezados del proxy.
 */
export function publicOrigin(req: Request): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (host && !/^0\.0\.0\.0(:|$)/.test(host)) {
    const proto = req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || new URL(req.url).protocol.replace(':', '')
    return `${proto}://${host}`
  }
  return env.SERVER_URL
}

/** Redirección con URL absoluta pública, como `redirectToRoute` del Symfony. */
export function redirectTo(req: Request, to: string, status = 302): Response {
  const target = /^https?:\/\//.test(to) ? to : publicOrigin(req) + (to.startsWith('/') ? to : `/${to}`)
  return new Response(null, { status, headers: { Location: target } })
}
