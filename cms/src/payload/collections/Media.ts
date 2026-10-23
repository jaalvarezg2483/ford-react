import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/**
 * Archivos del sitio. `legacyPath` conserva la ruta pública del Symfony
 * (/uploads/family/abc.png, /media/cache/...): el sitio sigue sirviendo cada
 * archivo en la misma URL para no romper SEO, correos ni contenido HTML.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Archivos' },
  admin: { group: 'Contenido', useAsTitle: 'filename', defaultColumns: ['filename', 'legacyPath', 'mimeType', 'updatedAt'] },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    staticDir: 'media',
    imageSizes: [],
    focalPoint: false,
    crop: false,
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'application/zip', 'application/octet-stream'],
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Texto alternativo' },
    {
      name: 'legacyPath',
      type: 'text',
      label: 'Ruta pública',
      unique: true,
      index: true,
      admin: { description: 'URL donde se publica el archivo (ej. /uploads/family/foto.png). Si se deja vacío se usa /uploads/cms/<archivo>.' },
      hooks: {
        beforeChange: [
          ({ value, data }) => value || (data?.filename ? `/uploads/cms/${data.filename}` : value),
        ],
      },
    },
  ],
}
