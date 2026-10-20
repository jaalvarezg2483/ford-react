import type { GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { bumpSiteVersion } from '@/site/cache'
import { editableArray, resolveImages, syncEditables, technical } from '../fields/editables'

const link = [
  { name: 'label', type: 'text', required: true, label: 'Texto' },
  { name: 'href', type: 'text', required: true, label: 'Enlace' },
] as const

/** Partes comunes del sitio: menú, pie, scripts de medición y metadatos por defecto. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuración del sitio',
  admin: { group: 'Sistema' },
  access: { read: anyone, update: authenticated },
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const html = data.footerHtml ?? originalDoc?.footerHtml
        const res = syncEditables({
          sources: { html },
          previousSources: originalDoc ? { html: originalDoc.footerHtml } : undefined,
          rows: data.footerEditables ?? originalDoc?.footerEditables,
          splitSeo: false,
        })
        if (res) data.footerEditables = res.rows
        data.footerEditables = await resolveImages(data.footerEditables, req)
        return data
      },
    ],
    afterChange: [() => bumpSiteVersion()],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menú',
          fields: [
            { name: 'topMenu', type: 'array', label: 'Menú principal (después de "Vehículos nuevos")', fields: [...link] },
            technical({ name: 'rightMenuHtml', type: 'code', label: 'Menú derecho (HTML)', admin: { language: 'html' } }),
            technical({ name: 'socialMenuHtml', type: 'code', label: 'Redes sociales del menú (HTML)', admin: { language: 'html' } }),
            technical({ name: 'searchHtml', type: 'code', label: 'Buscador (HTML)', admin: { language: 'html' } }),
          ],
        },
        {
          label: 'Pie de página',
          fields: [
            editableArray('footerEditables', 'Pie de página', 'Textos, enlaces e imágenes del pie de página.'),
            technical({ name: 'footerHtml', type: 'code', label: 'Pie de página (HTML) — desarrollo', admin: { language: 'html' } }),
            technical({ name: 'floatingHtml', type: 'code', label: 'Botones flotantes y chat (HTML)', admin: { language: 'html' } }),
          ],
        },
        {
          label: 'Scripts',
          fields: [
            technical({ name: 'headScripts', type: 'code', label: 'Scripts del <head> (GTM, Facebook, etc.)', admin: { language: 'html' } }),
            technical({ name: 'bodyStartHtml', type: 'code', label: 'Inicio del <body> (noscript GTM)', admin: { language: 'html' } }),
            technical({ name: 'bodyEndScripts', type: 'code', label: 'Scripts al final del <body>', admin: { language: 'html' } }),
            { name: 'assetsVersion', type: 'text', label: 'Versión de CSS/JS (?v=)', defaultValue: '1775667654984' },
          ],
        },
        {
          label: 'Calculadora',
          fields: [
            {
              name: 'calculators',
              type: 'array',
              label: 'Entidades financieras',
              labels: { singular: 'Entidad financiera', plural: 'Entidades financieras' },
              fields: [
                { type: 'row', fields: [
                  { name: 'name', type: 'text', required: true, label: 'Nombre' },
                  { name: 'rate', type: 'number', label: 'Tasa de interés (%)' },
                  { name: 'commission', type: 'number', label: 'Comisión (%)' },
                  { name: 'prima', type: 'number', label: 'Prima mínima (%)' },
                ] },
                { type: 'row', fields: [
                  { name: 'termMonth', type: 'number', hasMany: true, label: 'Plazos (meses)', admin: { description: 'Escribí cada plazo y Enter. Ej.: 12, 24, 36.' } },
                  { name: 'terms', type: 'number', hasMany: true, label: 'Plazos (años)' },
                ] },
                { type: 'row', fields: [
                  { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logo' },
                  { name: 'image', type: 'text', label: 'Logo actual (ruta del sitio anterior)', admin: { description: 'Se usa mientras no se suba un logo nuevo.' } },
                ] },
                { name: 'legacyId', type: 'number', label: 'ID Symfony', admin: { readOnly: true } },
              ],
            },
          ],
        },
        {
          label: 'Parámetros',
          description: 'Parámetros del sitio anterior (tabla parameter del Symfony), ej. CITAS_MAINTENANCE_MODAL_ENABLED.',
          fields: [
            { name: 'parameters', type: 'array', label: 'Parámetros', fields: [
              { type: 'row', fields: [
                { name: 'name', type: 'text', required: true, label: 'Nombre' },
                { name: 'value', type: 'textarea', label: 'Valor' },
              ] },
            ] },
          ],
        },
        {
          label: 'SEO',
          fields: [
            technical({ name: 'defaultMetaHtml', type: 'code', label: 'Meta por defecto', admin: { language: 'html' } }),
            { name: 'titleSuffix', type: 'text', label: 'Sufijo del título', defaultValue: ' | Ford Costa Rica | Grupo Purdy' },
          ],
        },
      ],
    },
  ],
}
