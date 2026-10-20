/**
 * Descompone una página HTML del sitio Symfony en las piezas que guarda el CMS.
 * Trabaja sobre cortes de texto exactos (no re-serializa el DOM) para que el
 * HTML publicado sea byte a byte el mismo que el original.
 */

export const MARK = {
  footerStart: '<footer class="footer">',
  footerEnd: '</footer>',
  spinner: '<div class="spinner">',
  mainJs: '<script src="/js/main.min.js',
  captcha: "<script src='https://www.google.com/recaptcha/api.js'></script>",
  header: '<header class="header">',
  searchStart: '<div class="search">',
} as const

export const HEAD_PREFIX = '\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name=viewport content="width=device-width, initial-scale=1">\n'

export type ParsedPage = {
  template: 'default' | 'raw'
  title: string
  metaHtml: string
  headStyles: string
  headCustom: string
  bodyClass: string
  activeMenu: string
  route: string
  bodyStart: string
  seoH1: string
  chrome: string
  content: string
  footer: string
  spinner: string
  routeScript: string
  scripts: string
  tail: string
  rawDocument?: string
}

/** Fin del bloque de búsqueda: el </div> que cierra <div class="search">. */
function endOfBlock(html: string, start: number, tag = 'div'): number {
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'g')
  re.lastIndex = start
  let depth = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    if (m[0].startsWith('</')) {
      depth--
      if (depth === 0) return m.index + m[0].length
    } else depth++
  }
  return -1
}

export function parsePage(html: string): ParsedPage {
  const bodyOpen = html.indexOf('<body')
  const bodyTagEnd = html.indexOf('>', bodyOpen) + 1
  const headerAt = html.indexOf(MARK.header, bodyTagEnd)
  const footerAt = html.indexOf(MARK.footerStart, bodyTagEnd)
  const searchAt = headerAt >= 0 ? html.indexOf(MARK.searchStart, headerAt) : -1
  const spinnerAt = footerAt >= 0 ? html.indexOf(MARK.spinner, footerAt) : -1
  const mainJsAt = spinnerAt >= 0 ? html.indexOf(MARK.mainJs, spinnerAt) : -1
  const raw = (): ParsedPage => ({
    template: 'raw', title: titleOf(html), metaHtml: '', headStyles: '', headCustom: '', bodyClass: '', activeMenu: '', route: '', bodyStart: '', seoH1: '', chrome: '', content: '', footer: '', spinner: '', routeScript: '', scripts: '', tail: '', rawDocument: html,
  })
  if (bodyOpen < 0 || headerAt < 0 || footerAt < 0 || searchAt < 0 || spinnerAt < 0 || mainJsAt < 0) return raw()

  const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'))
  const headParts = splitHead(head)
  if (!headParts) return raw()
  const { metaHtml, headStyles, headCustom } = headParts

  const bodyTag = html.slice(bodyOpen, bodyTagEnd)
  const bodyClass = /class="([^"]*)"/.exec(bodyTag)?.[1] ?? ''
  const beforeHeader = html.slice(bodyTagEnd, headerAt)
  const h1Re = /\s*<h1 style="display: none">[\s\S]*?<\/h1>\s*$/
  const h1Match = h1Re.exec(beforeHeader)
  const seoH1 = h1Match ? h1Match[0] : ''
  const bodyStart = h1Match ? beforeHeader.slice(0, h1Match.index) : beforeHeader
  const searchEnd = endOfBlock(html, searchAt)
  const chrome = html.slice(headerAt, searchEnd)
  const content = html.slice(searchEnd, footerAt)
  const footerEnd = html.indexOf(MARK.footerEnd, footerAt) + MARK.footerEnd.length
  const footer = html.slice(footerAt, footerEnd)
  const spinner = html.slice(footerEnd, mainJsAt)
  // main.min.js + script de ruta
  const afterMain = html.indexOf('</script>', mainJsAt) + 9
  const routeEnd = html.indexOf('</script>', afterMain) + 9
  const routeScript = html.slice(afterMain, routeEnd)
  const bodyClose = html.lastIndexOf('</body>')
  const captchaAt = html.indexOf(MARK.captcha, routeEnd)
  const scriptsEnd = captchaAt >= 0 ? captchaAt : bodyClose
  const activeMenu = [...chrome.matchAll(/<(?:a|button)\b[^>]*class="menu__item[^"]*\bactive\b[^"]*"[^>]*>/g)]
    .map((m) => (/data-sub="subNuevos"/.test(m[0]) ? 'subNuevos' : /href="([^"]*)"/.exec(m[0])?.[1] ?? ''))
    .filter(Boolean)
    .join(',')
  const route = /var route = "([^"]*)"/.exec(routeScript)?.[1] ?? ''
  return {
    template: 'default',
    activeMenu,
    route,
    title: titleOf(html),
    metaHtml,
    headStyles,
    headCustom,
    bodyClass,
    bodyStart,
    seoH1,
    chrome,
    content,
    footer,
    spinner,
    routeScript,
    scripts: html.slice(routeEnd, scriptsEnd),
    tail: html.slice(scriptsEnd, bodyClose),
  }
}

export function titleOf(html: string): string {
  const m = /<title>([\s\S]*?)<\/title>/.exec(html)
  return m ? decodeEntities(m[1].trim()) : ''
}

export function decodeEntities(s: string): string {
  return s.replace(/&#0*39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
}

/**
 * El <head> del Symfony: [meta + OG] GTM <title> íconos [stylesheet] CSS comunes
 * jQuery site24x7 [upperscripts + customStyles]. Guardamos solo los bloques entre
 * corchetes; el resto lo arma la plantilla (src/site/shell.ts).
 */
export function splitHead(head: string): { metaHtml: string; headStyles: string; headCustom: string } | null {
  const gtm = head.indexOf('<!-- Google Tag Manager -->')
  const theme = '<meta name="theme-color" content="#ffffff">'
  const themeAt = head.indexOf(theme)
  const icomoon = head.indexOf('<link href="/icomoon/style.css')
  const rum = head.indexOf('var rumMOKey=')
  const rumEnd = rum >= 0 ? head.indexOf('</script>', rum) + 9 : -1
  if (gtm < 0 || themeAt < 0 || icomoon < themeAt || rumEnd < 9) return null
  return {
    metaHtml: head.slice(0, gtm).replace(HEAD_PREFIX, ''),
    headStyles: head.slice(themeAt + theme.length, icomoon),
    headCustom: head.slice(rumEnd),
  }
}

/** Bloques dinámicos del CMS anterior: <div data-controller="X" data-parameters="Y">…</div>. */
export function emptyControllers(content: string, known: Set<string>): string {
  let out = ''
  let i = 0
  const re = /<div data-controller="([^"]+)"( data-parameters="[^"]*")?>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    if (!known.has(m[1])) continue
    const end = endOfBlock(content, m.index)
    if (end < 0) continue
    out += content.slice(i, m.index) + m[0] + '</div>'
    i = end
    re.lastIndex = end
  }
  return out + content.slice(i)
}
