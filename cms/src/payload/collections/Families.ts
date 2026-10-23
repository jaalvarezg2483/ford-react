import type { CollectionConfig } from 'payload'
import { anyone, canManageContent } from '../access'
import { revalidateSite } from '../hooks/revalidate'
import { imageFields } from '../fields/image'

/** Familias de vehículos (Ranger XLT, Territory, Mustang GT…). */
export const Families: CollectionConfig = {
  slug: 'families',
  labels: { singular: 'Vehículo', plural: 'Vehículos' },
  admin: { group: 'Vehículos', useAsTitle: 'name', defaultColumns: ['name', 'slug', 'startPrice', 'year'] },
  access: { read: anyone, create: canManageContent, update: canManageContent, delete: canManageContent },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        { label: 'General', fields: [
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
        ] },
        { label: 'Ficha del vehículo', description: 'Lo que se ve en /autos/<vehículo>: banner, presentación, colores, características y galería.', fields: [
    { name: 'tagline', type: 'text', label: 'Frase de la ficha', admin: { description: 'Texto bajo el nombre del vehículo. Ej. "El poder y la resistencia se encuentran en el Ford Ranger XLT".' } },
    { type: 'row', fields: [
      ...imageFields('heroDesktop', 'Banner de la ficha (escritorio)'),
    ] },
    { type: 'row', fields: [
      ...imageFields('heroMobile', 'Banner de la ficha (celular)'),
    ] },
    { type: 'row', fields: [
      { name: 'leadTitle', type: 'text', label: 'Título de presentación', admin: { placeholder: 'Ford Ranger XLT | Ford Costa Rica | Grupo Purdy' } },
      { name: 'purdyGoUrl', type: 'text', label: 'Enlace de Purdy Go (reserva en línea)' },
    ] },
    { name: 'leadText', type: 'textarea', label: 'Texto de presentación' },
    { name: 'showCalculate', type: 'checkbox', label: 'Mostrar botones de calcular financiamiento', defaultValue: true },
    {
      name: 'colors',
      type: 'array',
      label: 'Colores',
      labels: { singular: 'Color', plural: 'Colores' },
      admin: { initCollapsed: true, description: 'Fotos del vehículo en cada color, en el orden del selector.' },
      fields: [
        { type: 'row', fields: [
          { name: 'name', type: 'text', required: true, label: 'Nombre' },
          { name: 'hex', type: 'text', label: 'Color (hex)', admin: { placeholder: '#0d0e0f' } },
        ] },
        ...imageFields('image', 'Foto del color'),
        { name: 'disclaimer', type: 'text', label: 'Nota (opcional)' },
      ],
    },
    {
      name: 'highlights',
      type: 'array',
      label: 'Características destacadas',
      labels: { singular: 'Característica', plural: 'Características destacadas' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        { name: 'text', type: 'textarea', label: 'Texto' },
        ...imageFields('image', 'Imagen'),
      ],
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Galería',
      labels: { singular: 'Sección', plural: 'Secciones de la galería' },
      admin: { initCollapsed: true, description: 'Secciones como Exterior o Interior. La ficha muestra las primeras fotos.' },
      fields: [
        { name: 'title', type: 'text', label: 'Título de la sección', admin: { placeholder: 'Exterior' } },
        {
          name: 'items',
          type: 'array',
          label: 'Fotos',
          labels: { singular: 'Foto', plural: 'Fotos' },
          fields: [
            ...imageFields('image', 'Foto'),
            { name: 'caption', type: 'text', label: 'Texto de la foto' },
          ],
        },
      ],
    },
        ] },
        { label: 'Modelos y precios', fields: [
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
          ...imageFields('image', 'Foto del modelo'),
          { name: 'calculable', type: 'checkbox', label: 'Mostrar "Calcular financiamiento"', defaultValue: true },
        ] },
        { type: 'row', fields: [
          { name: 'familySalesForce', type: 'text', label: 'Familia Salesforce' },
          { name: 'categorySalesForce', type: 'text', label: 'Categoría Salesforce' },
        ] },
        {
          name: 'features',
          type: 'array',
          label: 'Equipamiento',
          labels: { singular: 'Ítem de equipamiento', plural: 'Equipamiento' },
          admin: { initCollapsed: true, description: 'Un ítem por renglón. Se pueden arrastrar para cambiar el orden.' },
          fields: [{ name: 'item', type: 'text', required: true, label: 'Ítem' }],
        },
        {
          name: 'specs',
          type: 'group',
          label: 'Especificaciones (comparador)',
          admin: { description: 'Lo que se muestra en el comparador de modelos. Dejá vacío lo que no aplique.' },
          fields: [
            { type: 'row', fields: [
              { name: 'cc', type: 'number', label: 'Cilindrada (cc)' },
              { name: 'gas', type: 'text', label: 'Combustible', admin: { placeholder: 'Diésel, Gasolina, Híbrido…' } },
              { name: 'traction', type: 'text', label: 'Tracción', admin: { placeholder: '4x2, 4x4, AWD…' } },
              { name: 'transmission', type: 'text', label: 'Transmisión', admin: { placeholder: 'Automática, Manual…' } },
              { name: 'pasajeros', type: 'text', label: 'Pasajeros' },
            ] },
            { type: 'row', fields: [
              { name: 'totalLength', type: 'text', label: 'Largo total' },
              { name: 'totalHeight', type: 'text', label: 'Alto total' },
              { name: 'totalWidth', type: 'text', label: 'Ancho total' },
              { name: 'distanceBetweenAxis', type: 'text', label: 'Distancia entre ejes' },
            ] },
          ],
        },
      ],
    },
        ] },
        { label: 'Descargas', fields: [
    { name: 'dataSheets', type: 'array', label: 'Fichas técnicas', fields: [
      { name: 'title', type: 'text' },
      { name: 'file', type: 'upload', relationTo: 'media' },
      { name: 'legacyId', type: 'number' },
    ] },
        ] },
      ],
    },
  ],
}
