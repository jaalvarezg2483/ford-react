import { handleCalculatorGet } from './calculator'
import { handleCitas, renderCitasStep } from './citas'
import { renderComparador } from './compare'
import { renderBlog } from './blog'
import { renderSearch } from './search'
import { renderVideos } from './videos'
import { getPage, getPosts, getMediaByPath } from './data'
import { allFamilies } from './legacy-data'
import { renderTwig } from '@/legacy/twig'
import { serveMedia } from './media'
import { html } from './respond'
import { renderPage } from './render'
import { esc } from './html'
import { teaser } from './controllers'
import { absolute } from './data'

/** GET calculados en vivo (AJAX, pasos de citas, páginas de gracias, descargas). */
export async function renderDynamic(req: Request, url: URL): Promise<Response | null> {
  const p = url.pathname.replace(/\/$/, '') || '/'
  let m: RegExpExecArray | null

  const calc = await handleCalculatorGet(req, url)
  if (calc) return calc

  if ((m = /^\/citas\/(step[1-4]|scheduled-car)$/.exec(p))) return renderCitasStep(req, m[1])
  if (p === '/comparador') { const r = await renderComparador(url); if (r) return r }
  if (/^\/citas\/(getParameters|sucursals-list)$/.test(p)) return handleCitas(req, url)

  // Páginas de "gracias": todas usan la misma plantilla (gracias.html.twig).
  if (p !== '/contacto/gracias' && (/^\/contacto\/[^/]+(\/[^/]+)?\/gracias$/.test(p) || /^\/autos\/[^/]+\/[^/]+\/[^/]+\/gracias$/.test(p) || p === '/solicitar-test-drive/gracias')) {
    const own = await getPage(p)
    const base = own ?? (await getPage('/contacto/gracias'))
    if (base) return html(await renderPage({ ...base, path: p, activeMenu: own ? base.activeMenu : '', route: own ? base.route : 'thanks_route' }))
  }

  // Ficha técnica en visor (flipbook): /view-pdf/{familia}/{id}
  if ((m = /^\/view-pdf\/([^/]+)\/(\d+)$/.exec(p))) {
    const fam = (await allFamilies()).find((f) => f.slug === m![1])
    const sheet = fam?.dataSheets.find((d) => String(d.legacyId) === m![2])
    if (fam && sheet?.url) {
      const meta = (await getPage(`/autos/${fam.slug}`))?.metaHtml || ''
      const pick = (n: string) => new RegExp(`<meta name="${n}" content="([^"]*)"`).exec(meta)?.[1] ?? ''
      const body = renderTwig('Default/seeFile.html.twig', { family: { name: fam.name, getSeoDescription: () => pick('description'), getSeoTags: () => pick('keywords') }, file: { path: sheet.url.split('/').pop() } })
      return new Response(body, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } })
    }
  }

  // Fichas técnicas: /datasheet/{id}/{archivo}
  if ((m = /^\/datasheet\/(\d+)\/(.+)$/.exec(p))) {
    for (const f of await allFamilies()) {
      const d = f.dataSheets.find((x) => String(x.legacyId) === m![1])
      if (d?.url) return (await serveMedia(d.url, req)) ?? Response.redirect(new URL(d.url, url), 302)
    }
    const direct = await getMediaByPath(`/uploads/data_sheet/${m[2]}`)
    if (direct) return serveMedia(direct.legacyPath, req)
  }

  if (p === '/blog') return renderBlog(req, url)
  if (p === '/resultados' && url.searchParams.has('q')) return renderSearch(url)
  if (p === '/videos') { const r = await renderVideos(req, url, null); if (r) return r }
  if ((m = /^\/videos\/([^/]+)$/.exec(p))) { const r = await renderVideos(req, url, decodeURIComponent(m[1])); if (r) return r }
  return null
}

/** Tarjeta del listado del blog (partials/blog-results.html.twig). */
export function blogCard(p: { title: string; path: string; image: string }) {
  return `
                                    <section class="col-sm-12 col-md-3">
                        <a class="blog-link js-equal-height blog" href="${esc(p.path)}">
                            <div class="article-img">
                                <img src="${esc(absolute(teaser(p.image)))}">
                            </div>
                            <div class="card__content">
                                <h5 class="title">${esc(p.title)}</h5>
                                <p class="text--primary text--bold">Ver más <i class="icon icon-arrow-right"></i></p>
                            </div>
                        </a>
                    </section>
                    `
}
