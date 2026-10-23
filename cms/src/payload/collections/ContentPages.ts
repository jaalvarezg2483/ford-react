import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'
import { contentBlocks } from '../blocks/content'
import { imageFields } from '../fields/image'

/**
 * Páginas de contenido del sitio (servicios, seguros, sobre nosotros, tecnología, reglamentos…).
 * Cada página se arma con bloques; el sitio React los dibuja con sus propios componentes.
 */
export const ContentPages: CollectionConfig = {
  slug: 'content-pages',
  labels: { singular: 'Página de contenido', plural: 'Páginas de contenido' },
  admin: { group: 'Contenido', useAsTitle: 'title', defaultColumns: ['title', 'path', 'active', 'updatedAt'] },
  access: { read: authenticated, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'path',
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { type: 'row', fields: [
      { name: 'title', type: 'text', required: true, label: 'Título (pestaña del navegador)', admin: { description: 'Se le agrega "| Ford Costa Rica | Grupo Purdy".' } },
      { name: 'path', type: 'text', required: true, unique: true, index: true, label: 'Ruta', admin: { description: 'Ej. /servicios o /seguros/coberturas. Empieza con "/" y sin barra final.' }, validate: (v: unknown) => (typeof v === 'string' && /^\/[a-z0-9\-/_]*[a-z0-9_-]$/i.test(v)) || 'Use una ruta como /servicios (sin espacios ni barra final)' },
      { name: 'active', type: 'checkbox', defaultValue: true, label: 'Publicada' },
    ] },
    { name: 'description', type: 'textarea', label: 'Descripción para buscadores y redes' },
    ...imageFields('image', 'Imagen para redes'),
    { name: 'layout', type: 'blocks', label: 'Contenido', labels: { singular: 'Bloque', plural: 'Bloques' }, blocks: contentBlocks },
  ],
}
