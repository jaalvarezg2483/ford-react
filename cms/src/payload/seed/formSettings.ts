import type { Payload } from 'payload'

/** Mismos destinatarios de correo que el sitio anterior. */
export const LEGACY_RECIPIENTS: { key: string; to: string; description: string }[] = [
  { key: 'correo_ventas', to: 'digitalford@ga.cr', description: 'Ventas vehículos nuevos (contactar asesor, reservas, contacto "Ventas Vehículos Nuevos")' },
  { key: 'correo_ventas_usados', to: 'tallerdecarroceriaypintura@purdymo.com', description: 'Contacto "Ventas Vehículos Usados"' },
  { key: 'correo_repuestos', to: 'repuestospurdy@grupopurdy.com', description: 'Repuestos' },
  { key: 'correo_accesorios', to: 'repuestospurdy@grupopurdy.com', description: 'Accesorios (asesor y copia de cotizaciones)' },
  { key: 'correo_citas', to: 'krojasp@grupopurdy.com,aquesadad@grupopurdy.com', description: 'Citas de taller y mantenimiento' },
  { key: 'correo_mantenimiento', to: 'carroceriaypintura@grupopurdy.com', description: 'Carrocería y pintura' },
  { key: 'correo_seguros', to: 'info-purdyseguros@grupopurdy.com', description: 'Seguros' },
  { key: 'correo_quejas', to: 'servicio_cliente@ga.cr', description: 'Quejas, reclamos y distribuidores' },
  { key: 'correo_nuevos', to: 'nuevos@purdymo.com', description: 'Formularios sin destino específico' },
  { key: 'correo_sucursal', to: 'info-digital@grupopurdy.com', description: 'Sucursal (test drive)' },
  { key: 'correo_reserva', to: 'jfcortess@grupopurdy.com', description: 'Copia de reservas' },
  { key: 'correo_empresa', to: 'mrojasc@grupopurdy.com', description: 'Empresas / renting' },
  { key: 'correo_llamado_servicio', to: 'seguridadprimero@grupopurdy.com', description: 'Programa Seguridad Primero' },
]

export async function seedFormSettings(payload: Payload) {
  const current = (await payload.findGlobal({ slug: 'form-settings', depth: 0, overrideAccess: true })) as { recipients?: { key: string }[] }
  const have = new Set((current.recipients ?? []).map((r) => r.key))
  const missing = LEGACY_RECIPIENTS.filter((r) => !have.has(r.key))
  if (!missing.length) return
  await payload.updateGlobal({
    slug: 'form-settings',
    data: { recipients: [...(current.recipients ?? []), ...missing] } as any,
    overrideAccess: true,
  })
}
