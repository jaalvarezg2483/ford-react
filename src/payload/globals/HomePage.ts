import type { Field, GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { bumpSiteVersion } from '@/site/cache'

const cta = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { type: 'row', fields: [
      { name: 'kicker', type: 'text', label: 'Antetítulo' },
      { name: 'title', type: 'text', label: 'Título' },
      { name: 'titleMobile', type: 'text', label: 'Título en celular (si cambia)' },
    ] },
    { name: 'text', type: 'textarea', label: 'Texto' },
    { type: 'row', fields: [
      { name: 'linkLabel', type: 'text', label: 'Texto del botón' },
      { name: 'href', type: 'text', label: 'Enlace' },
    ] },
  ],
})

/** Contenido de la portada: cada sección es un componente del sitio. */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Portada',
  admin: { group: 'Contenido' },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [() => bumpSiteVersion()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Encabezado',
          fields: [
            { name: 'title', type: 'text', label: 'Título de la página (SEO)' },
            { name: 'description', type: 'textarea', label: 'Descripción (SEO)' },
            { name: 'heroSlider', type: 'text', label: 'Banner principal (nombre del carrusel)', defaultValue: 'BANNER_HOME' },
            { name: 'vehiclesTitle', type: 'text', label: 'Título de vehículos', defaultValue: 'Vehículos Nuevos' },
          ],
        },
        {
          label: 'Servicios',
          fields: [
            { name: 'servicesTitle', type: 'text', label: 'Título', defaultValue: 'Servicios' },
            { name: 'servicesText', type: 'textarea', label: 'Texto' },
            {
              name: 'serviceRows',
              type: 'array',
              label: 'Filas de tarjetas',
              labels: { singular: 'Fila', plural: 'Filas' },
              fields: [
                {
                  name: 'cards',
                  type: 'array',
                  label: 'Tarjetas',
                  labels: { singular: 'Tarjeta', plural: 'Tarjetas' },
                  fields: [
                    { type: 'row', fields: [
                      { name: 'title', type: 'text', required: true, label: 'Título' },
                      { name: 'href', type: 'text', required: true, label: 'Enlace' },
                    ] },
                    { type: 'row', fields: [
                      { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen' },
                      { name: 'imagePath', type: 'text', label: 'Imagen (ruta, si no se sube)' },
                      { name: 'alt', type: 'text', label: 'Texto alternativo' },
                    ] },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Tecnología',
          fields: [
            { type: 'row', fields: [
              { name: 'techKicker', type: 'text', label: 'Antetítulo', defaultValue: 'Tecnología' },
              { name: 'techTitle', type: 'text', label: 'Título', defaultValue: 'FORD' },
            ] },
            { name: 'techText', type: 'textarea', label: 'Texto' },
            {
              name: 'techItems',
              type: 'array',
              label: 'Tecnologías',
              labels: { singular: 'Tecnología', plural: 'Tecnologías' },
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Título' },
                { name: 'text', type: 'textarea', label: 'Texto' },
                { type: 'row', fields: [
                  { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen' },
                  { name: 'imagePath', type: 'text', label: 'Imagen (ruta, si no se sube)' },
                ] },
              ],
            },
          ],
        },
        {
          label: 'Llamados',
          fields: [
            cta('financing', 'Calcule su financiamiento'),
            cta('compare', 'Comparar vehículos'),
            cta('contact', 'Contacto'),
            { name: 'newsSize', type: 'number', label: 'Cantidad de noticias recientes', defaultValue: 6 },
          ],
        },
        {
          label: 'App Purdy Go',
          fields: [
            {
              name: 'app',
              type: 'group',
              label: 'Promoción de la app',
              fields: [
                { type: 'row', fields: [
                  { name: 'title', type: 'text', label: 'Título' },
                  { name: 'text', type: 'text', label: 'Texto' },
                ] },
                { type: 'row', fields: [
                  { name: 'buttonLabel', type: 'text', label: 'Texto del botón' },
                  { name: 'registerUrl', type: 'text', label: 'Enlace de registro' },
                ] },
                { type: 'row', fields: [
                  { name: 'appStoreUrl', type: 'text', label: 'App Store' },
                  { name: 'playStoreUrl', type: 'text', label: 'Google Play' },
                ] },
                { type: 'row', fields: [
                  { name: 'logo', type: 'text', label: 'Logo (ruta)' },
                  { name: 'phoneMobile', type: 'text', label: 'Teléfono, móvil (ruta)' },
                  { name: 'phoneDesktop', type: 'text', label: 'Teléfono, escritorio (ruta)' },
                ] },
              ],
            },
          ],
        },
        {
          label: 'Medición',
          fields: [
            {
              name: 'sizmek',
              type: 'group',
              label: 'Sizmek DSP (retargeting)',
              fields: [
                { type: 'row', fields: [
                  { name: 'rb', type: 'text', label: 'rb' },
                  { name: 'ca', type: 'text', label: 'ca' },
                ] },
              ],
            },
          ],
        },
      ],
    },
  ],
}
