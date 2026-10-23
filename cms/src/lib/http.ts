import type { Session } from './session'
import { withSession } from './session'
import { env } from './env'

/** Respuesta JSON sin caché (y con la cookie de sesión si hace falta). */
export function json(body: unknown, status = 200, session?: Session): Response {
  const res = Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
  return session ? withSession(res, session) : res
}

/** Cuerpo de la petición (JSON o formulario) como objeto plano de textos. Los campos `x[]` se unen con coma. */
export async function readFields(req: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const body = await req.json().catch(() => ({}))
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) out[k] = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '')
    return out
  }
  const form = await req.formData().catch(() => null)
  if (!form) return out
  for (const [k, v] of form.entries()) {
    if (typeof v !== 'string') continue
    if (k.endsWith('[]')) out[k] = out[k] ? `${out[k]},${v}` : v
    else out[k] = v
  }
  return out
}

/** Cuerpo JSON tal cual (objetos y arreglos incluidos). */
export async function readJson<T = Record<string, any>>(req: Request): Promise<T> {
  return (await req.json().catch(() => ({}))) as T
}

/** Parámetros de la URL de la petición. */
export function queryOf(req: Request): URLSearchParams {
  return new URL(req.url ?? '', 'http://localhost').searchParams
}

/** Valida el token de reCAPTCHA v2 (si el formulario envía uno; sin llave del servidor lo rechaza). */
export async function captchaOk(fields: Record<string, string>): Promise<boolean> {
  const token = fields['g-recaptcha-response']
  if (!token) return true
  if (!env.RECAPTCHA_SECRET_KEY || token.length > 4096) return false
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token }),
    signal: AbortSignal.timeout(8_000),
  }).then(async (r) => (r.ok ? r.json() : { success: false })).catch(() => ({ success: false }))
  return (res as { success?: boolean }).success === true
}

/** Origen público de la petición (detrás de Railway/Azure `req.url` trae el host interno). */
export function publicOrigin(req: Request): string {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (host && !/^0\.0\.0\.0(:|$)/.test(host)) {
    const proto = req.headers.get('x-forwarded-proto')?.split(',')[0].trim() || new URL(req.url, 'http://localhost').protocol.replace(':', '')
    return `${proto}://${host}`
  }
  return env.SERVER_URL
}
