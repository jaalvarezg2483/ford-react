import type { Field } from 'payload'

/**
 * Imagen del sitio: se sube al CMS (archivo) o, mientras la importación no la trae,
 * se usa la ruta pública (/uploads/...). El sitio usa primero el archivo subido.
 */
export function imageFields(name: string, label: string, opts: { required?: boolean } = {}): Field[] {
  return [
    { name, type: 'upload', relationTo: 'media', label, required: opts.required },
    { name: `${name}Path`, type: 'text', label: `${label} (ruta, si no se sube)`, admin: { description: 'Ruta pública, ej. /uploads/gallery/foto.png' } },
  ]
}
