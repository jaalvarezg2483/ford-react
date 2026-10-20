import { getPage, getRedirect } from '@/site/data'
import { handleForm } from '@/site/forms'
import { html, notFound } from '@/site/respond'
import { renderPage } from '@/site/render'
import { renderDynamic } from '@/site/dynamic'
import { applyCalculatorSession } from '@/site/calculator'
import { withSession } from '@/site/session'
import { snippetModal } from '@/site/snippet'
import { syncPrices } from '@/site/prices'

export const dynamic = 'force-dynamic'

/** Sitio público: cada ruta del Symfony se resuelve contra el CMS. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') || '/' : '/'
  const dynamicResponse = await renderDynamic(req, url)
  if (dynamicResponse) return dynamicResponse
  const redirect = (url.search ? await getRedirect(pathname + url.search) : null) ?? await getRedirect(pathname)
  if (redirect) return Response.redirect(new URL(redirect.to, url), redirect.permanent ? 301 : 302)
  let page = (url.search ? await getPage(pathname + url.search) : null) ?? await getPage(pathname) ?? (url.pathname !== pathname ? await getPage(url.pathname) : await getPage(pathname + '/'))
  if (!page) return notFound(req)

  page = await syncPrices(page)
  const calc = await applyCalculatorSession(req, url, page.content || '')
  if (calc) page = { ...page, content: calc.content }
  const modal = snippetModal(req)
  if (modal) page = { ...page, content: (page.content || '') + modal.html }

  let res = html(await renderPage(page), page.httpStatus || 200)
  if (calc) { await calc.session.save(); res = withSession(res, calc.session) }
  if (modal) res.headers.append('Set-Cookie', 'snippet_sended=; Path=/; Max-Age=0')
  return res
}

export const HEAD = GET

export async function POST(req: Request) {
  const url = new URL(req.url)
  // El formulario de reserva hace su envío final a /contacto/gracias (los datos ya se guardaron por AJAX).
  if (url.pathname === '/contacto/gracias') return GET(req)
  return (await handleForm(req)) ?? notFound(req)
}
