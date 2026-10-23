import type { Payload } from 'payload'
import type { ContentBlock, ContentPageData, ContentPageMeta, HeroSlide } from '../../../src/data/types'
import { cached } from './cache'
import { payloadClient } from './payload'
import { mediaUrl } from './siteContent'
import { sanitizeArticleHtml } from './sanitize'

type Doc = Record<string, any>
const img = (upload: unknown, path?: string | null) => mediaUrl(upload) || path || ''
const str = (v: unknown) => (typeof v === 'string' ? v : '')

async function slidesOf(payload: Payload, sliderId: number | Doc | null | undefined): Promise<HeroSlide[]> {
  const doc: Doc | null = sliderId && typeof sliderId === 'object' ? sliderId : sliderId ? ((await payload.findByID({ collection: 'sliders', id: sliderId, depth: 1 }).catch(() => null)) as Doc | null) : null
  return (doc?.slides ?? [])
    .filter((s: Doc) => s.active !== false)
    .map((s: Doc) => ({ xs: mediaUrl(s.imageXs), md: mediaUrl(s.imageMd), lg: mediaUrl(s.imageLg), video: s.video || '', alt: s.imageAlt || '', title: s.title || '', link: s.link || '', btnText: s.btnText || '' }))
}

async function blockView(payload: Payload, b: Doc): Promise<ContentBlock | null> {
  switch (b.blockType) {
    case 'html':
      return { type: 'html', html: sanitizeArticleHtml(str(b.html)) }
    case 'slider':
      return { type: 'slider', slides: await slidesOf(payload, b.slider), showContainer: b.showContainer !== false, showBackLink: Boolean(b.showBackLink) }
    case 'cards':
      return { type: 'cards', items: (b.items ?? []).map((i: Doc) => ({ title: str(i.title), href: str(i.href), alt: str(i.alt), image: img(i.image, i.imagePath) })) }
    case 'contactForm':
      return { type: 'contactForm', formType: str(b.formType), title: str(b.title), phone: str(b.phone), mail: str(b.mail), subject: str(b.subject), description: str(b.description) }
    case 'aboutTabs':
      return { type: 'aboutTabs', tabs: (b.tabs ?? []).map((t: Doc) => ({ title: str(t.title), text: str(t.text), images: (t.images ?? []).map((i: Doc) => img(i.image, i.imagePath)).filter(Boolean) })) }
    case 'timeline':
      return { type: 'timeline', title: str(b.title), items: (b.items ?? []).map((i: Doc) => ({ year: str(i.year), text: str(i.text), image: img(i.image, i.imagePath) })) }
    case 'simpleBanner':
      return { type: 'simpleBanner', slides: (b.slides ?? []).map((s: Doc) => ({ xs: img(s.imageXs, s.imageXsPath), md: img(s.imageMd, s.imageMdPath), lg: img(s.imageLg, s.imageLgPath), alt: str(s.alt), title: str(s.title), text: str(s.text) })) }
    case 'techCards':
      return { type: 'techCards', anchor: str(b.anchor), title: str(b.title), cards: (b.cards ?? []).map((c: Doc) => ({ title: str(c.title), html: sanitizeArticleHtml(str(c.html)), image: img(c.image, c.imagePath) })) }
    case 'techHotspots':
      return { type: 'techHotspots', anchor: str(b.anchor), title: str(b.title), image: img(b.image, b.imagePath), dots: (b.dots ?? []).map((d: Doc) => ({ top: str(d.top), left: str(d.left), title: str(d.title), html: sanitizeArticleHtml(str(d.html)), image: img(d.image, d.imagePath) })) }
    case 'techTabs':
      return { type: 'techTabs', anchor: str(b.anchor), title: str(b.title), tabs: (b.tabs ?? []).map((t: Doc) => ({ label: str(t.label), title: str(t.title), html: sanitizeArticleHtml(str(t.html)), image: img(t.image, t.imagePath), videoUrl: str(t.videoUrl) })) }
    case 'vehiclePicker':
      return { type: 'vehiclePicker', title: str(b.title), intro: str(b.intro), aside: str(b.aside), linkBase: str(b.linkBase) || '/accesorios/' }
    case 'downloads':
      return { type: 'downloads', breadcrumb: str(b.breadcrumb), title: str(b.title), items: (b.items ?? []).map((i: Doc) => ({ title: str(i.title), url: img(i.file, i.filePath) })).filter((i: { url: string }) => i.url) }
    default:
      return null
  }
}

const meta = (p: Doc): ContentPageMeta => ({ path: p.path, title: str(p.title), description: str(p.description), image: img(p.image, p.imagePath) })

/** Metadatos de todas las páginas de contenido publicadas (van en el catálogo del sitio). */
export async function contentPageMetas(payload?: Payload): Promise<ContentPageMeta[]> {
  try {
    const client = payload ?? (await payloadClient())
    const res = await client.find({ collection: 'content-pages', where: { active: { equals: true } }, limit: 500, depth: 1, pagination: false, overrideAccess: true, select: { title: true, path: true, description: true, image: true, imagePath: true } as any })
    return (res.docs as Doc[]).map(meta)
  } catch (error) {
    console.error('No se pudieron leer las páginas de contenido del CMS:', error)
    return []
  }
}

/** Página de contenido con sus bloques ya resueltos (sliders, imágenes) y el HTML limpio. */
export function getContentPage(path: string): Promise<ContentPageData | null> {
  return cached(`content-page:${path}`, async () => {
    const payload = await payloadClient()
    const res = await payload.find({ collection: 'content-pages', where: { and: [{ path: { equals: path } }, { active: { equals: true } }] }, limit: 1, depth: 2, overrideAccess: true })
    const doc = res.docs[0] as Doc | undefined
    if (!doc) return null
    const blocks = (await Promise.all((doc.layout ?? []).map((b: Doc) => blockView(payload, b)))).filter((b): b is ContentBlock => b !== null)
    return { ...meta(doc), blocks }
  })
}
