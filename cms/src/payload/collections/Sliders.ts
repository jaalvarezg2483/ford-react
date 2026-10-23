import type { CollectionConfig } from 'payload'
import { anyone, canManageContent } from '../access'
import { revalidateSite } from '../hooks/revalidate'

/** Banners rotativos (renderSlider del CMS anterior). La página los inserta por nombre. */
export const Sliders: CollectionConfig = {
  slug: 'sliders',
  labels: { singular: 'Slider', plural: 'Sliders (banners)' },
  admin: { group: 'Contenido', useAsTitle: 'name', defaultColumns: ['name', 'updatedAt'] },
  access: { read: anyone, create: canManageContent, update: canManageContent, delete: canManageContent },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true, label: 'Nombre', admin: { description: 'Ej. BANNER_HOME. Debe coincidir con data-parameters del contenido.' } },
    {
      name: 'slides',
      type: 'array',
      label: 'Banners',
      labels: { singular: 'Banner', plural: 'Banners' },
      fields: [
        { name: 'active', type: 'checkbox', label: 'Visible', defaultValue: true },
        { name: 'imageXs', type: 'upload', relationTo: 'media', label: 'Imagen móvil (hasta 599px)' },
        { name: 'imageMd', type: 'upload', relationTo: 'media', label: 'Imagen tablet (600–767px)' },
        { name: 'imageLg', type: 'upload', relationTo: 'media', label: 'Imagen escritorio (768px+)' },
        { name: 'video', type: 'text', label: 'Video de fondo (URL mp4)' },
        { name: 'imageAlt', type: 'text', label: 'Texto alternativo' },
        { name: 'title', type: 'text', label: 'Título' },
        { name: 'link', type: 'text', label: 'Enlace del botón' },
        { name: 'btnText', type: 'text', label: 'Texto del botón' },
      ],
    },
  ],
}
