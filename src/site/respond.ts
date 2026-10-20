import { getPage } from './data'
import { renderPage } from './render'

export function html(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'Cache-Control': 'no-cache' } })
}

/** Misma página 404 del sitio anterior. */
export async function notFound(req?: Request): Promise<Response> {
  const page = await getPage('/__404').catch(() => null)
  if (!page) return new Response('Not Found', { status: 404 })
  return html(await renderPage(page), 404)
}
