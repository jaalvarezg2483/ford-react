import { parse } from 'parse5'

type HtmlNode = {
  nodeName?: string
  tagName?: string
  attrs?: { name: string; value: string }[]
  childNodes?: HtmlNode[]
  parentNode?: HtmlNode
  sourceCodeLocation?: { startTag?: { endOffset: number } }
}

const FIELD_LABELS: Record<string, string> = {
  department: 'Departamento', skillset: 'Departamento', comments: 'Comentario', comment: 'Comentario',
  first_name: 'Nombre', firstName: 'Nombre', last_name: 'Apellidos', lastName: 'Apellidos',
  phone: 'Teléfono', mobile: 'Teléfono', email: 'Correo electrónico', idNumber: 'Número de identificación',
  plateNumber: 'Número de placa', reference: 'Número de placa', q: 'Buscar', name: 'Nombre',
  SendChatHistory: 'Enviar historial de chat al correo',
}

const ICON_LABELS: Record<string, string> = {
  'icon-hamburger': 'Abrir menú', 'icon-close': 'Cerrar', 'icon-arrow-right': 'Continuar',
  'icon-facebook': 'Facebook', 'icon-youtube': 'YouTube', 'icon-instagram': 'Instagram',
  'icon-tiktok': 'TikTok', 'icon-search': 'Buscar',
}

/**
 * Adds accessible names and keyboard focus styles to the imported legacy HTML.
 * Only inserts attributes/style; it preserves the original markup and layout.
 */
export function enhanceAccessibility(html: string): string {
  const document = parse(html, { sourceCodeLocationInfo: true }) as unknown as HtmlNode
  const ids = new Map<string, HtmlNode>()
  const nodes: HtmlNode[] = []
  walk(document, (node) => {
    nodes.push(node)
    const id = attr(node, 'id')
    if (id) ids.set(id, node)
  })

  const labels = new Map<HtmlNode, string>()
  for (const label of nodes.filter((node) => node.tagName === 'label')) {
    const text = textContent(label).trim()
    if (!text) continue
    const target = attr(label, 'for') ? ids.get(attr(label, 'for')!) : firstControl(label)
    if (target) labels.set(target, text)
  }

  const insertions = new Map<number, string[]>()
  for (const node of nodes) {
    if (!node.tagName || !node.sourceCodeLocation?.startTag) continue
    const tag = node.tagName
    const attrs = node.attrs ?? []
    if (attrs.some((item) => item.name === 'aria-hidden' && item.value === 'true')) continue
    const additions: string[] = []

    if (tag === 'label' && !hasAttr(node, 'for') && !firstControl(node)) {
      const target = nextControlSibling(node)
      const targetId = target && attr(target, 'id')
      if (targetId && textContent(node).trim()) additions.push(`for="${escapeAttr(targetId)}"`)
    }

    if (tag === 'img' && !hasAttr(node, 'alt')) {
      const anchor = ancestor(node, 'a')
      const alt = attr(node, 'title') || (!anchor ? filenameLabel(attr(node, 'src')) : '')
      additions.push(`alt="${escapeAttr(alt)}"`)
    }

    if (['input', 'select', 'textarea'].includes(tag) && attr(node, 'type') !== 'hidden' && !hasAccessibleName(node, labels)) {
      const label = labels.get(node) || attr(node, 'placeholder') || attr(node, 'title') || fieldLabel(node)
      if (label) additions.push(`aria-label="${escapeAttr(label)}"`)
    }

    if (tag === 'button' && !hasAccessibleName(node, labels)) {
      const label = attr(node, 'title') || buttonLabel(node)
      if (label) additions.push(`aria-label="${escapeAttr(label)}"`)
    }

    if (tag === 'a' && !hasAccessibleName(node, labels)) {
      const label = attr(node, 'title') || linkLabel(node)
      if (label) additions.push(`aria-label="${escapeAttr(label)}"`)
    }

    if (additions.length) {
      const end = node.sourceCodeLocation.startTag.endOffset
      const offset = html[end - 2] === '/' ? end - 2 : end - 1
      insertions.set(offset, [...(insertions.get(offset) ?? []), ...additions])
    }
  }

  let result = html
  for (const [offset, attrs] of [...insertions.entries()].sort(([a], [b]) => b - a)) {
    result = `${result.slice(0, offset)} ${attrs.join(' ')}${result.slice(offset)}`
  }
  const focusStyles = `<style id="ford-accessibility-styles">\n.ford-skip-link{position:fixed;left:1rem;top:1rem;z-index:999999;transform:translateY(-200%);background:#fff;color:#111;padding:.75rem 1rem;font-weight:700}.ford-skip-link:focus{transform:translateY(0)}\n:where(a,button,input,select,textarea,[tabindex]):focus-visible{outline:3px solid #fff!important;outline-offset:2px;box-shadow:0 0 0 5px #111!important;position:relative;z-index:2}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}\n</style>`
  return result.replace('</head>', `${focusStyles}</head>`)
}

function walk(node: HtmlNode, visit: (node: HtmlNode) => void) {
  visit(node)
  for (const child of node.childNodes ?? []) walk(child, visit)
}

function attr(node: HtmlNode, name: string): string | undefined {
  return node.attrs?.find((item) => item.name === name)?.value
}

function hasAttr(node: HtmlNode, name: string): boolean {
  return node.attrs?.some((item) => item.name === name) ?? false
}

function textContent(node: HtmlNode): string {
  if (node.nodeName === '#text') return (node as any).value ?? ''
  return (node.childNodes ?? []).map(textContent).join(' ')
}

function firstControl(node: HtmlNode): HtmlNode | undefined {
  if (['input', 'select', 'textarea', 'button'].includes(node.tagName ?? '')) return node
  for (const child of node.childNodes ?? []) {
    const found = firstControl(child)
    if (found) return found
  }
}

function nextControlSibling(node: HtmlNode): HtmlNode | undefined {
  const siblings = node.parentNode?.childNodes ?? []
  const index = siblings.indexOf(node)
  for (const sibling of siblings.slice(index + 1)) {
    if (sibling.nodeName === '#text' && !textContent(sibling).trim()) continue
    return ['input', 'select', 'textarea'].includes(sibling.tagName ?? '') ? sibling : undefined
  }
}

function ancestor(node: HtmlNode, tag: string): HtmlNode | undefined {
  let current = node.parentNode
  while (current) {
    if (current.tagName === tag) return current
    current = current.parentNode
  }
}

function hasAccessibleName(node: HtmlNode, labels: Map<HtmlNode, string>): boolean {
  if (attr(node, 'aria-label') || attr(node, 'aria-labelledby') || attr(node, 'title')) return true
  if (labels.has(node)) return true
  if (node.tagName === 'input') return ['button', 'submit', 'reset', 'image'].includes(attr(node, 'type') ?? '') && Boolean(attr(node, 'value') || attr(node, 'alt'))
  if (node.tagName === 'select' || node.tagName === 'textarea') return false
  if (textContent(node).trim()) return true
  if ((node.childNodes ?? []).some((child) => child.tagName === 'img' && attr(child, 'alt'))) return true
  let parent = node.parentNode
  while (parent) {
    if (parent.tagName === 'label' && textContent(parent).trim()) return true
    parent = parent.parentNode
  }
  return false
}

function fieldLabel(node: HtmlNode): string {
  const key = attr(node, 'name') || attr(node, 'id') || ''
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return key.replace(/^form_/, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()
}

function buttonLabel(node: HtmlNode): string {
  const cls = attr(node, 'class') ?? ''
  if (/menu__toggle|js-menu-toggle/.test(cls)) return 'Abrir menú'
  if (/close|dismiss/.test(cls) || attr(node, 'data-dismiss')) return 'Cerrar'
  const form = ancestor(node, 'form')
  if (form && /resultados/.test(attr(form, 'action') ?? '')) return 'Buscar'
  return iconLabel(node) || (attr(node, 'type') === 'submit' ? 'Enviar' : '')
}

function linkLabel(node: HtmlNode): string {
  const href = attr(node, 'href') ?? ''
  const icon = iconLabel(node)
  if (icon) return icon
  if (/^mailto:/i.test(href)) return `Enviar correo a ${href.slice(7)}`
  if (/^tel:/i.test(href)) return `Llamar al ${href.slice(4)}`
  if (href === '#' && attr(node, 'data-sub')) return `Abrir ${attr(node, 'data-sub')!.replace('sub', '').toLowerCase()}`
  try {
    const host = new URL(href).hostname.replace(/^www\./, '')
    return host || 'Abrir enlace'
  } catch {
    return 'Abrir enlace'
  }
}

function iconLabel(node: HtmlNode): string | undefined {
  let result: string | undefined
  walk(node, (child) => {
    if (result) return
    const classes = (attr(child, 'class') ?? '').split(/\s+/)
    const icon = classes.find((name) => ICON_LABELS[name])
    if (icon) result = ICON_LABELS[icon]
  })
  return result
}

function filenameLabel(src: string | undefined): string {
  if (!src) return ''
  const filename = src.split(/[/?#]/).filter(Boolean).pop() ?? ''
  const label = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
  try { return decodeURIComponent(label) } catch { return label }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
