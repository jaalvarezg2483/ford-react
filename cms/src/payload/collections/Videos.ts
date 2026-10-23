import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'

/** Videos de /videos (YouTube), agrupados por categoría. */
export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  admin: { group: 'Contenido', useAsTitle: 'name', defaultColumns: ['name', 'category', 'order'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Título' },
    { type: 'row', fields: [
      { name: 'category', type: 'text', required: true, label: 'Categoría' },
      { name: 'order', type: 'number', label: 'Orden', defaultValue: 0 },
      { name: 'active', type: 'checkbox', label: 'Visible', defaultValue: true },
    ] },
    { name: 'youtube', type: 'text', required: true, label: 'URL de YouTube' },
    { name: 'image', type: 'text', label: 'Miniatura (URL)', admin: { description: 'Si se deja vacía se usa la miniatura de YouTube.' } },
    { name: 'description', type: 'textarea', label: 'Descripción' },
  ],
}
