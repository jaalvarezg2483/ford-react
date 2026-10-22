import { env } from '../lib/env'

/**
 * Ajustes del HTML según el dominio donde corre el sitio.
 *
 * El contenido importado trae URLs absolutas a www.ford.cr (así las generaba el
 * Symfony con el host de la petición). Mientras el sitio corra en otro dominio
 * (Railway, Azure de pruebas) esas URLs se reescriben al dominio público (env.SERVER_URL)
 * para no depender del sitio anterior. En www.ford.cr no cambia nada.
 */
const LEGACY_ORIGIN = /https?:\/\/(?:www\.)?ford\.cr(?=[/"'\s)<>?#,;\\]|$)/g
const LEGACY_RECAPTCHA = '6LeotmQUAAAAAEEmdheY_96QrWQBPnTdZY2DI8Qo'
const LEGACY_MAPS = 'AIzaSyDQI6kxn1-YxaAk6jyd3VsPDNGj-AbQVh4'

export function siteOrigin(): string | null {
  const url = env.SERVER_URL
  if (!url || /^https?:\/\/(www\.)?ford\.cr$/.test(url)) return null
  return url
}

export function toPublicHtml(text: string): string {
  let out = text
  const origin = siteOrigin()
  if (origin) out = out.replace(LEGACY_ORIGIN, origin)
  // Las llaves de reCAPTCHA y Google Maps del sitio actual solo funcionan en ford.cr.
  const recaptcha = process.env.RECAPTCHA_SITE_KEY?.trim()
  const maps = process.env.GOOGLE_MAPS_API_KEY?.trim()
  if (recaptcha && recaptcha !== LEGACY_RECAPTCHA) out = out.replaceAll(LEGACY_RECAPTCHA, recaptcha)
  if (maps && maps !== LEGACY_MAPS) out = out.replaceAll(LEGACY_MAPS, maps)
  return out
}

/**
 * Fuera de www.ford.cr (Railway, pruebas) las páginas llevan noindex para que
 * Google no indexe una copia del sitio y compita con el original.
 */
export function robotsHeader(): Record<string, string> {
  return siteOrigin() ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}
}
