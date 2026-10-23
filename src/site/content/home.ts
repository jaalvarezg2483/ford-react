import { cached } from '../cache'
import { payloadClient } from '../payload'
import { getPosts, getSlider, mediaUrl } from '../data'

export type Cta = { kicker: string; title: string; titleMobile: string; text: string; linkLabel: string; href: string }

const cta = (c: any): Cta => ({ kicker: c?.kicker ?? '', title: c?.title ?? '', titleMobile: c?.titleMobile || c?.title || '', text: c?.text ?? '', linkLabel: c?.linkLabel ?? '', href: c?.href ?? '' })
const image = (upload: unknown, path?: string | null) => mediaUrl(upload as any) || path || ''

/** Datos de la portada listos para los componentes. */
export function getHome() {
  return cached('home', async () => {
    const payload = await payloadClient()
    const h = (await payload.findGlobal({ slug: 'home-page', depth: 1 })) as any
    const [slides, posts] = await Promise.all([getSlider(h.heroSlider || 'BANNER_HOME'), getPosts()])
    return {
      title: h.title || 'Ford Costa Rica | Grupo Purdy',
      description: h.description || '',
      slides,
      vehiclesTitle: h.vehiclesTitle || 'Vehículos Nuevos',
      servicesTitle: h.servicesTitle || 'Servicios',
      servicesText: h.servicesText || '',
      serviceRows: (h.serviceRows ?? []).map((row: any) =>
        (row.cards ?? []).map((c: any) => ({ title: c.title, href: c.href, image: image(c.image, c.imagePath), alt: c.alt || '' })),
      ) as { title: string; href: string; image: string; alt: string }[][],
      tech: {
        kicker: h.techKicker || '',
        title: h.techTitle || '',
        text: h.techText || '',
        items: (h.techItems ?? []).map((t: any) => ({ title: t.title, text: t.text || '', image: image(t.image, t.imagePath) })),
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
  })
}
