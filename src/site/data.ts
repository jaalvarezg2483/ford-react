import { cached } from './cache'
import { payloadClient } from './payload'
import defaults from '../import/settings-defaults.json'

type MediaDoc = { url?: string | null; legacyPath?: string | null } | number | null | undefined

/** Ruta pública de un archivo: la misma URL del Symfony. */
export function mediaUrl(m: MediaDoc): string {
  if (!m || typeof m === 'number') return ''
  return m.legacyPath || m.url || ''
}

export type FamilyView = {
  id: number
  name: string
  slug: string
  startPrice: number | null
  hidePrice: boolean
  fordPerformance: boolean
  menuImage: string
  homeImage: string
  homeColor: string
  homeGradient: string
}
export type FamilyTypeView = {
  id: number
  name: string
  textColor: string
  underlineColor: string
  menuHtml: string
  families: FamilyView[]
}
export type SiteData = {
  topMenu: { label: string; href: string }[]
  social: { href: string; icon: string }[]
  familyTypes: FamilyTypeView[]
  headScripts: string
  bodyStartHtml: string
  footerHtml: string
  bodyEndScripts: string
  assetsVersion: string
}

const SOCIAL = [
  { href: 'https://www.facebook.com/FordCostaRica', icon: 'icon-facebook' },
  { href: 'https://www.youtube.com/channel/UC9dvZm4Gt1ggI428hfulSDQ', icon: 'icon-youtube' },
  { href: 'https://www.instagram.com/fordcostarica/', icon: 'icon-instagram' },
]

export function getSite(): Promise<SiteData> {
  return cached('site', async () => {
    const payload = await payloadClient()
    const s = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as Record<string, any>
    const types = await payload.find({ collection: 'family-types', where: { active: { equals: true } }, sort: 'order', depth: 2, limit: 50 })
    return {
      topMenu: (s.topMenu?.length ? s.topMenu : [
        { label: 'Servicios', href: '/servicios' },
        { label: 'Citas Taller', href: '/citas' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contactanos', href: '/contacto' },
      ]).map((i: any) => ({ label: i.label, href: i.href })),
      social: SOCIAL,
      familyTypes: types.docs.map((t: any) => ({
        id: t.id,
        name: t.name,
        textColor: t.textColor || '#000000',
        underlineColor: t.underlineColor || '#000000',
        menuHtml: t.menuHtml || '',
        families: (t.families || []).filter((f: any) => f && typeof f === 'object').map(familyView),
      })),
      headScripts: s.headScripts ?? defaults.headScripts,
      bodyStartHtml: s.bodyStartHtml ?? defaults.bodyStartHtml,
      footerHtml: s.footerHtml ?? defaults.footerHtml,
      bodyEndScripts: s.bodyEndScripts ?? defaults.bodyEndScripts,
      assetsVersion: s.assetsVersion || '1775667654984',
    }
  })
}

export function familyView(f: any): FamilyView {
  return {
    id: f.id,
    name: f.name,
    slug: f.slug,
    startPrice: f.startPrice ?? null,
    hidePrice: Boolean(f.hidePrice),
    fordPerformance: Boolean(f.fordPerformance),
    menuImage: absolute(mediaUrl(f.menuImage)),
    homeImage: absolute(mediaUrl(f.homeImage)),
    homeColor: f.homeColor || '#16a1cc',
    homeGradient: f.homeGradient || 'linear-gradient(35deg, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 30%)',
  }
}

/** El Symfony imprime las imágenes de familias con el dominio (server_url ~ ruta). */
export function absolute(path: string): string {
  if (!path || /^https?:\/\//.test(path)) return path
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/\/$/, '')
  return base + path
}

export type PageDoc = {
  id: number
  path: string
  title?: string
  status?: string
  template?: 'default' | 'raw'
  httpStatus?: number
  bodyClass?: string
  route?: string
  activeMenu?: string
  seoH1?: string
  content?: string
  metaHtml?: string
  headStyles?: string
  headCustom?: string
  scripts?: string
  tail?: string
  bodyStart?: string
  rawDocument?: string
}

export function getPage(path: string): Promise<PageDoc | null> {
  return cached(`page:${path}`, async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'pages', where: { and: [{ path: { equals: path } }, { status: { equals: 'published' } }] }, limit: 1, depth: 0 })
    return (res.docs[0] as unknown as PageDoc) ?? null
  })
}

export function getRedirect(path: string): Promise<{ to: string; permanent: boolean } | null> {
  return cached(`redirect:${path}`, async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'redirects', where: { from: { equals: path } }, limit: 1, depth: 0 })
    const r = res.docs[0] as any
    return r ? { to: r.to, permanent: r.permanent !== false } : null
  })
}

export function getSlider(name: string) {
  return cached(`slider:${name}`, async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'sliders', where: { name: { equals: name } }, limit: 1, depth: 1 })
    const doc = res.docs[0] as any
    if (!doc) return []
    return (doc.slides || []).filter((s: any) => s.active !== false).map((s: any) => ({
      xs: mediaUrl(s.imageXs), md: mediaUrl(s.imageMd), lg: mediaUrl(s.imageLg), video: s.video || '', alt: s.imageAlt || '', title: s.title || '', link: s.link || '', btnText: s.btnText || '',
    }))
  })
}

export function getPosts(limit = 200) {
  return cached(`posts:${limit}`, async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'posts', where: { active: { equals: true } }, sort: '-publishedAt', limit, depth: 1 })
    return res.docs.map((p: any) => ({ title: p.title, path: p.path, category: p.category || '', date: p.publishedAt || '', image: mediaUrl(p.image), summary: p.summary || '' }))
  })
}

export async function getMediaByPath(legacyPath: string) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1, depth: 0 })
  return (res.docs[0] as any) ?? null
}
