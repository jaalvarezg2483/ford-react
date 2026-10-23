/**
 * Metadatos de cada página (título, descripción, imagen para redes). Los usan dos lados con la
 * misma lógica: el servidor, para entregar el HTML inicial con los metadatos correctos
 * (buscadores y vistas previas de redes que no ejecutan JavaScript), y el sitio React al navegar.
 */
import moduleHeads from './heads/index.mjs'

export const SITE_SUFFIX = 'Ford Costa Rica | Grupo Purdy'

const escapeHtml = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const absolute = (origin, path) => (!path ? '' : /^https?:\/\//.test(path) ? path : `${origin}${path}`)

/**
 * @param {string} pathname ruta sin barra final
 * @param {URLSearchParams} _params
 * @param {any} content catálogo publicado (puede ser null si el CMS no responde)
 * @param {string} origin dominio público
 * @returns {{ title: string; description: string; image: string; url: string; noindex: boolean }}
 */
export function headFor(pathname, _params, content, origin) {
  const url = `${origin}${pathname === '/' ? '' : pathname}`
  const base = { title: SITE_SUFFIX, description: '', image: '', url, noindex: false }
  if (!content) return base
  if (pathname === '/') return { ...base, title: content.home.title || SITE_SUFFIX, description: content.home.description || '' }

  let m = /^\/autos\/([^/]+)(\/galeria)?$/.exec(pathname)
  if (m) {
    const family = content.families.find((f) => f.slug === decodeURIComponent(m[1]))
    if (!family) return { ...base, noindex: true }
    const gallery = Boolean(m[2])
    return {
      ...base,
      // Igual que ford.cr: la ficha usa el título de la ficha ("Ford Ranger XLT | …"); la galería, el nombre.
      title: gallery ? `${family.name} | ${SITE_SUFFIX}` : family.leadTitle || `Ford ${family.name} | ${SITE_SUFFIX}`,
      description: family.tagline || family.leadText || '',
      image: absolute(origin, family.menuImage || family.homeImage),
    }
  }
  if (pathname === '/blog') return { ...base, title: `Blog | ${SITE_SUFFIX}`, description: 'Noticias, consejos y novedades de Ford Costa Rica.' }
  m = /^\/blog\/categorias\/([^/]+)$/.exec(pathname)
  if (m) return { ...base, title: `Blog | ${SITE_SUFFIX}`, description: 'Noticias, consejos y novedades de Ford Costa Rica.' }
  m = /^\/blog\/([^/]+)$/.exec(pathname)
  if (m) {
    const post = content.posts.find((p) => p.path === pathname)
    if (!post) return { ...base, noindex: true }
    return { ...base, title: `${post.title} | ${SITE_SUFFIX}`, description: post.summary || '', image: absolute(origin, post.image) }
  }
  if (pathname === '/comparador') return { ...base, title: `Comparar Vehículos | ${SITE_SUFFIX}`, description: 'Compare modelos Ford: precio, cuota aproximada y especificaciones.' }
  for (const rule of moduleHeads) {
    const match = rule.test.exec(pathname)
    if (match) return { ...base, ...rule.head(match, { content, origin, suffix: SITE_SUFFIX }) }
  }
  return base
}

/** Pone título y metadatos en el HTML inicial (entre las marcas <!--seo:start--> y <!--seo:end-->). */
export function injectHead(html, head) {
  const tags = [
    `<title>${escapeHtml(head.title)}</title>`,
    head.description ? `<meta name="description" content="${escapeHtml(head.description)}" />` : '',
    `<meta property="og:site_name" content="Ford" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(head.title)}" />`,
    head.description ? `<meta property="og:description" content="${escapeHtml(head.description)}" />` : '',
    head.image ? `<meta property="og:image" content="${escapeHtml(head.image)}" />` : '',
    `<meta property="og:url" content="${escapeHtml(head.url)}" />`,
    head.noindex ? '<meta name="robots" content="noindex" />' : '',
  ].filter(Boolean).join('\n    ')
  return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    ${tags}\n    <!--seo:end-->`)
}
