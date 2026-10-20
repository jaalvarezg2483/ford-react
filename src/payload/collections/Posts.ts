import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'

/** Fichas de las notas del blog para listados (renderCategory, renderRecentBlog). El cuerpo vive en Páginas. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Nota del blog', plural: 'Blog' },
  admin: { group: 'Contenido', useAsTitle: 'title', defaultColumns: ['title', 'category', 'publishedAt', 'path'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: '-publishedAt',
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    { name: 'path', type: 'text', required: true, unique: true, label: 'Ruta', admin: { description: 'Ej. /blog/mi-nota. El contenido se edita en la Página con la misma ruta.' } },
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
  ],
}
