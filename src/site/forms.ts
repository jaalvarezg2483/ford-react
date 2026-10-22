import { publicOrigin } from './respond'
import { env } from '@/lib/env'
import { parseParams } from './controllers'
import { contactusEntity, asesorMail, processContact, resolveFamilyModel } from './contactus'
import { sendMail } from './mailer'
import { payloadClient } from './payload'
import { getSession, json, withSession } from './session'
import { handleCitas } from './citas'
import { handleCalculatorPost } from './calculator'
import { saveLocation } from './location'
import { quotationPdf } from './pdf'
import { handleFeedback } from './feedback'

/** Formularios del sitio (POST). Mismas URLs que el Symfony. */
export async function handleForm(req: Request): Promise<Response | null> {
  const url = new URL(req.url)
  const p = url.pathname.replace(/\/$/, '')
  const xhr = req.headers.get('x-requested-with') === 'XMLHttpRequest'

  if (p.startsWith('/citas/')) return handleCitas(req, url)
  if (p === '/save/location') return saveLocation(req)
  const feedback = await handleFeedback(req, p)
  if (feedback) return feedback
  const pdf = /^\/generate-pdf-quotation\/([^/]+)\/([^/]+)$/.exec(p)
  if (pdf) return quotationPdf(req, pdf[1], pdf[2])
  const calc = await handleCalculatorPost(req, url)
  if (calc) return calc

  const fields = await readFields(req)
  const session = await getSession(req)
  if (!(await captchaOk(fields))) {
    return xhr ? json({ msn: 'error', errors: 'Por favor active el CAPTCHA' }, 400, session) : redirect(localReturnPath(req, req.headers.get('referer')))
  }

  let m: RegExpExecArray | null
  const run = async (type: string, slug?: string, code?: string, override?: string) => {
    const { family, model } = await resolveFamilyModel(slug, code, fields)
    const result = await processContact({ type, fields, family, model, path: p, session })
    await session.save()
    const target = override ?? result.redirect
    if (xhr) return json({ msn: 'ok', redirect: absolute(req, target) }, 200, session)
    return withSession(redirect(target), session)
  }

  if (p === '/contacto') return run('contacto')
  if (p === '/solicitar-test-drive') return run('prueba-manejo', undefined, undefined, '/solicitar-test-drive/gracias')
  if (p === '/save/reservation') return run('reserva')
  if (p === '/enviar-cotizacion') return run('enviar-cotizacion')
  if ((m = /^\/accesorios\/([^/]+)\/(asesor|correo)$/.exec(p))) return run(m[2] === 'asesor' ? 'accesorios-asesor' : 'accesorios-correo', m[1])
  if ((m = /^\/autos\/([^/]+)\/calcular\/([^/]+)\/(prueba-manejo|reserva|correo|asesor)$/.exec(p))) {
    const type = { 'prueba-manejo': 'prueba-manejo', reserva: 'reserva', correo: 'enviar-correo', asesor: 'contactar-asesor' }[m[3]]!
    return run(type, m[1], m[2])
  }
  if ((m = /^\/autos\/([^/]+)\/calcular\/([^/]+)\/([^/]+)$/.exec(p))) return run(m[3], m[1], m[2])
  if ((m = /^\/autos\/asesor-cotizacion\/([^/]+)$/.exec(p))) return run(m[1])
  if ((m = /^\/snippet\/contact-form\/([^/]+)$/.exec(p))) return snippetForm(req, m[1], fields)
  if (/^\/(contactar-[a-z-]+|citastallermovil|seguridad)$/.test(p)) return run(p.slice(1) === 'seguridad' ? 'contactar-asesor-seguridad' : p.slice(1))
  return null
}

/** Formularios de contacto embebidos en páginas del CMS (SnippetController::renderDefaultFormSnippet). */
async function snippetForm(req: Request, type: string, fields: Record<string, string>): Promise<Response> {
  const referer = req.headers.get('referer') || '/'
  let sended = false
  try {
    const params = await snippetParams(type)
    const payload = await payloadClient()
    const aditional: Record<string, string> = {}
    for (const [k, v] of Object.entries(fields)) if (!['first_name', 'last_name', 'email', 'mobile', 'comment', '_token', 'g-recaptcha-response'].includes(k)) aditional[k] = v
    const lead = await payload.create({
      collection: 'leads',
      data: { form: `snippet:${type}`, path: new URL(referer, 'http://x').pathname, name: `${fields.first_name ?? ''} ${fields.last_name ?? ''}`.trim(), email: fields.email || undefined, phone: fields.mobile, data: fields },
      overrideAccess: true,
    })
    const to = String(params.mail || (await import('./legacy-data')).recipient('correo_nuevos', 'nuevos@purdymo.com'))
    const r = await sendMail({ to, subject: String(params.subject || 'Contacto - Ford'), html: asesorMail(contactusEntity(fields, aditional), params.description ? String(params.description) : null) })
    await payload.update({ collection: 'leads', id: lead.id, data: { emailTo: r.to, emailStatus: r.sent ? 'sent' : 'skipped', error: r.reason }, overrideAccess: true })
    sended = true
  } catch (error) {
    console.error(`Formulario ${type} falló`, error)
  }
  const res = redirect(localReturnPath(req, referer))
  res.headers.append('Set-Cookie', `snippet_sended=${sended ? 1 : 0}; Path=/; Max-Age=60; HttpOnly; SameSite=Lax${env.NODE_ENV === 'production' ? '; Secure' : ''}`)
  return res
}

/** Busca en las páginas el bloque renderDefaultFormSnippet con ese tipo para saber a quién enviar. */
async function snippetParams(type: string) {
  const payload = await payloadClient()
  const res = await payload.find({ collection: 'pages', where: { content: { contains: `'type': '${type}'` } }, limit: 1, depth: 0 })
  const content = (res.docs[0] as any)?.content || ''
  const m = new RegExp(`data-controller="LumenAppBundle:Snippet:renderDefaultFormSnippet" data-parameters="([^"]*'type': '${type}'[^"]*)"`).exec(content)
  return parseParams(m?.[1])
}

export async function readFields(req: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const ct = req.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const body = await req.json().catch(() => ({}))
    for (const [k, v] of Object.entries(body)) out[k] = String(v ?? '')
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

async function captchaOk(fields: Record<string, string>): Promise<boolean> {
  const token = fields['g-recaptcha-response']
  // Forms that submit a CAPTCHA token must never silently bypass verification
  // when Railway/Azure has not been given the matching server secret.
  if (!token) return true
  if (!env.RECAPTCHA_SECRET_KEY || token.length > 4096) return false
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token }),
    signal: AbortSignal.timeout(8_000),
  }).then(async (r) => r.ok ? r.json() : { success: false }).catch(() => ({ success: false }))
  return res.success === true
}

/** Only allow form redirects back to this site; Referer is client controlled. */
function localReturnPath(req: Request, candidate: string | null): string {
  if (!candidate) return '/'
  try {
    // Origen público: detrás del proxy `req.url` trae el host interno del contenedor.
    const base = new URL(publicOrigin(req))
    const target = new URL(candidate, base)
    return target.origin === base.origin ? `${target.pathname}${target.search}${target.hash}` : '/'
  } catch {
    return '/'
  }
}

function redirect(to: string): Response {
  return new Response(null, { status: 302, headers: { Location: to } })
}

function absolute(req: Request, path: string) {
  return /^https?:\/\//.test(path) ? path : publicOrigin(req) + path
}
