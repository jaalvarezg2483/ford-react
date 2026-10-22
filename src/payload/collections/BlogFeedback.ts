import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/**
 * Votos 👍/👎 de las notas del blog y opiniones (AjaxController del Symfony:
 * article-poll, article-opinion y register-workshop).
 */
export const BlogFeedback: CollectionConfig = {
  slug: 'blog-feedback',
  labels: { singular: 'Opinión del blog', plural: 'Opiniones del blog' },
  admin: { group: 'Formularios', useAsTitle: 'kind', defaultColumns: ['kind', 'articleId', 'name', 'email', 'createdAt'] },
  access: { read: authenticated, create: () => false, update: authenticated, delete: authenticated },
  defaultSort: '-createdAt',
  fields: [
    { type: 'row', fields: [
      { name: 'kind', type: 'select', required: true, index: true, label: 'Tipo', options: [
        { label: 'Me gusta', value: 'up' },
        { label: 'No me gusta', value: 'down' },
        { label: 'Opinión', value: 'opinion' },
        { label: 'Registro de taller', value: 'workshop' },
      ] },
      { name: 'articleId', type: 'number', required: true, index: true, label: 'ID de la nota (Symfony)' },
      { name: 'workshopId', type: 'number', label: 'ID del taller' },
    ] },
    { type: 'row', fields: [
      { name: 'name', type: 'text', label: 'Nombre' },
      { name: 'email', type: 'text', label: 'Correo' },
    ] },
    { name: 'opinion', type: 'textarea', label: 'Opinión' },
  ],
}
