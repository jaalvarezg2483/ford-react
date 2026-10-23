import type { Endpoint } from 'payload'
import { processContact, processSnippet, validateContact, validateLead, validateSnippet } from '../../lib/forms/contact'
import { captchaOk, json, readFields } from '../../lib/http'
import { getSession } from '../../lib/session'
import { clientIp, isSameSite, rateLimited } from '../../lib/rateLimit'

const MAX_FORM_SUBMISSIONS_PER_HOUR = 20

function formType(req: { routeParams?: Record<string, unknown> }): string {
  return String(req.routeParams?.type ?? '')
    .trim()
    .replace(/[^a-z0-9_-]/gi, '')
}

function refererPath(req: Request, fallback: string): string {
  const referer = req.headers.get('referer')
  if (!referer) return fallback
  try {
    return new URL(referer).pathname || fallback
  } catch {
    return fallback
  }
}

async function handleLead(req: Request, type: string, fallbackPath: string) {
  const session = await getSession(req)
  if (!isSameSite(req)) return json({ error: 'Solicitud inválida' }, 403, session)
  if (rateLimited(`form:${clientIp(req)}`, MAX_FORM_SUBMISSIONS_PER_HOUR, 60 * 60 * 1000)) {
    return json({ error: 'Demasiadas solicitudes. Intente más tarde.' }, 429, session)
  }
  const fields = await readFields(req)
  if (!(await captchaOk(fields))) return json({ error: 'Por favor active el CAPTCHA' }, 400, session)
  const error = type === 'contacto' ? validateContact(fields) : validateLead(fields, type)
  if (error) return json({ error }, 400, session)
  try {
    const result = await processContact({ type, fields, path: refererPath(req, fallbackPath) })
    await session.save()
    return json({ ok: true, redirect: result.redirect }, 200, session)
  } catch {
    return json({ error: 'No se pudo enviar el mensaje. Intente de nuevo.' }, 500, session)
  }
}

/**
 * Formularios y correos (contacto, test drive, asesor, reserva, cotización por correo, snippets de contacto…).
 * Cada endpoint queda en /api/<path> (no usar nombres de colecciones: leads, pages, posts, families, media…).
 */
export const formsEndpoints: Endpoint[] = [
  {
    path: '/forms/contacto',
    method: 'post',
    handler: async (req) => handleLead(req as unknown as Request, 'contacto', '/contacto'),
  },
  {
    path: '/forms/snippet/:type',
    method: 'post',
    handler: async (req) => {
      const request = req as unknown as Request
      const session = await getSession(request)
      if (!isSameSite(request)) return json({ error: 'Solicitud inválida' }, 403, session)
      if (rateLimited(`form:${clientIp(request)}`, MAX_FORM_SUBMISSIONS_PER_HOUR, 60 * 60 * 1000)) {
        return json({ error: 'Demasiadas solicitudes. Intente más tarde.' }, 429, session)
      }
      const type = formType(req)
      if (!type) return json({ error: 'Solicitud inválida' }, 400, session)
      const fields = await readFields(request)
      if (!(await captchaOk(fields))) return json({ error: 'Por favor active el CAPTCHA' }, 400, session)
      const error = validateSnippet(fields)
      if (error) return json({ error }, 400, session)
      try {
        await processSnippet(type, fields, refererPath(request, '/snippet'))
        await session.save()
        return json({ ok: true }, 200, session)
      } catch {
        return json({ error: 'No se pudo enviar el mensaje. Intente de nuevo.' }, 500, session)
      }
    },
  },
  {
    path: '/forms/:type',
    method: 'post',
    handler: async (req) => {
      const type = formType(req)
      if (!type || type === 'snippet') return json({ error: 'Solicitud inválida' }, 400)
      return handleLead(req as unknown as Request, type, `/${type}`)
    },
  },
]
