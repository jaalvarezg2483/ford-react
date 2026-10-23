import type { CollectionConfig } from 'payload'
import { canManageContent } from '../access'
import { revalidateSite } from '../hooks/revalidate'
import { editableArray, resolveImages, syncEditables, technical } from '../fields/editables'

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
  access: { read: canManageContent, create: canManageContent, update: canManageContent, delete: canManageContent },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const merged = { ...(originalDoc ?? {}), ...data }
        const pick = (d: any) =>
          (d?.template ?? merged.template) === 'raw'
            ? { rawDocument: d?.rawDocument ?? null }
            : { content: d?.content ?? null, metaHtml: d?.metaHtml ?? null, seoH1: d?.seoH1 ?? null }
        const res = syncEditables({
          sources: pick(merged),
          previousSources: originalDoc ? pick(originalDoc) : undefined,
          rows: data.editables ?? originalDoc?.editables,
          seoRows: data.seo ?? originalDoc?.seo,
          splitSeo: true,
        })
        if (res) {
          data.editables = res.rows
          data.seo = res.seoRows
        }
        data.editables = await resolveImages(data.editables, req)
        data.seo = await resolveImages(data.seo, req)
        return data
      },
    ],
    afterChange: [revalidateSite],
    afterDelete: [revalidateSite],
  },
  fields: [
    { name: 'path', type: 'text', label: 'Ruta', required: true, unique: true, index: true, admin: { position: 'sidebar', description: 'Ruta pública exacta, ej. /servicios o /autos/ranger-xlt/galeria' } },
    { name: 'status', type: 'select', label: 'Estado', defaultValue: 'published', admin: { position: 'sidebar' }, options: [{ label: 'Publicada', value: 'published' }, { label: 'Borrador', value: 'draft' }] },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          description: 'Textos, imágenes, botones y videos de la página, en el orden en que aparecen. El diseño no cambia: solo se reemplaza lo que editás.',
          fields: [
            editableArray('editables', 'Contenido de la página', 'Abrí cada pieza para cambiarla. "(editado)" marca lo que ya no es igual al original. No hace falta agregar ni borrar filas.'),
          ],
        },
        {
          label: 'SEO',
          description: 'Lo que ven Google y las redes sociales al compartir la página.',
          fields: [
            { name: 'title', type: 'text', label: 'Título de la pestaña y de Google' },
            editableArray('seo', 'Datos para buscadores y redes', 'Descripción, palabras clave, imagen y título al compartir, URL canónica.'),
          ],
        },
        {
          label: 'Avanzado (desarrollo)',
          description: 'HTML y scripts originales. Solo para el equipo de desarrollo.',
          fields: [
            {
              type: 'row',
              fields: ([
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
              ] as any[]).map(technical),
            },
            technical({ name: 'seoH1', type: 'text', label: 'H1 oculto (SEO) — HTML' }),
            technical({ name: 'content', type: 'code', label: 'Contenido (HTML)', admin: { language: 'html', condition: (data: any) => data?.template !== 'raw' } }),
            technical({ name: 'metaHtml', type: 'code', label: 'Etiquetas meta / Open Graph', admin: { language: 'html' } }),
            technical({ name: 'headStyles', type: 'code', label: 'Hojas de estilo propias (antes del CSS común)', admin: { language: 'html' } }),
            technical({ name: 'headCustom', type: 'code', label: 'Estilos y scripts propios (final del <head>)', admin: { language: 'html' } }),
            technical({ name: 'activeMenu', type: 'text', label: 'Menú activo', admin: { description: 'Enlaces del menú marcados como activos, separados por coma (subNuevos = Vehículos nuevos).' } }),
            technical({ name: 'bodyStart', type: 'code', label: 'Inicio del <body> propio (si difiere del común)', admin: { language: 'html', condition: (data: any) => data?.template !== 'raw' } }),
            technical({ name: 'route', type: 'text', label: 'Nombre de ruta Symfony (var route)' }),
            technical({ name: 'tail', type: 'code', label: 'Final del <body> propio (si difiere del común)', admin: { language: 'html', condition: (data: any) => data?.template !== 'raw' } }),
            technical({ name: 'scripts', type: 'code', label: 'Scripts de la página (al final del <body>)', admin: { language: 'html', condition: (data: any) => data?.template !== 'raw' } }),
            { name: 'priceRefs', type: 'json', admin: { hidden: true }, label: 'Precios de vehículos en el contenido' },
            technical({ name: 'rawDocument', type: 'code', label: 'Documento HTML completo', admin: { language: 'html', condition: (data: any) => data?.template === 'raw' } }),
          ],
        },
      ],
    },
  ],
}
