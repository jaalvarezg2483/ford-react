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
  await importSliders(payload, ok, media)
  await importPosts(payload, src, ok, media)
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
  // Pestañas del inicio: imagen y color por familia
  const homeCards = new Map<string, { image?: string; color?: string; gradient?: string }>()
  $('.tabs-home').closest('[data-controller]').find('.slider__link').each((_, a) => {
    const slug = ($(a).attr('href') || '').replace('/autos/', '')
    const wrap = $(a).parent()
    homeCards.set(slug, {
      image: $(a).find('img').attr('src'),
      color: /background-color:([^;"]+)/.exec(wrap.find('.model-bg').attr('style') || '')?.[1],
      gradient: /--linear-gradient-custom:(.+?);\s*$/.exec(wrap.attr('style') || '')?.[1],
    })
  })
  const typeTabs = $('#subNuevos .tabs li').toArray()
  const families = new Map<string, number>()
  const upsertFamily = async (slug: string, menuCard: cheerio.Cheerio<any>) => {
    if (families.has(slug)) return families.get(slug)!
    const rest = bySlug.get(slug)
    const name = menuCard.find('.family__text h3').text().trim() || rest?.name || slug
    const price = Number((menuCard.find('.family__text h4').text() || '').replace(/[^\d]/g, '')) || rest?.start_price || null
    const card = homeCards.get(slug) ?? {}
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
    for (const a of pane.find('.family-wrap').toArray()) {
      const slug = ($(a).find('a').attr('href') || '').replace('/autos/', '')
      ids.push(await upsertFamily(slug, $(a)))
    }
    const extra = pane.find('.ford-performance-text')
    const data = {
      name,
      order: order++,
      active: true,
      textColor: /--category-text-color:([^;]+);/.exec(style)?.[1]?.trim() || '#000000',
      underlineColor: /--underlined-text-color:([^;]+);/.exec(style)?.[1]?.trim() || '#000000',
      families: ids,
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
  for (let page = 2; page <= 5; page++) {
    const more = await src.fragment(`/blog?page=${page}`)
    if (more) html += more
  }
  const $ = cheerio.load(html)
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
    const data = {
      title: $(a).find('.title').text().trim(),
      path,
      image: mediaId(media, img),
      summary: featured ? $(a).find('.card__content p').first().text().trim() : undefined,
      // El listado viene ordenado del más reciente al más antiguo.
      publishedAt: new Date(base - order++ * 86_400_000).toISOString(),
      active: true,
    }
    const found = await payload.find({ collection: 'posts', where: { path: { equals: path } }, limit: 1, depth: 0 })
    if (found.docs[0]) await payload.update({ collection: 'posts', id: found.docs[0].id, data, overrideAccess: true })
    else await payload.create({ collection: 'posts', data, overrideAccess: true })
  }
  log(`blog: ${seen.size} notas`)
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
          bodyStart: parsed.bodyStart === commonBodyStart ? '' : parsed.bodyStart,
        }
    const found = await payload.find({ collection: 'pages', where: { path: { equals: p.path } }, limit: 1, depth: 0 })
    if (found.docs[0]) { await payload.update({ collection: 'pages', id: found.docs[0].id, data, overrideAccess: true }); updated++ }
    else { await payload.create({ collection: 'pages', data: data as any, overrideAccess: true }); created++ }
  }
  log(`páginas: ${created} nuevas, ${updated} actualizadas`)
}

