/**
 * Metadatos de las páginas de contenido (colección content-pages del CMS).
 * Gana la primera regla que coincide; este módulo va al final (comodín).
 */
const SITE_SUFFIX = 'Ford Costa Rica | Grupo Purdy'

/** @type {Array<{ test: RegExp; head: (m: RegExpExecArray, ctx: { content: any; origin: string; suffix: string }) => { title?: string; description?: string; image?: string; noindex?: boolean } }>} */
export default [
  {
    test: /^\/.+/,
    head: (_m, { content, origin, suffix }) => {
      const path = _m.input
      const page = (content.pages || []).find((p) => p.path === path)
      if (!page) return { noindex: true }
      const image = page.image ? (/^https?:/.test(page.image) ? page.image : `${origin}${page.image}`) : ''
      const title = page.title.includes(SITE_SUFFIX) || page.title.includes(suffix) ? page.title : `${page.title} | ${suffix}`
      return { title, description: page.description || '', image }
    },
  },
]
