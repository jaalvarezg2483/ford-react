import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'

/** Categorías de vehículos (Pickups, SUVs & Crossovers, Automóviles, Ford Performance). */
export const FamilyTypes: CollectionConfig = {
  slug: 'family-types',
  labels: { singular: 'Categoría', plural: 'Categorías de vehículos' },
  admin: { group: 'Vehículos', useAsTitle: 'name', defaultColumns: ['name', 'order', 'active'] },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre' },
    { type: 'row', fields: [
      { name: 'order', type: 'number', label: 'Orden', defaultValue: 0 },
      { name: 'active', type: 'checkbox', label: 'Visible en el sitio', defaultValue: true },
      { name: 'textColor', type: 'text', label: 'Color del texto', defaultValue: '#000000' },
      { name: 'underlineColor', type: 'text', label: 'Color del subrayado', defaultValue: '#000000' },
    ] },
    { name: 'families', type: 'relationship', relationTo: 'families', hasMany: true, label: 'Vehículos (en orden)' },
    { name: 'menuHtml', type: 'code', label: 'Texto adicional en el menú (HTML)', admin: { language: 'html', description: 'Ej. el bloque de Ford Performance bajo los vehículos.' } },
  ],
}
