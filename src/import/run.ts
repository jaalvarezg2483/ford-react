import type { Payload } from 'payload'
import * as cheerio from 'cheerio'
import { dirSource, liveSource, type CrawledPage, type ImportSource } from './source'
import { emptyControllers, parsePage } from './parse'
import { KNOWN_CONTROLLERS, parseParams } from '../site/controllers'
import defaults from './settings-defaults.json'

let log = (...a: unknown[]) => console.log('[import]', ...a)
const stripHost = (u: string) => u.replace(/^https?:\/\/(www\.)?ford\.cr/, '')

export type ImportOptions = { source?: string; fallbackLive?: boolean; legacyUrl?: string; log?: (...a: unknown[]) => void }

/** Importa ford.cr al CMS. Idempotente: actualiza por ruta/slug/nombre sin duplicar. */
export async function runImport(payload: Payload, opts: ImportOptions = {}) {
  if (opts.log) log = opts.log
  const live = liveSource((opts.legacyUrl || process.env.LEGACY_SITE_URL || 'https://www.ford.cr').replace(/\/$/, ''))
  const sourceArg = opts.source || 'live'
  const src: ImportSource = sourceArg === 'live' ? live : dirSource(sourceArg, opts.fallbackLive ? live : undefined)
  log('leyendo páginas…')
  const pages = (await src.pages()).filter((p) => p.html)
  const ok = pages.filter((p) => p.status === 200 && p.html.includes('<html'))
  log(`${pages.length} páginas (${ok.length} con 200)`)

  const media = await importMedia(payload, src, pages)
  const home = ok.find((p) => p.path === '/')
  if (!home) throw new Error('No se encontró la página de inicio')
  await importSettings(payload, ok)
  await importVehicles(payload, src, home, media)
  await importModelPrices(payload, ok)
  await importCalculators(payload, src)
  await importModelVariants(payload, src)
  await importSliders(payload, ok, media)
  await importPosts(payload, src, ok, media)
  await importVideos(payload, src, ok)
  await importPages(payload, pages)
  log('listo ✔')
}

// ---------- Archivos ----------
const UPLOAD_RE = /(?:https?:\/\/(?:www\.)?ford\.cr)?(\/(?:uploads|media)\/[^"'\s)<>?#\\]+)/g

async function importMedia(payload: Payload, src: ImportSource, pages: CrawledPage[]) {
  const wanted = new Set<string>()
  for (const p of pages) for (const m of p.html.matchAll(UPLOAD_RE)) wanted.add(m[1])
  for (const ep of REST_ENDPOINTS) {
    const body = await src.rest(ep)
    if (body) for (const m of body.replace(/\\\//g, '/').matchAll(UPLOAD_RE)) wanted.add(m[1])
  }
  const map = new Map<string, number>()
  let page = 1
  for (;;) {
    const res = await payload.find({ collection: 'media', limit: 500, page, depth: 0 })
    for (const d of res.docs as any[]) if (d.legacyPath) map.set(d.legacyPath, d.id)
    if (!res.hasNextPage) break
    page++
  }
  const todo = [...wanted].filter((p) => !map.has(p) && p.length < 400)
  log(`archivos: ${wanted.size} referenciados, ${todo.length} por importar`)
  let done = 0, missing = 0
  const worker = async () => {
    while (todo.length) {
      const p = todo.shift()!
      const file = await src.file(p)
      if (!file) { missing++; continue }
      const name = decodeURIComponent(p.split('/').pop()!).replace(/[^\w.\-]+/g, '_').slice(-120) || 'archivo'
      try {
        const doc = await payload.create({
          collection: 'media',
          data: { legacyPath: p, alt: '' },
          file: { data: file.data, mimetype: file.mimetype, name, size: file.data.length },
          overrideAccess: true,
        })
        map.set(p, doc.id as number)
        if (++done % 50 === 0) log(`  ${done} archivos…`)
      } catch (error) {
        console.error('  archivo falló', p, (error as Error).message)
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))
  log(`archivos: ${done} nuevos, ${missing} no disponibles`)
  return map
}

const REST_ENDPOINTS = ['/rest/get/list/family/all/all/all', '/rest/get/list/only/family', '/rest/get/list/subsidiary', '/rest/v2/calculator', '/rest/get/list/colors']

const mediaId = (map: Map<string, number>, url: string | undefined | null) => {
  if (!url) return undefined
  return map.get(stripHost(url.trim())) ?? undefined
}

// ---------- Configuración (menú, pie, scripts) ----------
async function importSettings(payload: Payload, ok: CrawledPage[]) {
  const parsed = ok.map((p) => parsePage(p.html)).filter((p) => p.template === 'default')
  const tails = new Map<string, number>()
  for (const p of parsed) tails.set(p.tail, (tails.get(p.tail) ?? 0) + 1)
  const commonTail = [...tails.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? defaults.bodyEndScripts
  const home = parsePage(ok.find((p) => p.path === '/')!.html)
  const $ = cheerio.load(home.chrome)
  const topMenu = $('ul.menu__top > li > a.menu__item').toArray()
    .map((a) => ({ label: $(a).text().trim(), href: $(a).attr('href') || '' }))
    .filter((i) => i.href && i.href !== '/')
  const html = ok.find((p) => p.path === '/')!.html
  const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'))
  const headScripts = head.slice(head.indexOf('<!-- Google Tag Manager -->'), head.indexOf('<title>'))
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      topMenu,
      headScripts: headScripts || defaults.headScripts,
      bodyStartHtml: home.bodyStart || defaults.bodyStartHtml,
      footerHtml: home.footer || defaults.footerHtml,
      bodyEndScripts: commonTail,
      assetsVersion: /main\.css\?v=(\d+)/.exec(html)?.[1] || '1775667654984',
    },
    overrideAccess: true,
  })
  ;(globalThis as any).__commonTail = commonTail
  ;(globalThis as any).__commonBodyStart = home.bodyStart
  log('configuración del sitio actualizada')
}

// ---------- Vehículos ----------
async function importVehicles(payload: Payload, src: ImportSource, home: CrawledPage, media: Map<string, number>) {
  const restBody = await src.rest('/rest/get/list/only/family')
  const restFamilies: any[] = restBody ? JSON.parse(restBody).info ?? [] : []
  const bySlug = new Map(restFamilies.map((f) => [f.slug, f]))
  const $ = cheerio.load(home.html)
  // El mismo modelo puede tener una tarjeta distinta en cada categoría de inicio.
  const homeCardsByType = new Map<string, Map<string, { image?: string; color?: string; gradient?: string }>>()
  $('.tabs-home li').each((_, tab) => {
    const name = $(tab).text().trim()
    const target = $(tab).find('a').attr('href') || ''
    const pane = $(target)
    const cards = new Map<string, { image?: string; color?: string; gradient?: string }>()
    pane.find('.slider__link').each((_, a) => {
      const slug = ($(a).attr('href') || '').replace('/autos/', '')
      const wrap = $(a).parent()
      cards.set(slug, {
        image: $(a).find('img').attr('src'),
        color: /background-color:([^;"]+)/.exec(wrap.find('.model-bg').attr('style') || '')?.[1],
        // Los estilos de Ford Performance traen gradientes multilínea.
        gradient: /--linear-gradient-custom:([\s\S]+?);\s*$/.exec(wrap.attr('style') || '')?.[1],
      })
    })
    homeCardsByType.set(name, cards)
  })
  const typeTabs = $('#subNuevos .tabs li').toArray()
  const families = new Map<string, number>()
  const upsertFamily = async (slug: string, menuCard: cheerio.Cheerio<any>, card: { image?: string; color?: string; gradient?: string }) => {
    if (families.has(slug)) return families.get(slug)!
    const rest = bySlug.get(slug)
    const name = menuCard.find('.family__text h3').text().trim() || rest?.name || slug
    const price = Number((menuCard.find('.family__text h4').text() || '').replace(/[^\d]/g, '')) || rest?.start_price || null
    const data: Record<string, unknown> = {
      name,
      slug,
      code: rest?.code,
      legacyId: rest?.id,
      startPrice: price,
      year: rest?.current_year ?? undefined,
      fordPerformance: menuCard.find('.ford-p-img').length > 0,
      hidePrice: menuCard.find('.family__text h4').length === 0,
      menuImage: mediaId(media, menuCard.find('.family__img img').attr('src')),
      homeImage: mediaId(media, card.image),
      homeColor: card.color,
      homeGradient: card.gradient,
      description: rest?.web_description || rest?.description || undefined,
      models: rest ? (rest.related_models || []).map((m: any) => ({
        code: m.code, name: m.name, year: m.anno ?? rest.principal_model?.year, legacyId: m.id,
        familySalesForce: m.familySalesForce, categorySalesForce: m.categorySalesForce, features: m.feauture_list ?? [],
      })) : undefined,
      dataSheets: rest ? (rest.data_sheets || []).map((d: any) => ({ title: d.description || d.code, file: mediaId(media, d.file), legacyId: d.id })) : undefined,
    }
    const found = await payload.find({ collection: 'families', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const doc = found.docs[0]
      ? await payload.update({ collection: 'families', id: found.docs[0].id, data, overrideAccess: true })
      : await payload.create({ collection: 'families', data: data as any, overrideAccess: true })
    families.set(slug, doc.id as number)
    return doc.id as number
  }
  let order = 0
  for (const li of typeTabs) {
    const tab = $(li)
    const name = tab.text().trim()
    const target = tab.find('a').attr('href')!
    const pane = $(`#subNuevos ${target}`)
    const style = tab.attr('style') || ''
    const ids: number[] = []
    const homeCards = homeCardsByType.get(name) ?? new Map()
    for (const a of pane.find('.family-wrap').toArray()) {
      const slug = ($(a).find('a').attr('href') || '').replace('/autos/', '')
      ids.push(await upsertFamily(slug, $(a), homeCards.get(slug) ?? {}))
    }
    const extra = pane.find('.ford-performance-text')
    const data = {
      name,
      order: order++,
      active: true,
      textColor: /--category-text-color:([^;]+);/.exec(style)?.[1]?.trim() || '#000000',
      underlineColor: /--underlined-text-color:([^;]+);/.exec(style)?.[1]?.trim() || '#000000',
      families: ids,
      cardStyles: [...homeCards.entries()].map(([slug, card]) => ({ slug, ...card })),
      menuHtml: extra.length ? `				<div class="ford-performance-text">${extra.html()}</div>\n` : '',
    }
    const found = await payload.find({ collection: 'family-types', where: { name: { equals: name } }, limit: 1, depth: 0 })
    if (found.docs[0]) await payload.update({ collection: 'family-types', id: found.docs[0].id, data, overrideAccess: true })
    else await payload.create({ collection: 'family-types', data, overrideAccess: true })
  }
  log(`vehículos: ${families.size} familias en ${typeTabs.length} categorías`)
}

// ---------- Precios por modelo (páginas /autos/<familia>/modelos) ----------
async function importModelPrices(payload: Payload, ok: CrawledPage[]) {
  let updated = 0
  for (const page of ok.filter((p) => /^\/autos\/[^/]+\/modelos$/.test(p.path))) {
    const slug = page.path.split('/')[2]
    const $ = cheerio.load(page.html)
    const cards = $('.calculate-card').toArray().map((c) => {
      const href = $(c).find('a[href*="/calcular/"]').attr('href') || ''
      return {
        code: href.split('/calcular/')[1]?.split('/')[0],
        name: $(c).find('.calculate-card-text h4').first().text().trim(),
        price: Number($(c).find('.calculate-card-text h4').eq(1).text().replace(/[^\d]/g, '')) || undefined,
      }
    }).filter((c) => c.code)
    const found = await payload.find({ collection: 'families', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
    const fam = found.docs[0] as any
    if (!fam) continue
    const models = [...(fam.models || [])]
    for (const c of cards) {
      const m = models.find((x: any) => x.code === c.code)
      if (m) Object.assign(m, { price: c.price, name: m.name || c.name })
      else models.push({ code: c.code, name: c.name, price: c.price })
    }
    await payload.update({ collection: 'families', id: fam.id, data: { models }, overrideAccess: true })
    updated++
  }
  log(`precios de modelos: ${updated} familias`)
}

// ---------- Variantes por modelo: especificaciones, fichas y comparador ----------
const COMPARE_ROWS: Record<string, string> = {
  Motor: 'cc', Tracción: 'traction', Combustible: 'gas', Transmisión: 'transmission', Pasajeros: 'pasajeros',
  'Largo total': 'totalLength', 'Alto total': 'totalHeight', 'Ancho total': 'totalWidth', 'Distancia entre ejes': 'distanceBetweenAxis',
}

/** Lee la columna del primer vehículo en /comparador?models[]=ID. */
export function parseCompareSpecs(html: string): Record<string, string | number> {
  const $ = cheerio.load(html)
  const specs: Record<string, string | number> = {}
  $('table.table--compare tr').each((_, tr) => {
    const cells = $(tr).children('td')
    if (cells.length < 2) return
    const label = $(cells[0]).text().trim()
    const key = COMPARE_ROWS[label]
    if (!key) return
    const cell = $(cells[1])
    if (cell.find('p.text-50').length) return
    const text = cell.text().trim()
    specs[key] = key === 'cc' ? Number(text.replace(/[^\d.]/g, '')) || text : text
  })
  return specs
}

async function importModelVariants(payload: Payload, src: ImportSource) {
  const fams = await payload.find({ collection: 'families', limit: 200, depth: 0 })
  let pages = 0, specs = 0
  for (const fam of fams.docs as any[]) {
    const models = [...(fam.models || [])]
    let changed = false
    for (const m of models) {
      if (m.legacyId == null) continue
      const variants = [
        `/autos/${fam.slug}/especificaciones?models%5B0%5D=${m.legacyId}`,
        `/fichas-tecnicas-precios/${fam.slug}?models%5B0%5D=${m.legacyId}`,
        `/comparador?models%5B%5D=${m.legacyId}`,
      ]
      for (const v of variants) {
        const page = await src.page(v)
        if (!page || page.status !== 200 || !page.html.includes('<html')) continue
        if (v.startsWith('/comparador')) {
          const parsed = parseCompareSpecs(page.html)
          if (Object.keys(parsed).length) { m.specs = parsed; changed = true; specs++ }
          continue
        }
        await upsertPage(payload, page)
        pages++
      }
    }
    if (changed) await payload.update({ collection: 'families', id: fam.id, data: { models }, overrideAccess: true })
  }
  log(`variantes por modelo: ${pages} páginas, ${specs} fichas de comparador`)
}

// ---------- Entidades financieras ----------
async function importCalculators(payload: Payload, src: ImportSource) {
  const body = await src.rest('/rest/v2/calculator')
  if (!body) return
  const list = JSON.parse(body)
  await payload.updateGlobal({ slug: 'site-settings', data: { calculators: list }, overrideAccess: true })
  log(`calculadora: ${list.length} entidades`)
}

// ---------- Banners ----------
async function importSliders(payload: Payload, ok: CrawledPage[], media: Map<string, number>) {
  const sliders = new Map<string, any[]>()
  for (const p of ok) {
    const $ = cheerio.load(p.html)
    $('[data-controller="LumenCMSBundle:Default:renderSlider"]').each((_, el) => {
      const params = parseParams($(el).attr('data-parameters'))
      const name = String(params.name || '')
      if (!name || sliders.has(name)) return
      const slides = $(el).find('.hero-slide').toArray().map((s) => {
        const slide = $(s)
        const sources = slide.find('picture source').toArray().map((x) => ({ media: $(x).attr('media') || '', src: $(x).attr('srcset') || '' }))
        const xs = sources.find((x) => x.media.includes('max-width: 599px'))?.src
        const md = sources.find((x) => x.media.includes('min-width: 600px'))?.src
        const lg = sources.find((x) => x.media === '(min-width: 768px)')?.src || slide.find('img').attr('src')
        const alt = slide.find('img').attr('alt') || ''
        const btn = slide.find('.button-container a')
        return {
          active: true,
          imageXs: mediaId(media, xs),
          imageMd: mediaId(media, md || slide.find('video').attr('poster')),
          imageLg: mediaId(media, lg),
          video: slide.find('video source').attr('src') || undefined,
          imageAlt: /^Banner \d+$/.test(alt) ? '' : alt,
          title: slide.find('.title_container h1').text().trim(),
          link: btn.attr('href') || '',
          btnText: btn.length && btn.text().trim() !== 'Ver más' ? btn.text().trim() : '',
        }
      })
      sliders.set(name, slides)
    })
  }
  for (const [name, slides] of sliders) {
    const found = await payload.find({ collection: 'sliders', where: { name: { equals: name } }, limit: 1, depth: 0 })
    if (found.docs[0]) await payload.update({ collection: 'sliders', id: found.docs[0].id, data: { slides }, overrideAccess: true })
    else await payload.create({ collection: 'sliders', data: { name, slides }, overrideAccess: true })
  }
  log(`banners: ${[...sliders.keys()].join(', ')}`)
}

// ---------- Blog ----------
async function importPosts(payload: Payload, src: ImportSource, ok: CrawledPage[], media: Map<string, number>) {
  const blog = ok.find((p) => p.path === '/blog')
  if (!blog) return
  let html = blog.html
  for (let page = 2; page <= 6; page++) {
    const more = await src.fragment(`/blog?page=${page}`)
    if (more) html += more
  }
  const $ = cheerio.load(html)
  // Categorías del filtro (checkbox-ID) y a qué notas corresponden.
  const categories = $('input.categories-select[name="categories[]"]').toArray().map((el) => ({ id: Number(($(el).attr('id') || '').replace('checkbox-', '')), name: $(el).attr('value') || '' }))
  const categoryOf = new Map<string, { id: number; name: string }>()
  for (const cat of categories) {
    const page = await src.page(`/blog?categories%5B%5D=${encodeURIComponent(cat.name)}`)
    if (!page || page.status !== 200) continue
    const c$ = cheerio.load(page.html)
    c$('#results a.blog-link').each((_, a) => { categoryOf.set(stripHost(c$(a).attr('href') || ''), cat) })
  }
  const cards = $('a.blog-link-featured, a.blog-link').toArray()
  let order = 0
  const seen = new Set<string>()
  const base = Date.now()
  for (const a of cards) {
    const path = stripHost($(a).attr('href') || '')
    if (!path || seen.has(path)) continue
    seen.add(path)
    const img = ($(a).find('img').attr('src') || '').replace(/^https?:\/\/(www\.)?ford\.cr/, '').replace('/media/cache/blog_teaser', '')
    const featured = $(a).hasClass('blog-link-featured')
    const postPage = ok.find((p) => p.path === path) ?? (await src.page(path))
    const views = Number(/Visualizaciones:\s*([\d.,]+)/.exec(postPage?.html || '')?.[1]?.replace(/[.,]/g, '')) || 0
    const cat = categoryOf.get(path)
    const data = {
      title: $(a).find('.title').text().trim(),
      path,
      image: mediaId(media, img),
      summary: featured ? $(a).find('.card__content p').first().text().trim() : undefined,
      // El listado viene ordenado del más reciente al más antiguo.
      publishedAt: new Date(base - order++ * 86_400_000).toISOString(),
      active: true,
      category: cat?.name,
      categoryId: cat?.id,
      views,
      featured,
    }
    const found = await payload.find({ collection: 'posts', where: { path: { equals: path } }, limit: 1, depth: 0 })
    if (found.docs[0]) await payload.update({ collection: 'posts', id: found.docs[0].id, data, overrideAccess: true })
    else await payload.create({ collection: 'posts', data, overrideAccess: true })
  }
  log(`blog: ${seen.size} notas, ${categories.length} categorías`)
}

// ---------- Videos ----------
async function importVideos(payload: Payload, src: ImportSource, ok: CrawledPage[]) {
  const index = ok.find((p) => p.path === '/videos')
  if (!index) return
  const $ = cheerio.load(index.html)
  const cats = $('ul.tabs li a').toArray().map((a) => $(a).attr('href') || '').filter((h) => h.startsWith('/videos/'))
  let order = 0, total = 0
  for (const href of cats) {
    const category = decodeURIComponent(href.replace('/videos/', ''))
    let html = (ok.find((p) => p.path === href) ?? (await src.page(href)))?.html ?? ''
    for (let page = 2; page <= 10; page++) {
      const more = await src.fragment(`${href}?page=${page}`)
      if (!more || !more.includes('gallery__item')) break
      html += more
    }
    const c$ = cheerio.load(html)
    const seen = new Set<string>()
    for (const item of c$('#results .gallery__item--video').toArray()) {
      const a = c$(item).find('a.js-popup-video')
      const youtube = a.attr('href') || ''
      if (!youtube || seen.has(youtube)) continue
      seen.add(youtube)
      const data = {
        name: c$(item).find('p strong').first().text().trim() || a.attr('title') || '',
        category,
        order: order++,
        active: true,
        youtube,
        image: c$(item).find('img').attr('src') || undefined,
        description: c$(item).find('p').eq(1).text().trim() || undefined,
      }
      const found = await payload.find({ collection: 'videos', where: { and: [{ youtube: { equals: youtube } }, { category: { equals: category } }] }, limit: 1, depth: 0 })
      if (found.docs[0]) await payload.update({ collection: 'videos', id: found.docs[0].id, data, overrideAccess: true })
      else await payload.create({ collection: 'videos', data, overrideAccess: true })
      total++
    }
  }
  log(`videos: ${total} en ${cats.length} categorías`)
}

// ---------- Páginas ----------
async function importPages(payload: Payload, pages: CrawledPage[]) {
  const commonTail: string = (globalThis as any).__commonTail ?? ''
  const commonBodyStart: string = (globalThis as any).__commonBodyStart ?? ''
  let created = 0, updated = 0
  const notFound = pages.find((p) => p.status === 404 && p.html.includes('<html'))
  const list = pages.filter((p) => p.status === 200 && p.html.trim().length > 0 && !p.path.startsWith('/rest'))
  if (notFound) list.push({ ...notFound, path: '/__404' })
  for (const p of list) {
    const finalPath = stripHost(p.url || p.path) || p.path
    if (p.path !== '/__404' && finalPath !== p.path) {
      const to = finalPath
      const found = await payload.find({ collection: 'redirects', where: { from: { equals: p.path } }, limit: 1, depth: 0 })
      if (!found.docs[0]) await payload.create({ collection: 'redirects', data: { from: p.path, to, permanent: false }, overrideAccess: true })
      continue
    }
    const r = await upsertPage(payload, p, commonTail, commonBodyStart)
    if (r === 'created') created++
    else updated++
  }
  log(`páginas: ${created} nuevas, ${updated} actualizadas`)
}

const PRICE_PAGE = /^\/(?:autos|reserva|preaprobador|accesorios|fichas-tecnicas-precios|test-drive)\/([^/?]+)/
let familyPrices: Map<string, { value: number; ref: string }[]> | null = null

/** Precios de la familia y sus modelos que aparecen en una página (para mantenerlos al día desde el CMS). */
async function priceRefsFor(payload: Payload, path: string, content: string) {
  const slug = PRICE_PAGE.exec(path)?.[1]
  if (!slug) return null
  if (!familyPrices) {
    familyPrices = new Map()
    const fams = await payload.find({ collection: 'families', limit: 200, depth: 0 })
    for (const f of fams.docs as any[]) {
      const refs: { value: number; ref: string }[] = []
      if (f.startPrice) refs.push({ value: f.startPrice, ref: 'family' })
      for (const m of f.models || []) if (m.price) refs.push({ value: m.price, ref: `model:${m.code}` })
      familyPrices.set(f.slug, refs)
    }
  }
  const dotted = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const refs = (familyPrices.get(slug) ?? []).filter((r) => content.includes(dotted(r.value)) || content.includes(String(r.value)))
  return refs.length ? refs : null
}

async function upsertPage(payload: Payload, p: CrawledPage, commonTail: string = (globalThis as any).__commonTail ?? '', commonBodyStart: string = (globalThis as any).__commonBodyStart ?? '') {
  {
    const parsed = parsePage(p.html)
    const data: Record<string, unknown> = parsed.template === 'raw'
      ? { path: p.path, title: parsed.title, template: 'raw', rawDocument: parsed.rawDocument, status: 'published', httpStatus: p.status }
      : {
          path: p.path,
          title: parsed.title,
          template: 'default',
          status: 'published',
          httpStatus: p.status,
          bodyClass: parsed.bodyClass,
          route: parsed.route,
          activeMenu: parsed.activeMenu,
          seoH1: parsed.seoH1,
          content: emptyControllers(parsed.content, KNOWN_CONTROLLERS),
          metaHtml: parsed.metaHtml,
          headStyles: parsed.headStyles,
          headCustom: parsed.headCustom,
          scripts: parsed.scripts,
          tail: parsed.tail === commonTail ? '' : parsed.tail,
          priceRefs: await priceRefsFor(payload, p.path, parsed.content + parsed.scripts),
          bodyStart: parsed.bodyStart === commonBodyStart ? '' : parsed.bodyStart,
        }
    const found = await payload.find({ collection: 'pages', where: { path: { equals: p.path } }, limit: 1, depth: 0 })
    if (found.docs[0]) { await payload.update({ collection: 'pages', id: found.docs[0].id, data, overrideAccess: true }); return 'updated' }
    await payload.create({ collection: 'pages', data: data as any, overrideAccess: true })
    return 'created'
  }
}

