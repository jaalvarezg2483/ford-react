import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'

/** Familias de vehículos (Ranger XLT, Territory, Mustang GT…). */
export const Families: CollectionConfig = {
  slug: 'families',
  labels: { singular: 'Vehículo', plural: 'Vehículos' },
  admin: { group: 'Vehículos', useAsTitle: 'name', defaultColumns: ['name', 'slug', 'startPrice', 'year'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { type: 'row', fields: [
      { name: 'name', type: 'text', required: true, label: 'Nombre' },
      { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'Slug (URL /autos/…)' },
      { name: 'code', type: 'text', label: 'Código' },
      { name: 'legacyId', type: 'number', label: 'ID Symfony', admin: { readOnly: true } },
    ] },
    { type: 'row', fields: [
      { name: 'startPrice', type: 'number', label: 'Precio desde (USD)' },
      { name: 'year', type: 'number', label: 'Año' },
      { name: 'fordPerformance', type: 'checkbox', label: 'Sello Ford Performance' },
      { name: 'hidePrice', type: 'checkbox', label: 'Ocultar precio' },
    ] },
    { type: 'row', fields: [
      { name: 'menuImage', type: 'upload', relationTo: 'media', label: 'Imagen del menú' },
      { name: 'homeImage', type: 'upload', relationTo: 'media', label: 'Imagen del carrusel de inicio' },
      { name: 'homeColor', type: 'text', label: 'Color de fondo en inicio', defaultValue: '#16a1cc' },
    ] },
    { name: 'homeGradient', type: 'text', label: 'Degradado en inicio', defaultValue: 'linear-gradient(35deg, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0) 30%)' },
    { name: 'description', type: 'textarea', label: 'Descripción' },
    {
      name: 'models',
      type: 'array',
      label: 'Modelos / versiones',
      fields: [
        { type: 'row', fields: [
          { name: 'code', type: 'text', label: 'Código' },
          { name: 'name', type: 'text', label: 'Nombre' },
          { name: 'year', type: 'number', label: 'Año' },
          { name: 'legacyId', type: 'number', label: 'ID Symfony' },
          { name: 'price', type: 'number', label: 'Precio (USD)' },
        ] },
        { type: 'row', fields: [
          { name: 'familySalesForce', type: 'text', label: 'Familia Salesforce' },
          { name: 'categorySalesForce', type: 'text', label: 'Categoría Salesforce' },
        ] },
        { name: 'features', type: 'json', label: 'Equipamiento (lista)' },
        {
          name: 'specs',
          type: 'json',
          label: 'Especificaciones (comparador)',
          admin: { description: 'cc, traction, gas, transmission, pasajeros, totalLength, totalHeight, totalWidth, distanceBetweenAxis' },
        },
      ],
    },
    { name: 'dataSheets', type: 'array', label: 'Fichas técnicas', fields: [
      { name: 'title', type: 'text' },
      { name: 'file', type: 'upload', relationTo: 'media' },
      { name: 'legacyId', type: 'number' },
    ] },
  ],
}
