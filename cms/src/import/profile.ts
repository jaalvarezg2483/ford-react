import * as cheerio from 'cheerio'

/**
 * Lee la ficha de un vehículo de ford.cr (/autos/{slug} y /autos/{slug}/galeria) y la nota
 * del blog y las convierte en los campos estructurados del CMS. Solo extrae datos: la
 * subida de imágenes y el guardado los hace run.ts.
 */

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()
const stripHost = (u: string) => (u || '').trim().replace(/^https?:\/\/(www\.)?ford\.cr/, '')

export type ParsedProfile = {
  tagline: string
  heroMobile: string
  heroDesktop: string
  leadTitle: string
  leadText: string
  purdyGoUrl: string
  showCalculate: boolean
  colors: { name: string; hex: string; image: string; disclaimer: string }[]
  highlights: { title: string; text: string; image: string }[]
  models: { index: number; code: string; name: string; image: string; calculable: boolean }[]
  /** Fotos de la vista previa de la ficha (se usan solo si no hay página de galería). */
  previewGallery: { image: string; caption: string }[]
}

export function parseVehicleProfile(html: string): ParsedProfile | null {
  const $ = cheerio.load(html)
  const wrapper = $('.wrapper--car')
  if (!wrapper.length) return null

  // Los banners vienen en un <style> del <head>: primero el móvil y luego el de escritorio.
  const style = $('style')
    .toArray()
    .map((s) => $(s).html() || '')
    .find((css) => css.includes('car-profile-hero'))
  const urls = [...(style ?? '').matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => stripHost(m[1]))

  const texts = wrapper.find('.car-profile-description .car-profile-text')
  const lead = wrapper.find('.car-profile-lead')

  const colorImages = wrapper
    .find('.js-slider-colors > div img')
    .toArray()
    .map((img) => stripHost($(img).attr('src') || ''))
  const colors = wrapper
    .find('.js-slider-colors-nav > div')
    .toArray()
    .map((el, i) => {
      const swatch = $(el).find('span').first()
      const hex = /background-color:\s*(#[0-9a-f]{3,8})/i.exec(swatch.attr('style') || '')?.[1] ?? ''
      return {
        name: clean($(el).find('.color-name').text()) || clean((swatch.attr('data-colorname') || '').replace(/\s*\(.*\)$/, '')),
        hex,
        image: colorImages[i] ?? '',
        disclaimer: clean(swatch.attr('data-colordisclaimer')),
      }
    })
    .filter((c) => c.name && c.image)

  const highlights = wrapper
    .find('.car-profile-features-slider .car-profile-feature-card')
    .toArray()
    .map((card) => {
      const body = $(card).find('.car-profile-feature-text').clone()
      const title = clean(body.find('h3').first().text())
      body.find('h3').remove()
      // El texto viene como <p><p>…</p></p>: se quitan los párrafos vacíos que deja el navegador.
      body.find('p').each((_, p) => {
        if (!clean($(p).text())) $(p).remove()
      })
      return { title, text: (body.html() || '').trim(), image: stripHost($(card).find('.car-profile-feature-img img').attr('src') || '') }
    })
    .filter((h) => h.title)

  const specLinks = wrapper
    .find('.js-slider-model-specs > div')
    .toArray()
    .map((el) => /\/calcular\/([^/"?#]+)/.exec($(el).find('a[href*="/calcular/"]').attr('href') || '')?.[1] ?? '')
  const models = wrapper
    .find('.js-slider-model-car .js-slider-model-inner')
    .toArray()
    .map((el, index) => ({
      index,
      code: specLinks[index] ?? '',
      name: clean($(el).find('.title').first().text()),
      image: stripHost($(el).find('img').attr('src') || ''),
      calculable: Boolean(specLinks[index]),
    }))

  const previewGallery = wrapper
    .find('.gallery-slider .gallery__item')
    .toArray()
    .map((el) => ({
      image: stripHost(/url\(['"]?([^'")]+)['"]?\)/.exec($(el).find('.profile-img-container').attr('style') || '')?.[1] ?? ''),
      caption: clean($(el).find('p').text()),
    }))
    .filter((i) => i.image)

  return {
    tagline: clean(texts.eq(1).find('p.text').first().text()),
    heroMobile: urls[0] ?? '',
    heroDesktop: urls[1] ?? urls[0] ?? '',
    leadTitle: clean(lead.find('h3.title').text()),
    leadText: clean(lead.find('p').first().text()),
    purdyGoUrl: wrapper.find('a[href*="purdygo.com"]').first().attr('href') || '',
    showCalculate: wrapper.find('.car-profile-text a[href$="/modelos"]').length > 0,
    colors,
    highlights,
    models,
    previewGallery,
  }
}

/** Secciones (Exterior, Interior…) de la galería /autos/{slug}/galeria. */
export function parseVehicleGallery(html: string): { title: string; items: { image: string; caption: string }[] }[] {
  const $ = cheerio.load(html)
  const sections: { title: string; items: { image: string; caption: string }[] }[] = []
  $('ul.gallery-slider').each((_, ul) => {
    const items = $(ul)
      .find('li.gallery__item')
      .toArray()
      .map((li) => ({
        image: stripHost($(li).find('a').attr('href') || $(li).find('img').attr('src') || ''),
        caption: clean($(li).find('p').text()) || clean($(li).find('a').attr('title')),
      }))
      .filter((i) => i.image)
    if (!items.length) return
    const title = clean($(ul).prevAll('h2.title').first().text()) || 'Galería'
    sections.push({ title, items })
  })
  return sections
}

export type ParsedArticle = {
  heading: string
  banner: string
  bodyHtml: string
  pollUp: number
  pollDown: number
  views: number
  metaDescription: string
}

/** Nota del blog: el cuerpo está repartido en varios bloques `.text` (pegado desde Word). */
export function parseArticle(html: string): ParsedArticle | null {
  const $ = cheerio.load(html)
  const wrapper = $('.wrapper').first()
  const body = wrapper.find('.container > .text')
  if (!body.length) return null
  const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0
  const heading = wrapper.find('h1.title').first().clone()
  heading.find('.edit').remove()
  return {
    heading: clean(heading.text()),
    banner: stripHost(wrapper.find('img[alt="banner"]').first().attr('src') || ''),
    bodyHtml: body
      .toArray()
      .map((el) => $(el).html() || '')
      .join('\n')
      .trim(),
    pollUp: num(wrapper.find('.poll.thumbsUp span').text()),
    pollDown: num(wrapper.find('.poll.thumbsDown span').text()),
    views: num(/Visualizaciones:\s*([\d.,]+)/.exec(wrapper.find('.view__count').text())?.[1] ?? ''),
    metaDescription: clean($('meta[name="description"]').attr('content')),
  }
}
