import * as cheerio from 'cheerio'

const ALLOWED_IFRAME = /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)\//i

/**
 * Limpia el HTML editorial de un artículo: sin scripts, estilos globales, manejadores
 * de eventos ni enlaces javascript:. Solo se permiten iframes de YouTube y Vimeo.
 */
export function sanitizeArticleHtml(html: string): string {
  if (!html) return ''
  const $ = cheerio.load(html, null, false)
  $('script, style, link, meta, object, embed, form, base, noscript').remove()
  $('iframe').each((_, el) => {
    $(el).removeAttr('srcdoc').removeAttr('srcDoc').removeAttr('sandbox')
    const src = $(el).attr('src') || ''
    if (!ALLOWED_IFRAME.test(src)) $(el).remove()
  })
  $('*').each((_, el) => {
    if (el.type !== 'tag') return
    for (const name of Object.keys(el.attribs)) {
      const value = el.attribs[name] ?? ''
      if (/^on/i.test(name)) $(el).removeAttr(name)
      else if (['href', 'src', 'xlink:href', 'action', 'formaction'].includes(name) && /^\s*(javascript|data:text\/html|vbscript):/i.test(value)) {
        if (/javascript:history/i.test(value) && name === 'href') {
          $(el).attr('href', '#')
          $(el).addClass('js-history-back')
        } else $(el).removeAttr(name)
      }
    }
    if (el.name === 'a' && el.attribs.target === '_blank') $(el).attr('rel', 'noopener noreferrer')
  })
  return $.html()
}
