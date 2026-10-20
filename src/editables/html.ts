/**
 * Contenido editable sin HTML.
 *
 * El HTML original de cada página (copiado de ford.cr) se conserva intacto y oculto.
 * De él se extraen "piezas editables": textos, imágenes, enlaces, videos y datos SEO,
 * cada una con su posición exacta. Al publicar se vuelven a poner en su lugar; si una
 * pieza no se cambió se emite el texto original byte a byte, así que la página se ve
 * exactamente igual que antes.
 */

export type EditableKind = 'text' | 'image' | 'link' | 'video' | 'meta'
export type EditableSource = 'content' | 'metaHtml' | 'seoH1' | 'rawDocument' | 'html'

export type Editable = {
  key: string
  kind: EditableKind
  source: EditableSource
  section: string
  label: string
  start: number
  end: number
  raw: string
  original: string
  /** Valor actual (texto, URL o ruta). Igual a `original` mientras nadie lo cambie. */
  value: string
  /** Comilla del atributo, para escapar bien un valor nuevo. */
  quote?: '"' | "'" | ''
  multiline?: boolean
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
const RAW_TEXT = new Set(['script', 'style', 'noscript', 'template', 'textarea', 'svg', 'math', 'title'])
const SECTION_TAGS = new Set(['section', 'header', 'article', 'aside', 'nav', 'footer', 'main'])

const TEXT_LABEL: Record<string, string> = {
  h1: 'Título principal', h2: 'Título', h3: 'Subtítulo', h4: 'Subtítulo', h5: 'Subtítulo', h6: 'Subtítulo',
  p: 'Párrafo', li: 'Ítem de lista', a: 'Texto del enlace', button: 'Texto del botón', td: 'Celda', th: 'Encabezado de tabla',
  label: 'Etiqueta', small: 'Texto pequeño', strong: 'Texto destacado', b: 'Texto destacado', em: 'Texto en cursiva', i: 'Texto',
  span: 'Texto', div: 'Texto', option: 'Opción', figcaption: 'Pie de imagen', blockquote: 'Cita', caption: 'Título de tabla', dt: 'Término', dd: 'Descripción',
}

const META_LABEL: Record<string, string> = {
  description: 'Descripción (Google)', keywords: 'Palabras clave', robots: 'Indexación (robots)', title: 'Título (meta)',
  'og:title': 'Título al compartir', 'og:description': 'Descripción al compartir', 'og:image': 'Imagen al compartir',
  'og:url': 'URL al compartir', 'og:site_name': 'Nombre del sitio al compartir', 'og:type': 'Tipo (Open Graph)',
  'twitter:title': 'Título en X/Twitter', 'twitter:description': 'Descripción en X/Twitter', 'twitter:image': 'Imagen en X/Twitter',
  canonical: 'URL canónica',
}

const SEO_LABELS: Record<string, true> = Object.fromEntries(Object.values(META_LABEL).map((v) => [v, true]))

/** Pieza del <head> (SEO), sin importar de qué campo venga. */
export const isSeoEditable = (e: Pick<Editable, 'section'>) => e.section === 'SEO'

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', copy: '©', reg: '®', trade: '™', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü', iexcl: '¡', iquest: '¿', laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…', deg: '°', ordm: 'º', ordf: 'ª', bull: '•', middot: '·', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', euro: '€', cent: '¢' }

export function decodeHtml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : m
    }
    return ENTITIES[e] ?? m
  })
}

function encodeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')
}

function encodeAttr(s: string, quote: string | undefined): string {
  let out = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  if (quote === "'") out = out.replace(/'/g, '&#39;')
  else out = out.replace(/"/g, '&quot;')
  return out
}

type Attr = { name: string; value: string; start: number; end: number; quote: '"' | "'" | '' }

function parseAttrs(tag: string, offset: number): Attr[] {
  const attrs: Attr[] = []
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  const nameEnd = tag.search(/[\s\/>]/)
  re.lastIndex = nameEnd < 0 ? tag.length : nameEnd
  let m: RegExpExecArray | null
  while ((m = re.exec(tag))) {
    const full = m[0]
    const value = m[2] ?? m[3] ?? m[4]
    if (value === undefined) {
      attrs.push({ name: m[1].toLowerCase(), value: '', start: -1, end: -1, quote: '' })
      continue
    }
    const quote: Attr['quote'] = m[2] !== undefined ? '"' : m[3] !== undefined ? "'" : ''
    const valueOffsetInMatch = full.length - value.length - (quote ? 1 : 0)
    const start = offset + m.index + valueOffsetInMatch
    attrs.push({ name: m[1].toLowerCase(), value, start, end: start + value.length, quote })
  }
  return attrs
}

const looksLikeAsset = (v: string) => /\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(v) || /\/(uploads|img|images|media)\//i.test(v)
const isTwig = (s: string) => /\{\{|\{%/.test(s)

type OpenEl = { tag: string; attrs: Attr[]; sectionIdx: number; controller: boolean; id: number }

/**
 * Recorre el HTML una sola vez (sin re-serializarlo) y devuelve las piezas editables.
 * `source` indica de qué campo vienen, para poder reconstruirlo después.
 */
export function extractEditables(html: string, source: EditableSource, opts: { sectionPrefix?: string } = {}): Editable[] {
  const out: Editable[] = []
  if (!html) return out
  const stack: OpenEl[] = []
  let sectionCounter = 0
  const sectionTitles = new Map<number, string>()
  let i = 0
  const len = html.length
  const currentSection = () => {
    for (let k = stack.length - 1; k >= 0; k--) if (stack[k].sectionIdx > 0) return stack[k].sectionIdx
    return 0
  }
  const insideController = () => stack.some((e) => e.controller)
  const nearest = (pred: (e: OpenEl) => boolean) => {
    for (let k = stack.length - 1; k >= 0; k--) if (pred(stack[k])) return stack[k]
    return null
  }
  const headings = new Map<Editable, string>()
  const ancestors = new Map<Editable, number[]>()
  let elementId = 0
  const push = (e: Omit<Editable, 'key' | 'section' | 'source' | 'value'> & { sectionIdx: number; heading?: string }) => {
    const { sectionIdx, heading, ...rest } = e
    const ed: Editable = { ...rest, key: '', source, section: String(sectionIdx), value: rest.original }
    if (heading) headings.set(ed, heading)
    ancestors.set(ed, stack.map((s) => s.id))
    out.push(ed)
  }

  while (i < len) {
    const lt = html.indexOf('<', i)
    const textEnd = lt < 0 ? len : lt
    if (textEnd > i) {
      const raw = html.slice(i, textEnd)
      const parent = stack[stack.length - 1]
      if (/\S/.test(raw) && !insideController() && !isTwig(raw) && (!parent || !RAW_TEXT.has(parent.tag))) {
        const lead = raw.length - raw.replace(/^\s+/, '').length
        const trail = raw.length - raw.replace(/\s+$/, '').length
        const s = i + lead
        const e = textEnd - trail
        const piece = html.slice(s, e)
        const decoded = decodeHtml(piece)
        if (decoded.replace(/[\s ]/g, '') !== '') {
          const block = nearest((el) => !!TEXT_LABEL[el.tag] && !['span', 'strong', 'b', 'em', 'i', 'small'].includes(el.tag)) ?? parent
          const tag = parent?.tag ?? 'div'
          let label = TEXT_LABEL[tag] ?? TEXT_LABEL[block?.tag ?? ''] ?? 'Texto'
          if (nearest((el) => el.tag === 'a') && tag !== 'a') label = 'Texto del enlace'
          if (/\$\s?\d/.test(decoded)) label = 'Precio (se actualiza desde Vehículos)'
          const sectionIdx = currentSection()
          if (/^h[1-3]$/.test(tag) && !sectionTitles.has(sectionIdx)) sectionTitles.set(sectionIdx, decoded.trim())
          push({ kind: 'text', label, start: s, end: e, raw: piece, original: decoded, sectionIdx, multiline: decoded.length > 90, heading: /^h[1-3]$/.test(tag) ? decoded.trim() : undefined })
        }
      }
    }
    if (lt < 0) break
    i = lt
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4)
      i = end < 0 ? len : end + 3
      continue
    }
    if (html.startsWith('<!', i) || html.startsWith('<?', i)) {
      const end = html.indexOf('>', i)
      i = end < 0 ? len : end + 1
      continue
    }
    const close = /^<\/([a-zA-Z][\w:-]*)\s*>/.exec(html.slice(i, i + 64))
    if (close) {
      const tag = close[1].toLowerCase()
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].tag === tag) { stack.length = k; break }
      }
      i += close[0].length
      continue
    }
    const open = /^<([a-zA-Z][\w:-]*)/.exec(html.slice(i, i + 64))
    if (!open) { i += 1; continue }
    // fin de la etiqueta respetando comillas
    let j = i + open[0].length
    let q: string | null = null
    while (j < len) {
      const c = html[j]
      if (q) { if (c === q) q = null }
      else if (c === '"' || c === "'") q = c
      else if (c === '>') break
      j++
    }
    const tagText = html.slice(i, j + 1)
    const tag = open[1].toLowerCase()
    const attrs = parseAttrs(tagText, i)
    const attr = (n: string) => attrs.find((a) => a.name === n)
    const selfClosing = /\/\s*>$/.test(tagText) || VOID.has(tag)
    const parentSection = currentSection()
    const hasSectionAncestor = stack.some((s) => s.sectionIdx > 0)
    const isSection = !attr('data-controller') && !hasSectionAncestor && (SECTION_TAGS.has(tag) || (tag === 'div' && stack.filter((s) => s.tag !== 'main' && s.tag !== 'body' && s.tag !== 'html').length <= 1))
    const sectionIdx = isSection ? ++sectionCounter : 0
    const here = isSection ? sectionIdx : parentSection
    const inCtrl = insideController() || !!attr('data-controller')

    if (!inCtrl && !isTwig(tagText)) {
      // Imágenes
      if (tag === 'img' || tag === 'source') {
        for (const name of ['src', 'data-src', 'srcset', 'data-srcset']) {
          const a = attr(name)
          if (!a || a.start < 0 || !a.value || /\s\d+[wx]\b|,/.test(a.value)) continue
          push({ kind: 'image', label: tag === 'source' ? 'Imagen (versión para otra pantalla)' : 'Imagen', start: a.start, end: a.end, raw: a.value, original: decodeHtml(a.value), quote: a.quote, sectionIdx: here })
        }
        const alt = attr('alt')
        if (alt && alt.start >= 0 && alt.value.trim()) {
          push({ kind: 'text', label: 'Texto alternativo de la imagen', start: alt.start, end: alt.end, raw: alt.value, original: decodeHtml(alt.value), quote: alt.quote, sectionIdx: here })
        }
      }
      // Fondos con imagen
      for (const name of ['style', 'data-bg', 'data-background', 'data-image']) {
        const a = attr(name)
        if (!a || a.start < 0) continue
        if (name === 'style') {
          const re = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g
          let m: RegExpExecArray | null
          while ((m = re.exec(a.value))) {
            const s = a.start + m.index + m[0].indexOf(m[2], 4)
            push({ kind: 'image', label: 'Imagen de fondo', start: s, end: s + m[2].length, raw: m[2], original: decodeHtml(m[2]), quote: a.quote, sectionIdx: here })
          }
        } else if (a.value && looksLikeAsset(a.value)) {
          push({ kind: 'image', label: 'Imagen de fondo', start: a.start, end: a.end, raw: a.value, original: decodeHtml(a.value), quote: a.quote, sectionIdx: here })
        }
      }
      // Enlaces
      if (tag === 'a') {
        const href = attr('href')
        if (href && href.start >= 0 && href.value && !/^(#|javascript:)/i.test(href.value) && !isTwig(href.value)) {
          push({ kind: 'link', label: 'Enlace (a dónde lleva)', start: href.start, end: href.end, raw: href.value, original: decodeHtml(href.value), quote: href.quote, sectionIdx: here })
        }
      }
      // Videos
      if (tag === 'iframe' || tag === 'video') {
        const src = attr('src')
        if (src && src.start >= 0 && src.value) {
          push({ kind: 'video', label: tag === 'iframe' ? 'Video (enlace de YouTube u otro)' : 'Video (archivo)', start: src.start, end: src.end, raw: src.value, original: decodeHtml(src.value), quote: src.quote, sectionIdx: here })
        }
      }
      // SEO en el <head>
      if (tag === 'meta') {
        const key = (attr('name')?.value || attr('property')?.value || '').toLowerCase()
        const content = attr('content')
        if (META_LABEL[key] && content && content.start >= 0) {
          push({ kind: key.endsWith(':image') ? 'image' : 'meta', label: META_LABEL[key], start: content.start, end: content.end, raw: content.value, original: decodeHtml(content.value), quote: content.quote, sectionIdx: 0, multiline: /description/.test(key) })
        }
      }
      if (tag === 'link' && (attr('rel')?.value || '').toLowerCase() === 'canonical') {
        const href = attr('href')
        if (href && href.start >= 0) push({ kind: 'meta', label: META_LABEL.canonical, start: href.start, end: href.end, raw: href.value, original: decodeHtml(href.value), quote: href.quote, sectionIdx: 0 })
      }
    }

    i = j + 1
    if (RAW_TEXT.has(tag) && !selfClosing) {
      const endTag = html.toLowerCase().indexOf(`</${tag}`, i)
      i = endTag < 0 ? len : endTag
      continue
    }
    if (!selfClosing) stack.push({ tag, attrs, sectionIdx, controller: !!attr('data-controller'), id: ++elementId })
  }

  // Nombres de sección legibles y claves estables.
  // Si la página viene envuelta en uno o dos bloques, se agrupa por títulos (h1–h3).
  const structural = new Set(out.map((e) => e.section)).size
  if (structural < 3 && headings.size > 1) {
    // Cada pieza va con el título de su bloque (p. ej. la imagen y el enlace de una tarjeta
    // van con el título de esa tarjeta aunque aparezcan antes que él en el HTML).
    const headingIdx = new Map<Editable, number>()
    const count = new Map<number, number>()
    const owner = new Map<number, number>()
    let n = 0
    for (const ed of out) {
      if (!headings.has(ed)) continue
      headingIdx.set(ed, ++n)
      sectionTitles.set(1000 + n, headings.get(ed)!)
      for (const id of ancestors.get(ed) ?? []) {
        count.set(id, (count.get(id) ?? 0) + 1)
        owner.set(id, n)
      }
    }
    let last = 0
    for (const ed of out) {
      let idx = headingIdx.get(ed)
      if (idx) last = idx
      else {
        const chain = ancestors.get(ed) ?? []
        for (let k = chain.length - 1; k >= 0; k--) {
          const c = count.get(chain[k]) ?? 0
          if (c === 0) continue
          if (c === 1) idx = owner.get(chain[k])
          break
        }
      }
      ed.section = String(idx ? 1000 + idx : last ? 1000 + last : 0)
    }
  }
  const seen = new Map<string, number>()
  const prefix = opts.sectionPrefix ?? ''
  let visible = 0
  const visibleIdx = new Map<number, number>()
  for (const ed of out) {
    const idx = Number(ed.section)
    if (!visibleIdx.has(idx)) visibleIdx.set(idx, ++visible)
    const title = sectionTitles.get(idx)
    const n = visibleIdx.get(idx)!
    ed.section = ed.kind === 'meta' || ed.label in SEO_LABELS || source === 'metaHtml' || source === 'seoH1' ? 'SEO' : `${prefix}Sección ${n}${title ? ` · ${title.slice(0, 50)}` : idx === 0 ? ' · Inicio' : ''}`
    const base = `${source}:${ed.kind}:${hash(ed.raw)}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    ed.key = `${base}:${count}`
  }
  return out
}

function hash(s: string): string {
  let h = 2166136261
  for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(36)
}

/** Vuelve a armar el HTML con los valores editados. Lo que no cambió sale idéntico. */
export function applyEditables(html: string, items: Pick<Editable, 'kind' | 'start' | 'end' | 'raw' | 'original' | 'value' | 'quote'>[] | null | undefined): string {
  if (!html || !items?.length) return html
  const valid = items
    .filter((e) => typeof e.start === 'number' && typeof e.end === 'number' && e.value != null && e.value !== e.original && html.slice(e.start, e.end) === e.raw)
    .sort((a, b) => a.start - b.start)
  if (!valid.length) return html
  let out = ''
  let pos = 0
  for (const e of valid) {
    if (e.start < pos) continue
    const value = String(e.value)
    let encoded: string
    if (e.quote === undefined || e.quote === null) encoded = encodeText(value).replace(/\r?\n/g, '<br>')
    else if (e.quote === '') encoded = `"${encodeAttr(value, '"')}"`
    else encoded = encodeAttr(value, e.quote)
    out += html.slice(pos, e.start) + encoded
    pos = e.end
  }
  return out + html.slice(pos)
}

/**
 * Al cambiar el HTML de origen (importación), vuelve a extraer y conserva lo que
 * el equipo de contenido ya había editado (misma clave y valor distinto al original).
 */
export function mergeEditables(fresh: Editable[], previous: { key?: string | null; value?: string | null; original?: string | null }[] | null | undefined): Editable[] {
  const edited = new Map<string, string>()
  for (const p of previous ?? []) if (p?.key && p.value != null && p.value !== p.original) edited.set(p.key, p.value)
  return fresh.map((f) => (edited.has(f.key) ? { ...f, value: edited.get(f.key)! } : f))
}
