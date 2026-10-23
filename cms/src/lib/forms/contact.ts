import { findFamily, findModel, recipient, type FamilyRecord } from '../data'
import { asesorMail } from '../emails/asesor'
import { sendMail } from '../mailer'
import { payloadClient } from '../payload'

const BASE = ['first_name', 'last_name', 'email', 'mobile', 'comment']
const IGNORE = new Set(['_token', 'g-recaptcha-response', 'button', 'mail', 'subject', 'description'])
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const CONTACT_AREAS = [
  'Ventas Vehículos Nuevos',
  'Ventas Vehículos Usados',
  'Repuestos',
  'Accesorios',
  'Citas de Taller',
  'Carrocería y Pintura',
  'Seguros',
  'Quejas o Reclamos',
] as const

export const CONTACT_SUCURSALES = ['Aleste', 'Escazú', 'La Uruca', 'Liberia', 'Pérez Zeledón', 'San Carlos'] as const

export type ContactInput = {
  type: string
  fields: Record<string, string>
  path: string
  family?: FamilyRecord | null
  model?: { code: string; name: string; price?: number; legacyId?: number } | null
}

function trim(fields: Record<string, string>, key: string): string {
  return (fields[key] ?? '').trim()
}

function extraFields(fields: Record<string, string>): Record<string, string> {
  const extra: Record<string, string> = {}
  for (const [key, value] of Object.entries(fields)) {
    if (BASE.includes(key) || IGNORE.has(key)) continue
    const text = String(value ?? '').trim()
    if (text) extra[key] = text
  }
  const comment = trim(fields, 'comment')
  if (comment) extra.comment = comment
  return extra
}

function leadPayload(type: string, path: string, fields: Record<string, string>, extra: Record<string, string>, familyName?: string, modelCode?: string) {
  const data = { ...fields }
  delete data['g-recaptcha-response']
  delete data._token
  return {
    form: type,
    path,
    name: [trim(fields, 'first_name'), trim(fields, 'last_name')].filter(Boolean).join(' '),
    email: trim(fields, 'email') || undefined,
    phone: trim(fields, 'mobile') || trim(fields, 'phone_number'),
    data: { ...data, ...extra, family: familyName, model: modelCode },
  }
}

function contactMail(fields: Record<string, string>, extra: Record<string, string>) {
  return {
    firstName: trim(fields, 'first_name'),
    lastName: trim(fields, 'last_name'),
    mobile: trim(fields, 'mobile') || trim(fields, 'phone_number'),
    email: trim(fields, 'email'),
    extra,
  }
}

export function validateContact(fields: Record<string, string>): string | null {
  if (!trim(fields, 'first_name')) return 'El nombre es obligatorio'
  if (!trim(fields, 'last_name')) return 'Los apellidos son obligatorios'
  const email = trim(fields, 'email')
  if (!email) return 'El correo electrónico es obligatorio'
  if (!EMAIL.test(email)) return 'Formato de correo inválido'
  if (!trim(fields, 'mobile')) return 'El número telefónico es obligatorio'
  if (!trim(fields, 'comment')) return 'El mensaje es obligatorio'
  const area = trim(fields, 'area')
  if (!area) return 'El área o departamento es obligatorio'
  if (!(CONTACT_AREAS as readonly string[]).includes(area)) return 'El área o departamento no es válido'
  const sucursal = trim(fields, 'sucursal')
  if (!sucursal) return 'La sucursal es obligatoria'
  if (!(CONTACT_SUCURSALES as readonly string[]).includes(sucursal)) return 'La sucursal no es válida'
  return null
}

export function validateSnippet(fields: Record<string, string>): string | null {
  if (!trim(fields, 'first_name')) return 'El nombre es obligatorio'
  if (!trim(fields, 'last_name')) return 'Los apellidos son obligatorios'
  const email = trim(fields, 'email')
  if (!email) return 'El correo electrónico es obligatorio'
  if (!EMAIL.test(email)) return 'Formato de correo inválido'
  if (!trim(fields, 'mobile')) return 'El número telefónico es obligatorio'
  if (!trim(fields, 'comment')) return 'El mensaje es obligatorio'
  return null
}

const TEST_DRIVE_TYPES = new Set(['test-drive', 'solicitar_test_drive', 'prueba-manejo'])

/** Leads (test drive, reserva, asesor, correo…): datos de contacto; sucursal o mensaje según el tipo. */
export function validateLead(fields: Record<string, string>, type: string): string | null {
  if (!trim(fields, 'first_name')) return 'El nombre es obligatorio'
  if (!trim(fields, 'last_name')) return 'Los apellidos son obligatorios'
  const email = trim(fields, 'email')
  if (!email) return 'El correo electrónico es obligatorio'
  if (!EMAIL.test(email)) return 'Formato de correo inválido'
  const mobile = trim(fields, 'mobile') || trim(fields, 'phone_number')
  if (!mobile) return 'El número telefónico es obligatorio'
  if (!/^\d+$/.test(mobile)) return 'Por favor, escribe sólo números'
  if (type === 'citas-taller-movil') {
    const plate = trim(fields, 'plate')
    if (!plate) return 'La placa es obligatoria'
    if (plate.length < 5) return 'La placa debe tener al menos 5 caracteres'
    return null
  }
  if (TEST_DRIVE_TYPES.has(type) || type === 'reserva') {
    const sucursal = trim(fields, 'sucursal')
    if (!sucursal) return 'La sucursal es obligatoria'
    if (!(CONTACT_SUCURSALES as readonly string[]).includes(sucursal)) return 'La sucursal no es válida'
  }
  if (type === 'asesor' && !trim(fields, 'comment')) return 'El mensaje es obligatorio'
  return null
}

async function contactRecipient(area: string): Promise<string> {
  switch (area) {
    case 'Ventas Vehículos Nuevos':
      return recipient('correo_ventas', 'digitalford@ga.cr')
    case 'Ventas Vehículos Usados':
      return recipient('correo_ventas_usados', 'tallerdecarroceriaypintura@purdymo.com')
    case 'Repuestos':
      return recipient('correo_repuestos', 'repuestospurdy@grupopurdy.com')
    case 'Accesorios':
      return recipient('correo_accesorios', 'repuestospurdy@grupopurdy.com')
    case 'Citas de Taller':
      return recipient('correo_citas', 'krojasp@grupopurdy.com,aquesadad@grupopurdy.com')
    case 'Carrocería y Pintura':
      return recipient('correo_mantenimiento', 'carroceriaypintura@grupopurdy.com')
    case 'Seguros':
      return recipient('correo_seguros', 'info-purdyseguros@grupopurdy.com')
    default:
      return recipient('correo_quejas', 'servicio_cliente@ga.cr')
  }
}

async function resolveFamilyModel(fields: Record<string, string>, family?: FamilyRecord | null, model?: ContactInput['model']) {
  let resolvedFamily = family ?? null
  let resolvedModel = model ?? null
  const familyKey = trim(fields, 'family') || trim(fields, 'slug')
  const modelKey = trim(fields, 'model') || trim(fields, 'code')
  if (!resolvedFamily && familyKey) resolvedFamily = await findFamily({ slug: familyKey, legacyId: familyKey })
  if (!resolvedModel && modelKey) {
    const hit = await findModel({ code: modelKey, legacyId: modelKey }, resolvedFamily)
    if (hit) {
      resolvedModel = hit.model
      resolvedFamily ??= hit.family
    }
  }
  return { family: resolvedFamily, model: resolvedModel }
}

function redirectTo(type: string, family?: FamilyRecord | null, model?: ContactInput['model']): string {
  if (type === 'solicitar_test_drive' || type === 'prueba-manejo') return '/solicitar-test-drive/gracias'
  if (type === 'citas-taller-movil') return '/contacto/citas-taller-movil/gracias'
  if (model && family) return `/autos/${family.slug}/${type}/${model.code}/gracias`
  if (family) return `/contacto/${type}/${family.slug}/gracias`
  if (type === 'contacto') return '/contacto/gracias'
  return `/contacto/${type}/gracias`
}

export async function processContact(input: ContactInput): Promise<{ redirect: string; leadId?: number }> {
  const { type, fields } = input
  const extra = extraFields(fields)
  const { family, model } = await resolveFamilyModel(fields, input.family, input.model)
  const payload = await payloadClient()
  const lead = await payload.create({
    collection: 'leads',
    data: leadPayload(type, input.path, fields, extra, family?.name, model?.code),
    overrideAccess: true,
  })

  let emailTo = ''
  let status: 'sent' | 'failed' | 'skipped' = 'skipped'
  let error: string | undefined
  try {
    const to =
      type === 'contacto'
        ? await contactRecipient(trim(fields, 'area'))
        : type === 'citas-taller-movil'
          ? await recipient('correo_citas', 'krojasp@grupopurdy.com,aquesadad@grupopurdy.com')
          : await recipient('correo_nuevos', 'nuevos@purdymo.com')
    const result = await sendMail({
      to,
      subject: 'Ford - Nuevo Contacto',
      html: asesorMail(contactMail(fields, extra)),
      replyTo: trim(fields, 'email') || undefined,
    })
    emailTo = result.to
    status = result.sent ? 'sent' : 'skipped'
    if (result.reason) error = result.reason
  } catch (err) {
    status = 'failed'
    error = err instanceof Error ? err.message : 'Error al enviar el correo'
  }

  await payload.update({
    collection: 'leads',
    id: lead.id,
    data: { emailTo, emailStatus: status, error },
    overrideAccess: true,
  })

  return { redirect: redirectTo(type, family, model), leadId: Number(lead.id) }
}

export async function processSnippet(type: string, fields: Record<string, string>, path: string): Promise<{ ok: true }> {
  const extra = extraFields(fields)
  const payload = await payloadClient()
  const lead = await payload.create({
    collection: 'leads',
    data: leadPayload(`snippet:${type}`, path, fields, extra),
    overrideAccess: true,
  })

  let emailTo = ''
  let status: 'sent' | 'failed' | 'skipped' = 'skipped'
  let error: string | undefined
  try {
    const to = trim(fields, 'mail') || (await recipient('correo_nuevos', 'nuevos@purdymo.com'))
    const result = await sendMail({
      to,
      subject: trim(fields, 'subject') || 'Contacto - Ford',
      html: asesorMail(contactMail(fields, extra), trim(fields, 'description') || null),
      replyTo: trim(fields, 'email') || undefined,
    })
    emailTo = result.to
    status = result.sent ? 'sent' : 'skipped'
    if (result.reason) error = result.reason
  } catch (err) {
    status = 'failed'
    error = err instanceof Error ? err.message : 'Error al enviar el correo'
  }

  await payload.update({
    collection: 'leads',
    id: lead.id,
    data: { emailTo, emailStatus: status, error },
    overrideAccess: true,
  })

  return { ok: true }
}
