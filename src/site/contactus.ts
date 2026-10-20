import { renderTwig, setTwigParameters } from '@/legacy/twig'
import { env } from '@/lib/env'
import { gateway } from './gateway'
import { calculatorEntity, calculators, findFamily, findModel, locationName, recipient, siteParameters, type FamilyRecord } from './legacy-data'
import { sendMail, sendTestDriveTemplate } from './mailer'
import { payloadClient } from './payload'
import type { Session } from './session'

/**
 * Port de DefaultController::handleContactus del Symfony: guarda la solicitud,
 * registra el consentimiento informado y envía los mismos correos a los mismos
 * destinatarios. Devuelve la URL de "gracias" a la que redirigía el sitio.
 */
export type ContactInput = {
  type: string
  fields: Record<string, string>
  family?: FamilyRecord | null
  model?: { code: string; name: string; price?: number; legacyId?: number } | null
  path: string
  session?: Session
}

const BASE = ['first_name', 'last_name', 'email', 'mobile', 'comment']
const IGNORE = new Set(['_token', 'g-recaptcha-response', 'button'])

const CLIENT_TEMPLATES: Record<string, string> = {
  'enviar-correo': 'LumenAppBundle:Email:contactus.html.twig',
  'contactar-asesor-familias': 'LumenAppBundle:Email:contactus_asesor.html.twig',
  'contactar-asesor': 'LumenAppBundle:Email:contactus_asesor.html.twig',
  'accesorios-correo': 'LumenAppBundle:Email:accesories.html.twig',
  'prueba-manejo': 'LumenAppBundle:Email:test_drive.html.twig',
  'asesor-trabajo': 'LumenAppBundle:Email:contactar_asesor_trabajo.html.twig',
  reserva: 'LumenAppBundle:Email:contactus_reserva.html.twig',
}
const SESSION_TOTAL_TYPES = new Set(['enviar-correo', 'contactar-asesor', 'contactar-asesor-familias', 'prueba-manejo', 'enviar-cotizacion', 'accesorios-correo', 'accesorios-asesor', 'asesor-trabajo', 'reserva'])

async function contactSwitch(area: string | undefined) {
  switch (area) {
    case 'Ventas Vehículos Nuevos': return recipient('correo_ventas', 'digitalford@ga.cr')
    case 'Ventas Vehículos Usados': return recipient('correo_ventas_usados', 'tallerdecarroceriaypintura@purdymo.com')
    case 'Repuestos': return recipient('correo_repuestos', 'repuestospurdy@grupopurdy.com')
    case 'Accesorios': return recipient('correo_accesorios', 'repuestospurdy@grupopurdy.com')
    case 'Citas de Taller': return recipient('correo_citas', 'krojasp@grupopurdy.com,aquesadad@grupopurdy.com')
    case 'Carrocería y Pintura': return recipient('correo_mantenimiento', 'carroceriaypintura@grupopurdy.com')
    case 'Seguros': return recipient('correo_seguros', 'info-purdyseguros@grupopurdy.com')
    default: return recipient('correo_quejas', 'servicio_cliente@ga.cr')
  }
}

/** Objeto con la interfaz de la entidad Contactus que usan las plantillas Twig. */
export function contactusEntity(fields: Record<string, string>, aditional: Record<string, any>, family?: FamilyRecord | null, model?: ContactInput['model']) {
  const fam = family ? { ...family, getName: () => family.name, getSlug: () => family.slug, toString: () => family.name } : null
  const mod = model ? { ...model, getName: () => model.name, getCode: () => model.code, getStartPrice: () => model.price ?? 0, toString: () => model.name } : null
  const withEntity = () => {
    const v: Record<string, any> = { ...aditional }
    for (const k of ['button', 'debug', 'debugEmail', 'oid', 'lead_source', 'rating', 'retURL']) delete v[k]
    if (v.family != null && fam) v.family = fam
    if (v.model != null && mod) v.model = mod
    if (v.provincia) v.provincia = locationName.provincia(v.provincia) ?? v.provincia
    if (v.canton) v.canton = locationName.canton(v.canton) ?? v.canton
    if (v.distrito) v.distrito = locationName.distrito(v.distrito) ?? v.distrito
    return v
  }
  return {
    firstName: fields.first_name, lastName: fields.last_name, email: fields.email, mobile: fields.mobile, comment: fields.comment,
    getFirstName: () => fields.first_name, getLastName: () => fields.last_name, getEmail: () => fields.email, getMobile: () => fields.mobile, getComment: () => fields.comment,
    getFamily: () => fam, getModel: () => mod, family: fam, model: mod,
    getItems: () => aditional.accesories ?? [],
    getAditionalFields: (field?: string) => (field ? aditional[field] : aditional),
    aditionalFields: aditional,
    aditionalWithEntity: withEntity(),
    getCreatedAt: () => new Date(),
  }
}

export async function processContact(input: ContactInput): Promise<{ redirect: string; leadId?: number }> {
  const { type, fields, family, model, session } = input
  const aditional: Record<string, any> = {}
  for (const [k, v] of Object.entries(fields)) if (!BASE.includes(k) && !IGNORE.has(k)) aditional[k] = v
  if (SESSION_TOTAL_TYPES.has(type) && session) {
    aditional.accesories = session.get('accessories', null) ?? null
    aditional.insurance = session.get('insurance', null) ?? null
    aditional.maintenance = session.get('maintenance', null) ?? null
    let total = Number(model?.price ?? 0)
    total += Number(session.get('total', 0) || 0)
    aditional.total = total
    if (model?.price != null) aditional.price = model.price
  }

  const payload = await payloadClient()
  const lead = await payload.create({
    collection: 'leads',
    data: {
      form: type,
      path: input.path,
      name: [fields.first_name, fields.last_name].filter(Boolean).join(' '),
      email: fields.email || undefined,
      phone: fields.mobile,
      data: { ...fields, ...aditional, family: family?.name, model: model?.code },
    },
    overrideAccess: true,
  })
  const log: string[] = []
  const contactus = contactusEntity(fields, aditional, family, model)
  setTwigParameters(await siteParameters())

  // Consentimiento informado (InformedConsentConnector::subscribe)
  if (String(fields.consentimiento_informado) === '1' && fields.tipoCedula && fields.cedula && env.MICROSERVICES_GATEWAY) {
    const map: Record<string, string> = { Juridica: 'legal', Pasaporte: 'passport', DIMEX: 'dimex', Persona: 'person' }
    await gateway.subscribeConsent({ identificationType: map[fields.tipoCedula] ?? 'other', identification: fields.cedula, fullName: `${fields.first_name ?? ''} ${fields.last_name ?? ''}`, origin: 'FORDCR' })
      .then(() => log.push('consentimiento registrado'))
      .catch((e) => log.push(`consentimiento: ${e.message}`))
  }

  let emailTo = ''
  let status: 'sent' | 'failed' | 'skipped' = 'skipped'
  try {
    let subject: string | null = null
    let description: string | null = null
    if (CLIENT_TEMPLATES[type]) {
      const template = CLIENT_TEMPLATES[type]
      const financiamientos = (await calculators()).map(calculatorEntity)
      let bcc: string | null = null
      switch (type) {
        case 'accesorios-correo': bcc = await recipient('correo_accesorios', 'repuestospurdy@grupopurdy.com'); break
        case 'prueba-manejo': subject = 'Ford - Solicitud Test Drive'; break
        case 'asesor-trabajo': subject = 'Venta Nuevos Trabajo'; bcc = await recipient('asesor-trabajo', 'ventas@grupopurdy.com'); break
        case 'contactar-asesor': case 'contactar-asesor-familias': subject = 'Ford - Contactar asesor'; break
        case 'enviar-correo': subject = 'Ford - Cotización'; break
        case 'reserva': subject = 'Ford - Reserva'; description = 'Ford - Reserva'; break
      }
      if (type === 'prueba-manejo') {
        const r = await sendTestDriveTemplate(fields.email, `${fields.first_name ?? ''} ${fields.last_name ?? ''}`.trim(), subject!)
        if (r.sent) { status = 'sent'; emailTo = fields.email } else log.push(r.reason ?? '')
      } else if (fields.email) {
        const html = renderTwig(template, { contactus, financiamientos, insurancePrice: 0 })
        const r = await sendMail({ to: fields.email, subject: subject ?? (contactus.getItems()?.length ? 'Ford - Cotización' : 'Ford - Nuevo Contacto'), html, bcc })
        emailTo = r.to; status = r.sent ? 'sent' : 'skipped'; if (r.reason) log.push(r.reason)
      }
      if (type === 'contactar-asesor-familias' || type === 'reserva') {
        const to = await recipient('correo_ventas', 'digitalford@ga.cr')
        const bcc2 = type === 'reserva' ? await recipient('correo_reserva', 'jfcortess@grupopurdy.com') : null
        const r = await sendMail({ to, bcc: bcc2, subject: subject ?? 'Ford - Nuevo Contacto', html: asesorMail(contactus, description) })
        emailTo = [emailTo, r.to].filter(Boolean).join(', ')
        if (r.sent) status = 'sent'
      }
    } else {
      let to: string
      switch (type) {
        case 'accesorios-asesor': to = await recipient('correo_accesorios', 'repuestospurdy@grupopurdy.com'); break
        case 'contactar-seguros': to = await recipient('correo_seguros', 'info-purdyseguros@grupopurdy.com'); break
        case 'contactar-asesor-renting': to = await recipient('correo_empresa', 'mrojasc@grupopurdy.com'); break
        case 'contactar-asesor-repuestos': to = await recipient('correo_repuestos', 'repuestospurdy@grupopurdy.com'); description = 'Nuevo contacto repuestos'; break
        case 'citastallermovil': case 'contactar-mantenimiento': to = await recipient('correo_citas', 'krojasp@grupopurdy.com,aquesadad@grupopurdy.com'); break
        case 'contactar-asesor-comprar': to = await recipient('correo_ventas', 'digitalford@ga.cr'); break
        case 'contactar-asesor-seguridad': to = await recipient('correo_llamado_servicio', 'seguridadprimero@grupopurdy.com'); description = 'Programa su Seguridad Primero'; subject = 'Ford - Contacto Programa su Seguridad Primero'; break
        case 'contacto': to = await contactSwitch(fields.area); break
        default: to = await recipient('correo_nuevos', 'nuevos@purdymo.com')
      }
      const r = await sendMail({ to, subject: subject ?? 'Ford - Nuevo Contacto', html: asesorMail(contactus, description) })
      emailTo = r.to; status = r.sent ? 'sent' : 'skipped'; if (r.reason) log.push(r.reason)
    }
  } catch (error) {
    status = 'failed'
    log.push((error as Error).message)
    console.error(`Formulario ${type}: el correo falló`, error)
  }
  await payload.update({ collection: 'leads', id: lead.id, data: { emailTo, emailStatus: status, error: log.join('\n') || undefined }, overrideAccess: true })

  // Redirección a "gracias" (misma lógica de rutas del Symfony)
  let redirect: string
  if (type === 'solicitar_test_drive') redirect = '/solicitar-test-drive/gracias'
  else if (model && family) redirect = `/autos/${family.slug}/${type}/${model.code}/gracias`
  else if (family) redirect = `/contacto/${type}/${family.slug}/gracias`
  else if (type === 'contacto') redirect = '/contacto/gracias'
  else redirect = `/contacto/${type}/gracias`
  return { redirect, leadId: lead.id as number }
}

export function asesorMail(contactus: ReturnType<typeof contactusEntity>, description?: string | null) {
  return renderTwig('LumenAppBundle:Accessories:mail.html.twig', { message: contactus, accessories_list: [], description })
}

export async function resolveFamilyModel(slug?: string, code?: string, fields: Record<string, string> = {}) {
  let family = slug ? await findFamily({ slug }) : null
  if (!family && fields.family) family = await findFamily({ legacyId: fields.family })
  let model: ContactInput['model'] = null
  if (code) model = (await findModel({ code }, family))?.model ?? null
  if (!model && fields.model) {
    const hit = await findModel({ legacyId: fields.model }, family)
    if (hit) { model = hit.model; family ??= hit.family }
  }
  return { family, model }
}
