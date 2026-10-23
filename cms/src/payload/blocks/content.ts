import type { Block, Field } from 'payload'
import { imageFields } from '../fields/image'

const html = (name: string, label: string): Field => ({
  name,
  type: 'code',
  label,
  admin: { language: 'html', description: 'HTML del texto (párrafos, listas, enlaces, negritas). Se limpia al publicar: sin scripts.' },
})

/** Bloques con los que negocio arma las páginas de contenido (servicios, seguros, sobre nosotros, tecnología…). */
export const contentBlocks: Block[] = [
  {
    slug: 'html',
    labels: { singular: 'Texto', plural: 'Textos' },
    fields: [html('html', 'Contenido')],
  },
  {
    slug: 'slider',
    labels: { singular: 'Banner rotativo', plural: 'Banners rotativos' },
    fields: [
      { name: 'slider', type: 'relationship', relationTo: 'sliders', required: true, label: 'Slider', admin: { description: 'Se administra en "Sliders (banners)".' } },
      { type: 'row', fields: [
        { name: 'showContainer', type: 'checkbox', defaultValue: true, label: 'Con contenedor' },
        { name: 'showBackLink', type: 'checkbox', defaultValue: false, label: 'Con enlace "Volver"' },
      ] },
    ],
  },
  {
    slug: 'cards',
    labels: { singular: 'Tarjetas con enlace', plural: 'Tarjetas con enlace' },
    fields: [
      {
        name: 'items',
        type: 'array',
        label: 'Tarjetas',
        labels: { singular: 'Tarjeta', plural: 'Tarjetas' },
        fields: [
          { name: 'title', type: 'text', required: true, label: 'Título' },
          { name: 'href', type: 'text', required: true, label: 'Enlace', admin: { description: 'Ruta del sitio (/seguros) o archivo (/documents/…pdf).' } },
          ...imageFields('image', 'Imagen'),
          { name: 'alt', type: 'text', label: 'Texto alternativo' },
        ],
      },
    ],
  },
  {
    slug: 'contactForm',
    labels: { singular: 'Formulario de contacto', plural: 'Formularios de contacto' },
    fields: [
      { type: 'row', fields: [
        { name: 'formType', type: 'text', required: true, label: 'Identificador', admin: { description: 'Distingue el formulario en las solicitudes (ej. contacto-repuestos).' } },
        { name: 'title', type: 'text', label: 'Título' },
      ] },
      { type: 'row', fields: [
        { name: 'phone', type: 'text', label: 'Teléfono (central telefónica)' },
        { name: 'mail', type: 'text', label: 'Correo que recibe las solicitudes' },
      ] },
      { name: 'subject', type: 'text', label: 'Asunto del correo' },
      { name: 'description', type: 'textarea', label: 'Texto introductorio' },
    ],
  },
  {
    slug: 'aboutTabs',
    labels: { singular: 'Pestañas con fotos (sobre nosotros)', plural: 'Pestañas con fotos' },
    fields: [
      {
        name: 'tabs',
        type: 'array',
        label: 'Pestañas',
        labels: { singular: 'Pestaña', plural: 'Pestañas' },
        fields: [
          { name: 'title', type: 'text', required: true, label: 'Título' },
          { name: 'text', type: 'textarea', label: 'Texto' },
          {
            name: 'images',
            type: 'array',
            label: 'Fotos',
            labels: { singular: 'Foto', plural: 'Fotos' },
            fields: imageFields('image', 'Foto'),
          },
        ],
      },
    ],
  },
  {
    slug: 'timeline',
    labels: { singular: 'Línea de tiempo', plural: 'Líneas de tiempo' },
    fields: [
      { name: 'title', type: 'text', label: 'Título' },
      {
        name: 'items',
        type: 'array',
        label: 'Hitos',
        labels: { singular: 'Hito', plural: 'Hitos' },
        fields: [
          { name: 'year', type: 'text', required: true, label: 'Año' },
          { name: 'text', type: 'textarea', label: 'Texto' },
          ...imageFields('image', 'Imagen'),
        ],
      },
    ],
  },
  {
    slug: 'simpleBanner',
    labels: { singular: 'Banner con texto', plural: 'Banners con texto' },
    fields: [
      {
        name: 'slides',
        type: 'array',
        label: 'Banners',
        labels: { singular: 'Banner', plural: 'Banners' },
        fields: [
          ...imageFields('imageXs', 'Imagen móvil'),
          ...imageFields('imageMd', 'Imagen tablet'),
          ...imageFields('imageLg', 'Imagen escritorio'),
          { name: 'alt', type: 'text', label: 'Texto alternativo' },
          { name: 'title', type: 'text', label: 'Título' },
          { name: 'text', type: 'textarea', label: 'Texto' },
        ],
      },
    ],
  },
  {
    slug: 'techCards',
    labels: { singular: 'Tecnología: tarjetas con "Ver más"', plural: 'Tecnología: tarjetas' },
    fields: [
      { type: 'row', fields: [
        { name: 'anchor', type: 'text', label: 'Ancla (id)', admin: { description: 'Ej. ford_security. Permite enlazar a #ford_security.' } },
        { name: 'title', type: 'text', required: true, label: 'Título de la sección' },
      ] },
      {
        name: 'cards',
        type: 'array',
        label: 'Tarjetas',
        labels: { singular: 'Tarjeta', plural: 'Tarjetas' },
        fields: [
          { name: 'title', type: 'text', required: true, label: 'Título' },
          html('html', 'Descripción'),
          ...imageFields('image', 'Imagen'),
        ],
      },
    ],
  },
  {
    slug: 'techHotspots',
    labels: { singular: 'Tecnología: imagen con puntos', plural: 'Tecnología: imágenes con puntos' },
    fields: [
      { type: 'row', fields: [
        { name: 'anchor', type: 'text', label: 'Ancla (id)' },
        { name: 'title', type: 'text', required: true, label: 'Título de la sección' },
      ] },
      ...imageFields('image', 'Imagen principal'),
      {
        name: 'dots',
        type: 'array',
        label: 'Puntos',
        labels: { singular: 'Punto', plural: 'Puntos' },
        fields: [
          { type: 'row', fields: [
            { name: 'top', type: 'text', required: true, label: 'Posición vertical', admin: { description: 'Porcentaje, ej. 46%' } },
            { name: 'left', type: 'text', required: true, label: 'Posición horizontal', admin: { description: 'Porcentaje, ej. 30%' } },
          ] },
          { name: 'title', type: 'text', required: true, label: 'Título' },
          html('html', 'Descripción'),
          ...imageFields('image', 'Imagen'),
        ],
      },
    ],
  },
  {
    slug: 'techTabs',
    labels: { singular: 'Tecnología: pestañas con video', plural: 'Tecnología: pestañas con video' },
    fields: [
      { type: 'row', fields: [
        { name: 'anchor', type: 'text', label: 'Ancla (id)' },
        { name: 'title', type: 'text', required: true, label: 'Título de la sección' },
      ] },
      {
        name: 'tabs',
        type: 'array',
        label: 'Pestañas',
        labels: { singular: 'Pestaña', plural: 'Pestañas' },
        fields: [
          { name: 'label', type: 'text', required: true, label: 'Texto de la pestaña' },
          { name: 'title', type: 'text', label: 'Título' },
          html('html', 'Descripción'),
          ...imageFields('image', 'Imagen'),
          { name: 'videoUrl', type: 'text', label: 'Video (YouTube)' },
        ],
      },
    ],
  },
  {
    slug: 'vehiclePicker',
    labels: { singular: 'Selector de vehículo', plural: 'Selectores de vehículo' },
    fields: [
      { type: 'row', fields: [
        { name: 'title', type: 'text', defaultValue: 'Seleccione un vehículo', label: 'Título' },
        { name: 'linkBase', type: 'text', required: true, defaultValue: '/accesorios/', label: 'Ruta base del enlace', admin: { description: 'Se le agrega la familia: /accesorios/ranger-xlt' } },
      ] },
      { type: 'row', fields: [
        { name: 'intro', type: 'text', label: 'Texto bajo el título (opcional)' },
        { name: 'aside', type: 'text', label: 'Enlace lateral (opcional)', admin: { description: 'Texto del enlace fijo a la izquierda en escritorio (ej. Accesorios).' } },
      ] },
    ],
  },
  {
    slug: 'downloads',
    labels: { singular: 'Archivos para descargar', plural: 'Archivos para descargar' },
    fields: [
      { type: 'row', fields: [
        { name: 'title', type: 'text', required: true, label: 'Título' },
        { name: 'breadcrumb', type: 'text', label: 'Migas de pan (texto final)', admin: { description: 'Si se llena, muestra Inicio > este texto.' } },
      ] },
      {
        name: 'items',
        type: 'array',
        label: 'Archivos',
        labels: { singular: 'Archivo', plural: 'Archivos' },
        fields: [
          { name: 'title', type: 'text', required: true, label: 'Nombre' },
          { name: 'file', type: 'upload', relationTo: 'media', label: 'Archivo (PDF)' },
          { name: 'filePath', type: 'text', label: 'Ruta del archivo (si no se sube)', admin: { description: 'Ej. /uploads/file/reglamentos/archivo.pdf' } },
        ],
      },
    ],
  },
]
