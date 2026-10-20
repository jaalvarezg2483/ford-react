import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateSite } from '../hooks/revalidate'

/**
 * Páginas del sitio. Cada página guarda el HTML de su contenido tal como lo
 * publicaba el CMS Symfony. Los bloques dinámicos se marcan igual que en el
 * CMS anterior, con <div data-controller="..." data-parameters="..."></div>:
 * el sitio los llena con datos vivos (familias, banners, blog, etc.).
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Página', plural: 'Páginas' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'path',
    defaultColumns: ['path', 'title', 'template', 'status', 'updatedAt'],
    listSearchableFields: ['path', 'title'],
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { status: { equals: 'published' } }),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { afterChange: [revalidateSite], afterDelete: [revalidateSite] },
  fields: [
    { name: 'path', type: 'text', label: 'Ruta', required: true, unique: true, index: true, admin: { description: 'Ruta pública exacta, ej. /servicios o /autos/ranger-xlt/galeria' } },
    { name: 'title', type: 'text', label: 'Título (<title>)' },
    {
      type: 'row',
      fields: [
        { name: 'status', type: 'select', defaultValue: 'published', options: [{ label: 'Publicada', value: 'published' }, { label: 'Borrador', value: 'draft' }] },
        {
          name: 'template',
          type: 'select',
          label: 'Plantilla',
          defaultValue: 'default',
          options: [
            { label: 'Sitio (encabezado y pie)', value: 'default' },
            { label: 'Documento completo (HTML propio)', value: 'raw' },
          ],
        },
        { name: 'httpStatus', type: 'number', label: 'Código HTTP', defaultValue: 200 },
        { name: 'bodyClass', type: 'text', label: 'Clase del <body>' },
      ],
    },
    { name: 'seoH1', type: 'text', label: 'H1 oculto (SEO)' },
    {
      name: 'content',
      type: 'code',
      label: 'Contenido (HTML)',
      admin: { language: 'html', condition: (data) => data?.template !== 'raw' },
    },
    {
      type: 'collapsible',
      label: 'SEO y encabezado',
      admin: { initCollapsed: true },
      fields: [
        { name: 'metaHtml', type: 'code', label: 'Etiquetas meta / Open Graph', admin: { language: 'html' } },
        { name: 'headStyles', type: 'code', label: 'Hojas de estilo propias (antes del CSS común)', admin: { language: 'html' } },
        { name: 'headCustom', type: 'code', label: 'Estilos y scripts propios (final del <head>)', admin: { language: 'html' } },
      ],
    },
    { name: 'activeMenu', type: 'text', label: 'Menú activo', admin: { position: 'sidebar', description: 'Enlaces del menú marcados como activos, separados por coma (subNuevos = Vehículos nuevos).' } },
    { name: 'bodyStart', type: 'code', label: 'Inicio del <body> propio (si difiere del común)', admin: { language: 'html', condition: (data) => data?.template !== 'raw' } },
    { name: 'route', type: 'text', label: 'Nombre de ruta Symfony (var route)', admin: { position: 'sidebar' } },
    { name: 'tail', type: 'code', label: 'Final del <body> propio (si difiere del común)', admin: { language: 'html', condition: (data) => data?.template !== 'raw' } },
    { name: 'scripts', type: 'code', label: 'Scripts de la página (al final del <body>)', admin: { language: 'html', condition: (data) => data?.template !== 'raw' } },
    { name: 'priceRefs', type: 'json', admin: { hidden: true }, label: 'Precios de vehículos en el contenido' },
    { name: 'rawDocument', type: 'code', label: 'Documento HTML completo', admin: { language: 'html', condition: (data) => data?.template === 'raw' } },
  ],
}
