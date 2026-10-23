import type { GlobalConfig } from 'payload'
import { authenticated } from '../access'
import { bumpSiteVersion } from '@/lib/siteVersion'
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
  access: { read: authenticated, update: authenticated },
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
            {
              name: 'footer',
              type: 'group',
              label: 'Pie de página',
              fields: [
                {
                  name: 'links',
                  type: 'array',
                  label: 'Enlaces',
                  labels: { singular: 'Enlace', plural: 'Enlaces' },
                  admin: { description: 'Columnas de enlaces del pie. "Vehículos nuevos" (que abre el menú) se agrega solo al inicio.' },
                  fields: [
                    { type: 'row', fields: [
                      ...link,
                      { name: 'highlight', type: 'checkbox', label: 'Destacado (negrita con flecha)' },
                    ] },
                  ],
                },
                { name: 'ethicsText', type: 'textarea', label: 'Texto de la Línea Ética' },
                { type: 'row', fields: [
                  { name: 'ethicsUrl', type: 'text', label: 'Enlace de la Línea Ética' },
                  { name: 'ethicsButton', type: 'text', label: 'Texto del botón', defaultValue: 'Info Aquí' },
                ] },
                {
                  name: 'bottomLinks',
                  type: 'array',
                  label: 'Enlaces inferiores',
                  labels: { singular: 'Enlace', plural: 'Enlaces inferiores' },
                  fields: [
                    { type: 'row', fields: [
                      ...link,
                      { name: 'newTab', type: 'checkbox', label: 'Abrir en otra pestaña' },
                    ] },
                  ],
                },
                { name: 'copyright', type: 'text', label: 'Texto de derechos', defaultValue: '©{year} All rights reserved', admin: { description: '{year} se reemplaza por el año actual.' } },
              ],
            },
            editableArray('footerEditables', 'Pie de página', 'Textos, enlaces e imágenes del pie de página.'),
            technical({ name: 'footerHtml', type: 'code', label: 'Pie de página (HTML) — desarrollo', admin: { language: 'html' } }),
            technical({ name: 'floatingHtml', type: 'code', label: 'Botones flotantes y chat (HTML)', admin: { language: 'html' } }),
          ],
        },
        {
          label: 'Redes sociales',
          fields: [
            {
              name: 'social',
              type: 'array',
              label: 'Redes sociales (menú y pie)',
              labels: { singular: 'Red social', plural: 'Redes sociales' },
              fields: [
                { type: 'row', fields: [
                  { name: 'network', type: 'select', required: true, label: 'Red', options: [
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'TikTok', value: 'tiktok' },
                  ] },
                  { name: 'href', type: 'text', required: true, label: 'Enlace' },
                  { name: 'inMenu', type: 'checkbox', label: 'También en el menú', defaultValue: true },
                ] },
              ],
            },
          ],
        },
        {
          label: 'WhatsApp',
          fields: [
            {
              name: 'whatsapp',
              type: 'group',
              label: 'Botón flotante de WhatsApp',
              fields: [
                { type: 'row', fields: [
                  { name: 'phone', type: 'text', label: 'Número (con código de país)', admin: { placeholder: '50685891000' } },
                  { name: 'label', type: 'text', label: 'Texto', defaultValue: 'WhatsApp' },
                ] },
                { name: 'message', type: 'text', label: 'Mensaje inicial', defaultValue: 'Quiero información de Ford' },
              ],
            },
          ],
        },
        {
          label: 'Medición',
          fields: [
            { type: 'row', fields: [
              { name: 'gtmId', type: 'text', label: 'Google Tag Manager (ID)', admin: { placeholder: 'GTM-XXXXXXX' } },
              { name: 'site24x7Key', type: 'text', label: 'Site24x7 RUM (appKey)' },
            ] },
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
