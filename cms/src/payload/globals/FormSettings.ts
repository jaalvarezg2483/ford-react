import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access'

/**
 * Destinatarios de cada formulario. Los valores iniciales son los mismos
 * correos que usaba el sitio anterior.
 */
export const FormSettings: GlobalConfig = {
  slug: 'form-settings',
  label: 'Formularios y correos',
  admin: { group: 'Formularios' },
  access: { read: isAdmin, update: isAdmin },
  fields: [
    {
      name: 'recipients',
      type: 'array',
      label: 'Destinatarios por formulario',
      fields: [
        { type: 'row', fields: [
          { name: 'key', type: 'text', required: true, label: 'Clave' },
          { name: 'to', type: 'text', required: true, label: 'Correos (separados por coma)' },
        ] },
        { name: 'description', type: 'text', label: 'Descripción' },
      ],
    },
  ],
}
