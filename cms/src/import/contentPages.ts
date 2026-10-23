import type { Payload } from 'payload'
import * as cheerio from 'cheerio'
import type { AnyNode, Element } from 'domhandler'
import { parsePage, parseParams } from './parse'
import { liveSource } from './source'
import { sanitizeArticleHtml } from '../lib/sanitize'

/** Rutas de ford.cr que se publican como páginas de contenido (bloques React). El resto lo cubren otros módulos. */
export const CONTENT_PATHS = [
  '/servicios',
  '/herramientas-de-compra',
  '/seguros',
  '/servicios/repuestos',
  '/mantenimiento-y-talleres',
  '/sobre-nosotros',
  '/article/terminos-condiciones',
  '/tecnologia',
  '/reglamentos',
  '/planes-mantenimiento',
  '/carroceria-pintura',
  '/seguros/coberturas',
  '/seguros/condiciones',
  '/servicio/accesorios',
]

const srcOf = ($: cheerio.CheerioAPI, el: AnyNode | undefined | null) => {
  if (!el) return ''
  const $el = $(el)
  const raw = $el.attr('src') || $el.attr('srcset') || ''
  const bg = /url\(['"]?([^'")]+)['"]?\)/.exec($el.attr('style') || '')?.[1] || ''
  const data = $el.attr('data-min-width-0') || $el.attr('data-min-width-768') || $el.attr('data-min-width-992') || ''
  const fromData = /src=['"]?([^'"\s>]+)/.exec(data)?.[1] || ''
  return strip((raw.split(',')[0] || '').trim() || bg || fromData)
}
const strip = (u: string) => u.replace(/^https?:\/\/(www\.)?ford\.cr/, '').trim()
const text = ($el: cheerio.Cheerio<AnyNode>) => $el.text().replace(/\s+/g, ' ').trim()

function cards($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>) {
  return root
    .find('a.card--link-responsive')
    .toArray()
    .map((a) => {
      const $a = $(a)
      const img = $a.find('img')[0]
      return { title: text($a.find('.title, h3').first()) || ($a.attr('title') || ''), href: strip($a.attr('href') || ''), alt: $(img).attr('alt') || '', imagePath: srcOf($, img) }
    })
    .filter((c) => c.title && c.href)
}

function downloads($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>) {
  return root
    .find('a.card--pdf')
    .toArray()
    .map((a) => ({ title: text($(a).find('.card__content p').first()) || text($(a)), filePath: strip($(a).attr('href') || '') }))
    .filter((d) => d.title && d.filePath)
}

function contactForm($: cheerio.CheerioAPI, node: cheerio.Cheerio<AnyNode>, params: Record<string, string | number | boolean>) {
  return {
    blockType: 'contactForm' as const,
    formType: String(params.type || 'contacto'),
    title: 'Contacto',
    phone: String(params.phone || text(node.find('.title-icon').first().find('p').last())),
    mail: String(params.mail || ''),
    subject: String(params.subject || ''),
    description: String(params.description || ''),
  }
}

function aboutTabs($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>) {
  const labels = root.find('.js-tabs-about-us a, .js-tabs-about-us button').toArray().map((a) => text($(a)))
  const panes = root.find('.tab-pane').toArray()
  const tabs = panes.map((pane, i) => {
    const $p = $(pane)
    return {
      title: labels[i] || text($p.find('h2').first()),
      text: text($p.find('p').first()),
      images: $p.find('.about-us-img').toArray().map((el) => ({ imagePath: srcOf($, el) })).filter((x) => x.imagePath),
    }
  }).filter((t) => t.title)
  return tabs.length ? { blockType: 'aboutTabs' as const, tabs } : null
}

function timeline($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>) {
  const items = root.find('.timeline-item').toArray().map((el) => ({
    year: text($(el).find('.title, h4').first()),
    text: text($(el).find('p').first()),
    imagePath: srcOf($, $(el).find('.timeline-img')[0]),
  })).filter((i) => i.year)
  return items.length ? { blockType: 'timeline' as const, title: text(root.find('h2.title').first()) || 'Historia', items } : null
}

function simpleBanner($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>) {
  const host = root.find('[data-min-width-0], [data-min-width-992]').first()
  const inner = root.find('.slider__inner')
  const paras = inner.find('p').toArray().map((p) => text($(p)))
  const slide = {
    imageXsPath: strip(/src=['"]?([^'"\s>]+)/.exec(host.attr('data-min-width-0') || '')?.[1] || ''),
    imageMdPath: strip(/src=['"]?([^'"\s>]+)/.exec(host.attr('data-min-width-768') || '')?.[1] || ''),
    imageLgPath: strip(/src=['"]?([^'"\s>]+)/.exec(host.attr('data-min-width-992') || '')?.[1] || srcOf($, root.find('img')[0])),
    alt: paras[0] || '',
    title: paras[0] || '',
    text: paras[1] || '',
  }
  return { blockType: 'simpleBanner' as const, slides: [slide] }
}

function techCategory($: cheerio.CheerioAPI, root: cheerio.Cheerio<AnyNode>, params: Record<string, string | number | boolean>) {
  const extra = (params.extraParams && typeof params.extraParams === 'object' ? params.extraParams : {}) as Record<string, unknown>
  const anchor = String(params.categoryCode || root.find('.technology-container').attr('id') || extra.tabsTitle || '')
  const title = text(root.find('.category-name, h1').first())
  if (root.find('.hotspots').length) {
    const dots = root.find('.dots-block-container').toArray().map((el, i) => {
      const dot = root.find('.hotspot').eq(i)
      return {
        top: dot.css('top') || (dot.attr('style')?.match(/top:\s*([^;]+)/)?.[1] ?? ''),
        left: dot.css('left') || (dot.attr('style')?.match(/left:\s*([^;]+)/)?.[1] ?? ''),
        title: text($(el).find('.content-container > p').first()),
        html: sanitizeArticleHtml($(el).find('.description-styles').html() || ''),
        imagePath: srcOf($, $(el).find('img')[0]),
      }
    }).filter((d) => d.title)
    return { blockType: 'techHotspots' as const, anchor, title, imagePath: srcOf($, root.find('.hotspots > img')[0]), dots }
  }
  if (root.find('.innovation-tabs-container').length) {
    const tabs = root.find('.tabs-body').toArray().map((el, i) => {
      const btn = root.find('.js-innovation-tab').eq(i)
      return {
        label: text(btn.find('.border-bottom-desktop, p').first()) || text(btn),
        title: text($(el).find('.texts-content .title').first()),
        html: sanitizeArticleHtml($(el).find('.texts-content > div').html() || ''),
        imagePath: srcOf($, $(el).find('img')[0]),
        videoUrl: $(el).find('a.tabs-js-video, a.watch-video-button').attr('href') || '',
      }
    }).filter((t) => t.label || t.title)
    return { blockType: 'techTabs' as const, anchor, title, tabs }
  }
  const cards = root.find('.content-container').toArray().map((el) => ({
    title: text($(el).find('.card-title-desktop, .card-title').first()),
    html: sanitizeArticleHtml($(el).find('.card-description-p').html() || ''),
    imagePath: srcOf($, $(el).find('img')[0]),
  })).filter((c) => c.title)
  return { blockType: 'techCards' as const, anchor, title, cards }
}

function htmlBlock($: cheerio.CheerioAPI, el: AnyNode) {
  const clone = $(el).clone()
  clone.find('script, style, form').remove()
  const html = sanitizeArticleHtml($.html(clone))
  if (!html.replace(/<[^>]+>/g, '').trim() && !clone.find('img, picture').length) return null
  return { blockType: 'html' as const, html }
}

/** Convierte el HTML importado de una página de ford.cr en bloques del CMS. */
export function htmlToBlocks(html: string, sliders: Map<string, number>): Record<string, unknown>[] {
  const $ = cheerio.load(html, null, false)
  const root = $('.wrapper').first()
  const kids = (root.length ? root.children() : $.root().children()).toArray()
  const blocks: Record<string, unknown>[] = []
  const push = (b: Record<string, unknown> | null | undefined) => { if (b) blocks.push(b) }

  for (const el of kids) {
    const $el = $(el)
    const tag = (el as Element).tagName || ''
    if (tag === 'script' || tag === 'link' || tag === 'br' || tag === 'style') continue
    if ($el.hasClass('stats')) continue
    if ($el.hasClass('clearfix') && !text($el)) continue

    const ctrlEl = $el.is('[data-controller]') ? $el : $el.find('[data-controller]').first()
    const ctrl = ctrlEl.attr('data-controller') || ''
    const params = parseParams(ctrlEl.attr('data-parameters'))

    if (ctrl.includes('renderSlider')) {
      const name = String(params.name || '')
      const id = sliders.get(name)
      if (id) push({ blockType: 'slider', slider: id, showContainer: params.showContainer !== false && params.showContainer !== 'false', showBackLink: Boolean(params.showBackLink) && params.showBackLink !== 'false' })
      continue
    }
    if (ctrl.includes('renderDefaultFormSnippet')) {
      push(contactForm($, $el, params))
      continue
    }
    if (ctrl.includes('renderAboutUs')) {
      push(aboutTabs($, $el))
      continue
    }
    if (ctrl.includes('renderTimeline')) {
      push(timeline($, $el))
      continue
    }
    if (ctrl.includes('renderSimpleBanner')) {
      push(simpleBanner($, ctrlEl.length ? ctrlEl : $el))
      continue
    }
    if (ctrl.includes('renderCategory')) {
      push(techCategory($, $el, params))
      continue
    }
    const pdfs = downloads($, $el)
    if (pdfs.length) {
      const crumb = text($el.find('.breadcrumb li').last())
      push({ blockType: 'downloads', title: text($el.find('h4.title, h1, h2').first()) || crumb || 'Archivos', breadcrumb: crumb, items: pdfs })
      continue
    }
    const cardItems = cards($, $el)
    if (cardItems.length) {
      push({ blockType: 'cards', items: cardItems })
      continue
    }
    if ($el.find('.calculate-card').length) {
      push({ blockType: 'vehiclePicker', title: 'Seleccione un vehículo', intro: 'Hacé tu Ford aún más único.', aside: 'Accesorios', linkBase: '/accesorios/' })
      continue
    }
    push(htmlBlock($, el))
  }
  return blocks
}

const SITE_SUFFIX = ' | Ford Costa Rica | Grupo Purdy'

async function htmlForPath(payload: Payload, path: string) {
  const found = await payload.find({ collection: 'pages', where: { path: { equals: path } }, limit: 1, depth: 0, overrideAccess: true })
  const src = found.docs[0] as { content?: string; title?: string; rawDocument?: string } | undefined
  const archived = src?.content || (src?.rawDocument ? parsePage(src.rawDocument).content : '')
  if (archived) return { html: archived, title: src?.title || '' }
  const origin = (process.env.LEGACY_SITE_URL || 'https://www.ford.cr').replace(/\/$/, '')
  const live = await liveSource(origin).page(path).catch(() => null)
  if (!live || live.status >= 400 || !live.html) return { html: '', title: '' }
  const parsed = parsePage(live.html)
  return { html: parsed.content || live.html, title: src?.title || parsed.title || '' }
}

/** Crea o actualiza las páginas de contenido a partir del HTML archivado en `pages` (o de ford.cr si falta). */
export async function importContentPages(
  payload: Payload,
  log: (...a: unknown[]) => void = console.log,
  opts: { only?: string[]; createOnly?: boolean } = {},
) {
  const sliderRes = await payload.find({ collection: 'sliders', limit: 50, depth: 0, pagination: false, overrideAccess: true })
  const sliders = new Map((sliderRes.docs as { id: number; name: string }[]).map((s) => [s.name, s.id]))

  let created = 0
  let updated = 0
  for (const path of opts.only ?? CONTENT_PATHS) {
    const src = await htmlForPath(payload, path)
    const html = src.html
    if (!html) {
      log(`contenido: sin HTML para ${path}`)
      continue
    }
    const layout = htmlToBlocks(html, sliders)
    const rawTitle = (src.title || path).replace(new RegExp(`${SITE_SUFFIX.replace(/[|]/g, '\\|')}$`), '').trim() || path
    const description = text(cheerio.load(html, null, false)('p').first())
    const data = { title: rawTitle, path, active: true, description: description.slice(0, 300), layout } as any
    const existing = await payload.find({ collection: 'content-pages', where: { path: { equals: path } }, limit: 1, depth: 0, overrideAccess: true })
    if (existing.docs[0]) {
      if (opts.createOnly) continue
      await payload.update({ collection: 'content-pages', id: existing.docs[0].id, data, overrideAccess: true })
      updated++
    } else {
      await payload.create({ collection: 'content-pages', data, overrideAccess: true })
      created++
    }
  }
  log(`páginas de contenido: ${created} nuevas, ${updated} actualizadas`)
}
