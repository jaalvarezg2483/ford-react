import type { Payload } from 'payload'
import type { Calculator, Family, FamilyCard, FamilyType, Home, Model, PostSummary, Site, SiteContent, VideoItem } from '../../../src/data/types'
import { env } from './env'
import { payloadClient } from './payload'
import { sanitizeArticleHtml } from './sanitize'
import { contentPageMetas } from './contentPages'
import { siteVersion } from './siteVersion'

type Doc = Record<string, any>

/** Ruta pública de un archivo del CMS (la misma URL que tenía en el sitio anterior). */
export function mediaUrl(m: unknown): string {
  if (!m || typeof m !== 'object') return ''
  const doc = m as { url?: string | null; legacyPath?: string | null }
  return doc.legacyPath || doc.url || ''
}
const image = (upload: unknown, path?: string | null) => mediaUrl(upload) || path || ''
const text = (v: unknown) => (typeof v === 'string' ? v : '')
const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v))

/** Las imágenes de familias con el dominio, como las imprimía el sitio anterior en el menú. */
const SOCIAL = [
  { href: 'https://www.facebook.com/FordCostaRica', icon: 'icon-facebook' },
  { href: 'https://www.youtube.com/channel/UC9dvZm4Gt1ggI428hfulSDQ', icon: 'icon-youtube' },
  { href: 'https://www.instagram.com/fordcostarica/', icon: 'icon-instagram' },
]
const socialView = (x: Doc) => ({ href: x.href as string, icon: `icon-${x.network}` })

function familyCard(f: Doc): FamilyCard {
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    startPrice: f.startPrice ?? null,
    hidePrice: Boolean(f.hidePrice),
    fordPerformance: Boolean(f.fordPerformance),
    menuImage: mediaUrl(f.menuImage),
    homeImage: mediaUrl(f.homeImage),
    homeColor: f.homeColor || '#16a1cc',
    homeGradient: f.homeGradient || 'linear-gradient(35deg, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 30%)',
  }
}

function modelView(m: Doc): Model {
  const specs: Record<string, string | number> = {}
  for (const [k, v] of Object.entries((m.specs ?? {}) as Doc)) if (k !== 'id' && v !== null && v !== undefined && v !== '') specs[k] = v
  return {
    id: num(m.legacyId),
    code: text(m.code),
    name: text(m.name),
    year: num(m.year),
    price: num(m.price),
    image: image(m.image, m.imagePath),
    calculable: m.calculable !== false,
    features: (m.features ?? []).map((x: Doc) => text(x.item)).filter(Boolean),
    specs,
  }
}

function familyView(f: Doc): Family {
  return {
    ...familyCard(f),
    legacyId: num(f.legacyId),
    code: text(f.code),
    year: num(f.year),
    tagline: text(f.tagline) || text(f.description),
    heroDesktop: image(f.heroDesktop, f.heroDesktopPath),
    heroMobile: image(f.heroMobile, f.heroMobilePath),
    leadTitle: text(f.leadTitle),
    leadText: text(f.leadText),
    purdyGoUrl: text(f.purdyGoUrl),
    showCalculate: f.showCalculate !== false,
    colors: (f.colors ?? []).map((c: Doc) => ({ name: text(c.name), hex: text(c.hex), image: image(c.image, c.imagePath), disclaimer: text(c.disclaimer) })),
    highlights: (f.highlights ?? []).map((h: Doc) => ({ title: text(h.title), text: sanitizeArticleHtml(text(h.text)), image: image(h.image, h.imagePath) })),
    gallery: (f.gallery ?? [])
      .map((g: Doc) => ({ title: text(g.title), items: (g.items ?? []).map((i: Doc) => ({ image: image(i.image, i.imagePath), caption: text(i.caption) })).filter((i: { image: string }) => i.image) }))
      .filter((g: { items: unknown[] }) => g.items.length),
    models: (f.models ?? []).map(modelView),
    dataSheets: (f.dataSheets ?? []).map((d: Doc) => ({ id: num(d.legacyId), title: text(d.title), url: mediaUrl(d.file) })).filter((d: { url: string }) => d.url),
  }
}

async function buildSite(payload: Payload): Promise<Site> {
  const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })) as Doc
  const types = await payload.find({ collection: 'family-types', where: { active: { equals: true } }, sort: 'order', depth: 2, limit: 50, overrideAccess: true })
  const familyTypes: FamilyType[] = types.docs.map((t: Doc) => ({
    id: t.id,
    name: t.name,
    textColor: t.textColor || '#000000',
    underlineColor: t.underlineColor || '#000000',
    promo: t.promo?.title ? { logo: t.promo.logo || '', title: t.promo.title, paragraphs: (t.promo.paragraphs ?? []).map((p: Doc) => p.text) } : null,
    families: (t.families || []).filter((f: unknown) => f && typeof f === 'object').map(familyCard),
    cardStyles: Array.isArray(t.cardStyles) ? t.cardStyles.map((c: Doc) => ({ slug: c.slug, image: c.image || undefined, color: c.color || undefined, gradient: c.gradient || undefined })) : [],
  }))
  return {
    topMenu: (s.topMenu?.length ? s.topMenu : [
      { label: 'Servicios', href: '/servicios' },
      { label: 'Citas Taller', href: '/citas' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contactanos', href: '/contacto' },
    ]).map((i: Doc) => ({ label: i.label, href: i.href })),
    social: s.social?.length ? s.social.filter((x: Doc) => x.inMenu !== false).map(socialView) : SOCIAL,
    footerSocial: s.social?.length ? s.social.map(socialView) : SOCIAL,
    footer: {
      links: (s.footer?.links ?? []).map((l: Doc) => ({ label: l.label, href: l.href, highlight: Boolean(l.highlight) })),
      bottomLinks: (s.footer?.bottomLinks ?? []).map((l: Doc) => ({ label: l.label, href: l.href, newTab: Boolean(l.newTab) })),
      ethicsText: s.footer?.ethicsText ?? '',
      ethicsUrl: s.footer?.ethicsUrl ?? '',
      ethicsButton: s.footer?.ethicsButton || 'Info Aquí',
      copyright: s.footer?.copyright || '©{year} All rights reserved',
    },
    gtmId: s.gtmId ?? '',
    site24x7Key: s.site24x7Key ?? '',
    // Llaves públicas (van en el navegador). Las del sitio anterior solo funcionan en ford.cr.
    recaptchaSiteKey: env.RECAPTCHA_SITE_KEY || '6LeotmQUAAAAAEEmdheY_96QrWQBPnTdZY2DI8Qo',
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY?.trim() || 'AIzaSyDQI6kxn1-YxaAk6jyd3VsPDNGj-AbQVh4',
    whatsapp: s.whatsapp?.phone ? { phone: s.whatsapp.phone, message: s.whatsapp.message || '', label: s.whatsapp.label || 'WhatsApp' } : null,
    familyTypes,
  }
}

async function buildSliders(payload: Payload, name: string) {
  const res = await payload.find({ collection: 'sliders', where: { name: { equals: name } }, limit: 1, depth: 1, overrideAccess: true })
  const doc = res.docs[0] as Doc | undefined
  return (doc?.slides ?? [])
    .filter((s: Doc) => s.active !== false)
    .map((s: Doc) => ({ xs: mediaUrl(s.imageXs), md: mediaUrl(s.imageMd), lg: mediaUrl(s.imageLg), video: s.video || '', alt: s.imageAlt || '', title: s.title || '', link: s.link || '', btnText: s.btnText || '' }))
}

function postView(p: Doc): PostSummary {
  return {
    title: p.title,
    path: p.path,
    category: p.category || '',
    categoryId: p.categoryId ?? null,
    views: p.views ?? 0,
    featured: Boolean(p.featured),
    date: p.publishedAt || '',
    image: mediaUrl(p.image),
    summary: p.summary || '',
  }
}

const cta = (c: Doc | undefined) => ({ kicker: c?.kicker ?? '', title: c?.title ?? '', titleMobile: c?.titleMobile || c?.title || '', text: c?.text ?? '', linkLabel: c?.linkLabel ?? '', href: c?.href ?? '' })

async function buildHome(payload: Payload, posts: PostSummary[]): Promise<Home> {
  const h = (await payload.findGlobal({ slug: 'home-page', depth: 1, overrideAccess: true })) as Doc
  const slides = await buildSliders(payload, h.heroSlider || 'BANNER_HOME')
  return {
    title: h.title || 'Ford Costa Rica | Grupo Purdy',
    description: h.description || '',
    slides,
    vehiclesTitle: h.vehiclesTitle || 'Vehículos Nuevos',
    servicesTitle: h.servicesTitle || 'Servicios',
    servicesText: h.servicesText || '',
    serviceRows: (h.serviceRows ?? []).map((row: Doc) => (row.cards ?? []).map((c: Doc) => ({ title: c.title, href: c.href, image: image(c.image, c.imagePath), alt: c.alt || '' }))),
    tech: {
      kicker: h.techKicker || '',
      title: h.techTitle || '',
      text: h.techText || '',
      items: (h.techItems ?? []).map((t: Doc) => ({ title: t.title, text: t.text || '', image: image(t.image, t.imagePath) })),
    },
    financing: cta(h.financing),
    compare: cta(h.compare),
    contact: cta(h.contact),
    // La portada muestra las últimas noticias; la destacada del blog va aparte.
    news: posts
      .filter((p) => !p.featured)
      .slice(0, Number(h.newsSize) || 6)
      .map((p) => ({ title: p.title, path: p.path, image: p.image.startsWith('/uploads/') ? `/media/cache/blog_teaser${p.image}` : p.image })),
    app: h.app ?? {},
    sizmek: h.sizmek ?? {},
  }
}

/** Redirecciones fijas de URLs viejas que pueden seguir enlazadas o indexadas. */
const FIXED_REDIRECTS: Record<string, [string, boolean]> = {
  '/pagina/seguros': ['/seguros/contacto', false],
  '/pagina/que-hacer-accidente': ['/seguros/que-hacer-accidente', true],
  '/pagina/seguros-beneficios': ['/seguros/seguros-beneficios', true],
  '/pagina/mantenimiento': ['/mantenimiento/contacto', true],
  '/pagina/planes-mantenimiento': ['/mantenimiento/planes-mantenimiento', true],
  '/seguros/contacto-beneficios': ['/seguros/beneficios', true],
  '/llamado-al-servicio-2015': ['/llamado-al-servicio/agosto-2015', true],
  '/purdy-renting': ['/servicios/soluciones-empresas', true],
  '/calculate': ['/calcular', true],
  '/contactanos': ['/contacto', true],
}

async function buildRedirects(payload: Payload, families: Family[]) {
  const out: SiteContent['redirects'] = {}
  for (const [from, [to, permanent]] of Object.entries(FIXED_REDIRECTS)) out[from] = { to, permanent }
  // /test-drive/{familia} lleva a la prueba de manejo del modelo más barato de la familia.
  for (const f of families) {
    const cheapest = f.models.filter((m) => (m.price ?? 0) > 0).sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0]
    if (cheapest) out[`/test-drive/${f.slug}`] = { to: `/autos/${f.slug}/calcular/${cheapest.code}/prueba-manejo`, permanent: false }
  }
  const res = await payload.find({ collection: 'redirects', limit: 2000, depth: 0, pagination: false, overrideAccess: true })
  for (const r of res.docs as Doc[]) out[r.from] = { to: r.to, permanent: r.permanent !== false }
  return out
}

async function buildCafsa(payload: Payload): Promise<Calculator | null> {
  const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })) as Doc
  const c = (s.calculators ?? []).find((x: Doc) => String(x.name).toUpperCase() === 'CAFSA')
  if (!c) return null
  return { name: c.name, rate: Number(c.rate ?? 0), commission: Number(c.commission ?? 0), prima: Number(c.prima ?? 0), term: Number((c.termMonth ?? [])[0] ?? 96) }
}

async function build(): Promise<SiteContent> {
  const payload = await payloadClient()
  const [site, famRes, postRes, videoRes, cafsa, pages] = await Promise.all([
    buildSite(payload),
    payload.find({ collection: 'families', limit: 300, depth: 1, pagination: false, overrideAccess: true }),
    payload.find({ collection: 'posts', where: { active: { equals: true } }, sort: '-publishedAt', limit: 500, depth: 1, pagination: false, overrideAccess: true }),
    payload.find({ collection: 'videos', where: { active: { equals: true } }, sort: 'order', limit: 500, pagination: false, overrideAccess: true }),
    buildCafsa(payload),
    contentPageMetas(payload),
  ])
  const families = (famRes.docs as Doc[]).map(familyView)
  const posts = (postRes.docs as Doc[]).map(postView)
  const videos: VideoItem[] = (videoRes.docs as Doc[]).map((v) => ({
    name: text(v.name),
    category: text(v.category),
    youtube: text(v.youtube),
    image: text(v.image),
    description: text(v.description),
  }))
  const [home, redirects] = await Promise.all([buildHome(payload, posts), buildRedirects(payload, families)])
  const official = /^https:\/\/(www\.)?ford\.cr$/.test(env.SERVER_URL)
  return { generatedAt: new Date().toISOString(), legacyUrl: official ? null : env.LEGACY_SITE_URL, site, home, families, posts, videos, cafsa, redirects, pages }
}

let cache: { version: number; at: number; value: Promise<SiteContent> } | null = null
const TTL_MS = 60_000

/** Catálogo publicado. Se rearma al cambiar el CMS (versión) o tras 60 s. */
export function getSiteContent(): Promise<SiteContent> {
  if (cache && cache.version === siteVersion() && Date.now() - cache.at < TTL_MS) return cache.value
  const value = build()
  const entry = { version: siteVersion(), at: Date.now(), value }
  cache = entry
  value.catch(() => { if (cache === entry) cache = null })
  return value
}
