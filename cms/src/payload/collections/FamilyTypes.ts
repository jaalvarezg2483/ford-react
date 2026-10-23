import type { CollectionConfig } from 'payload'
import { canManageContent } from '../access'
import { revalidateSite } from '../hooks/revalidate'
import { editableArray, resolveImages, syncEditables, technical } from '../fields/editables'

/** Categorías de vehículos (Pickups, SUVs & Crossovers, Automóviles, Ford Performance). */
export const FamilyTypes: CollectionConfig = {
  slug: 'family-types',
  labels: { singular: 'Categoría', plural: 'Categorías de vehículos' },
  admin: { group: 'Vehículos', useAsTitle: 'name', defaultColumns: ['name', 'order', 'active'] },
  access: { read: canManageContent, create: canManageContent, update: canManageContent, delete: canManageContent },
  defaultSort: 'order',
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const res = syncEditables({
          sources: { html: data.menuHtml ?? originalDoc?.menuHtml },
          previousSources: originalDoc ? { html: originalDoc.menuHtml } : undefined,
          rows: data.menuEditables ?? originalDoc?.menuEditables,
          splitSeo: false,
        })
        if (res) data.menuEditables = res.rows
        data.menuEditables = await resolveImages(data.menuEditables, req)
        return data
      },
    ],
    afterChange: [revalidateSite],
    afterDelete: [revalidateSite],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    { type: 'row', fields: [
      { name: 'order', type: 'number', label: 'Orden', defaultValue: 0 },
      { name: 'active', type: 'checkbox', label: 'Visible en el sitio', defaultValue: true },
      { name: 'textColor', type: 'text', label: 'Color del texto', defaultValue: '#000000' },
      { name: 'underlineColor', type: 'text', label: 'Color del subrayado', defaultValue: '#000000' },
    ] },
    { name: 'families', type: 'relationship', relationTo: 'families', hasMany: true, label: 'Vehículos (en orden)' },
    {
      name: 'cardStyles',
      type: 'array',
      label: 'Tarjetas de la portada',
      labels: { singular: 'Tarjeta', plural: 'Tarjetas de la portada' },
      admin: { initCollapsed: true, description: 'Cómo se ve cada vehículo de esta categoría en el carrusel de inicio.' },
      fields: [
        { type: 'row', fields: [
          { name: 'slug', type: 'text', required: true, label: 'Vehículo (slug de la URL /autos/…)' },
          { name: 'color', type: 'text', label: 'Color de fondo', admin: { placeholder: '#16a1cc' } },
        ] },
        { name: 'image', type: 'text', label: 'Imagen (ruta)', admin: { placeholder: '/uploads/…' } },
        { name: 'gradient', type: 'text', label: 'Degradado (opcional)' },
      ],
    },
    {
      name: 'promo',
      type: 'group',
      label: 'Bloque bajo los vehículos del menú',
      admin: { description: 'Ej. el texto de Ford Performance. Vacío = no se muestra.' },
      fields: [
        { type: 'row', fields: [
          { name: 'logo', type: 'text', label: 'Logo (ruta)', admin: { placeholder: '/img/logos/…' } },
          { name: 'title', type: 'text', label: 'Título' },
        ] },
        { name: 'paragraphs', type: 'array', label: 'Párrafos', fields: [{ name: 'text', type: 'textarea', required: true, label: 'Texto' }] },
      ],
    },
    editableArray('menuEditables', 'Texto adicional en el menú', 'Ej. el bloque de Ford Performance bajo los vehículos.'),
    technical({ name: 'menuHtml', type: 'code', label: 'Texto adicional en el menú (HTML) — desarrollo', admin: { language: 'html' } }),
  ],
}
