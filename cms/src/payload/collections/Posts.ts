import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'
import { imageFields } from '../fields/image'

/** Notas del blog: ficha para listados y artículo completo. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Nota del blog', plural: 'Blog' },
  admin: { group: 'Contenido', useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt', 'path'] },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: '-publishedAt',
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    { name: 'path', type: 'text', required: true, unique: true, label: 'Ruta', admin: { description: 'Ej. /blog/mi-nota.' } },
    { type: 'row', fields: [
      { name: 'category', type: 'text', label: 'Categoría' },
      { name: 'publishedAt', type: 'date', label: 'Fecha' },
      { name: 'active', type: 'checkbox', defaultValue: true, label: 'Visible en listados' },
    ] },
    { type: 'row', fields: [
      { name: 'categoryId', type: 'number', label: 'ID de categoría (filtro)', admin: { description: 'Identificador del filtro del blog (checkbox-ID).' } },
      { name: 'views', type: 'number', label: 'Visualizaciones', defaultValue: 0 },
      { name: 'featured', type: 'checkbox', label: 'Destacada', admin: { description: 'Sale como "Destacado" en /blog. Si ninguna está marcada, se usa la más vista.' } },
    ] },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen' },
    { name: 'summary', type: 'textarea', label: 'Resumen' },
    {
      type: 'collapsible',
      label: 'Artículo',
      admin: { initCollapsed: false },
      fields: [
        { name: 'heading', type: 'text', label: 'Título dentro del artículo', admin: { description: 'Si se deja vacío se usa el título.' } },
        ...imageFields('banner', 'Banner superior'),
        { name: 'bodyHtml', type: 'code', label: 'Contenido del artículo', admin: { language: 'html', description: 'Texto del artículo. Se limpia al publicarlo (sin scripts).' } },
        { type: 'row', fields: [
          { name: 'articleId', type: 'number', label: 'ID de la nota (Symfony)', admin: { readOnly: true } },
          { name: 'pollUp', type: 'number', label: 'Votos 👍 al importar', defaultValue: 0 },
          { name: 'pollDown', type: 'number', label: 'Votos 👎 al importar', defaultValue: 0 },
        ] },
        { name: 'metaDescription', type: 'textarea', label: 'Descripción para buscadores y redes' },
      ],
    },
  ],
}
