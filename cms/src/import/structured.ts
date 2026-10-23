import * as cheerio from 'cheerio'
import type { Payload } from 'payload'

/**
 * Pasa el contenido importado de ford.cr (HTML) a los campos estructurados que
 * usan los componentes React: portada, pie, redes sociales, medición y el
 * bloque de Ford Performance. Solo completa lo que está vacío, para no pisar
 * cambios hechos en el CMS.
 */
export async function seedStructured(payload: Payload, log: (m: string) => void = () => {}) {
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 0 })) as any
  await seedSettings(payload, settings)
  await seedFamilyTypePromos(payload)
  await seedHome(payload)
  log('contenido estructurado: portada, pie, redes y medición listos')
}

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()
const stripHost = (u: string) => u.replace(/^https?:\/\/(www\.)?ford\.cr/, '')

async function mediaIdByPath(payload: Payload, path: string): Promise<number | null> {
  if (!path) return null
  const candidates = [path, safeDecode(path)]
  for (const legacyPath of candidates) {
    const res = await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, limit: 1, depth: 0 })
    if (res.docs[0]) return res.docs[0].id as number
  }
  return null
}

function safeDecode(p: string) {
  try { return decodeURI(p) } catch { return p }
}

async function seedSettings(payload: Payload, s: any) {
  const data: Record<string, unknown> = {}
  if (!s.footer?.links?.length && s.footerHtml) {
    const $ = cheerio.load(s.footerHtml)
    const links = $('.footer__top .footer__col > a')
      .toArray()
      .filter((a) => !$(a).hasClass('js-submenu-open'))
      .map((a) => ({ label: clean($(a).text()), href: $(a).attr('href') || '', highlight: $(a).find('strong').length > 0 }))
    const bottomLinks = $('.footer__bottom li > a')
      .toArray()
      .map((a) => ({ label: clean($(a).text()), href: $(a).attr('href') || '', newTab: $(a).attr('target') === '_blank' }))
    const ethics = $('.btn-linea-etica-container span').first()
    const ethicsUrl = /window\.open\('([^']+)'/.exec($('.btn-linea-etica').attr('onclick') || '')?.[1]
    data.footer = {
      links,
      bottomLinks,
      ethicsText: clean(ethics.clone().children().remove().end().text()),
      ethicsUrl: ethicsUrl || 'https://www.grupopurdy.com/linea-etica',
      ethicsButton: clean($('.btn-linea-etica').text()) || 'Info Aquí',
      copyright: (clean($('.footer__bottom p').text()) || '©2026 All rights reserved').replace(/\b20\d\d\b/, '{year}'),
    }
    if (!s.social?.length) {
      data.social = $('.footer__col .list--social a')
        .toArray()
        .map((a) => ({ network: ($(a).find('.icon').attr('class') || '').replace(/.*icon-(\w+).*/, '$1'), href: $(a).attr('href') || '', inMenu: !/tiktok/.test($(a).attr('href') || '') }))
        .filter((x) => ['facebook', 'youtube', 'instagram', 'tiktok'].includes(x.network))
    }
  }
  if (!s.whatsapp?.phone && s.bodyEndScripts) {
    const href = /href="(https:\/\/api\.whatsapp\.com\/send\?[^"]+)"/.exec(s.bodyEndScripts)?.[1]?.replace(/&amp;/g, '&')
    if (href) {
      const u = new URL(href)
      data.whatsapp = { phone: u.searchParams.get('phone') || '', message: u.searchParams.get('text') || '', label: 'WhatsApp' }
    }
  }
  if (!s.gtmId && s.headScripts) data.gtmId = /GTM-[A-Z0-9]+/.exec(s.headScripts)?.[0]
  if (!s.site24x7Key) data.site24x7Key = 'f7a86dda39a513e3c9aba93fd88ec132'
  if (Object.keys(data).length) await payload.updateGlobal({ slug: 'site-settings', data, overrideAccess: true })
}

async function seedFamilyTypePromos(payload: Payload) {
  const types = await payload.find({ collection: 'family-types', limit: 50, depth: 0 })
  for (const t of types.docs as any[]) {
    if (t.promo?.title || !t.menuHtml) continue
    const $ = cheerio.load(t.menuHtml)
    const box = $('.ford-performance-text')
    if (!box.length) continue
    await payload.update({
      collection: 'family-types',
      id: t.id,
      data: {
        promo: {
          logo: box.find('img').attr('src') || '',
          title: clean(box.find('h2').text()),
          paragraphs: box.find('p').toArray().map((p) => ({ text: clean($(p).text()) })),
        },
      } as any,
      overrideAccess: true,
    })
  }
}

async function seedHome(payload: Payload) {
  const home = (await payload.findGlobal({ slug: 'home-page', depth: 0 })) as any
  if (home.serviceRows?.length) return
  const res = await payload.find({ collection: 'pages', where: { path: { equals: '/' } }, limit: 1, depth: 0 })
  const page = res.docs[0] as any
  if (!page?.content) return
  const $ = cheerio.load(page.content)

  const serviceRows = []
  for (const row of $('.card--link-responsive').closest('.row').toArray()) {
    const cards = []
    for (const a of $(row).find('a.card--link-responsive').toArray()) {
      const src = stripHost($(a).find('img').attr('src') || '')
      cards.push({
        title: clean($(a).find('.title').text()),
        href: $(a).attr('href') || '',
        image: await mediaIdByPath(payload, src),
        imagePath: src,
        alt: $(a).find('img').attr('alt') || '',
      })
    }
    serviceRows.push({ cards })
  }
  const servicesBox = $('h2.title-margin').filter((_, el) => clean($(el).text()) === 'Servicios').parent()

  const tech = $('.technology-section')
  const techItems = []
  for (const li of tech.find('.technology-card').toArray()) {
    const src = /url\('([^']+)'\)/.exec($(li).find('.technology-card-img').attr('style') || '')?.[1] || ''
    techItems.push({ title: clean($(li).find('h3').text()), text: clean($(li).find('p').text()), image: await mediaIdByPath(payload, stripHost(src)), imagePath: stripHost(src) })
  }

  const ctaFrom = (icon: string) => {
    const box = $(`.bg--accent-light .icon-${icon}`).first().closest('.col-md-6')
    return {
      kicker: clean(box.find('h5.title').text()),
      title: clean(box.find('h2.title').text()),
      text: clean(box.find('p').first().text()),
      linkLabel: clean(box.find('a.btn').text()),
      href: box.find('a.btn').attr('href') || '',
    }
  }
  const app = $('.banner--full--apps-promo')
  const sizmek = /'rb', '(\d+)'[\s\S]*?'ca', '(\d+)'/.exec(page.content)

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      title: page.title || 'Ford Costa Rica | Grupo Purdy',
      description: /<meta name="description" content="([^"]*)"/.exec(page.metaHtml || '')?.[1] || '',
      heroSlider: /'name':'([^']+)'/.exec($('[data-controller="LumenCMSBundle:Default:renderSlider"]').attr('data-parameters') || '')?.[1] || 'BANNER_HOME',
      vehiclesTitle: clean($('h2.title-margin').first().text()) || 'Vehículos Nuevos',
      servicesTitle: clean(servicesBox.find('h2').text()) || 'Servicios',
      servicesText: clean(servicesBox.find('p').text()),
      serviceRows,
      techKicker: clean(tech.find('.subtitle').text()) || 'Tecnología',
      techTitle: clean(tech.find('h2.title').text()) || 'FORD',
      techText: clean(tech.find('.col-md-3 p').text()),
      techItems,
      financing: ctaFrom('calculator'),
      compare: ctaFrom('car'),
      contact: { ...ctaFrom('chat-alt'), titleMobile: clean($('.container.hidden-md .icon-chat-alt').first().closest('.col-md-6').find('h2.title').text()) },
      newsSize: Number(/'size': '(\d+)'/.exec(page.content)?.[1]) || 6,
      app: {
        title: clean(app.find('h3.title').text()),
        text: clean(app.find('p').first().text()),
        buttonLabel: clean(app.find('.btn--red').text()),
        registerUrl: app.find('.btn--red').attr('href') || '',
        appStoreUrl: app.find('a[title="App Store"]').attr('href') || '',
        playStoreUrl: app.find('a[title="Google Play"]').attr('href') || '',
        logo: app.find('img.logo').attr('src') || '',
        phoneMobile: app.find('img.phone-img.hidden-sm').attr('src') || '',
        phoneDesktop: app.find('img.phone-img.hidden-xs').attr('src') || '',
      },
      sizmek: sizmek ? { rb: sizmek[1], ca: sizmek[2] } : undefined,
    } as any,
    overrideAccess: true,
  })
}
