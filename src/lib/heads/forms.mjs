/**
 * Metadatos (título, descripción, noindex) de las páginas del módulo "forms".
 * Cada regla: { test: RegExp sobre la ruta sin barra final, head: (match, { content, origin, suffix }) => { title, description?, image?, noindex? } }.
 * Gana la primera regla que coincide. Los títulos salen de ford.cr (tabla pages del CMS importado).
 */
/** @type {Array<{ test: RegExp; head: (m: RegExpExecArray, ctx: { content: any; origin: string; suffix: string }) => { title?: string; description?: string; image?: string; noindex?: boolean } }>} */
export default [
  {
    test: /^\/contacto\/gracias$/,
    head: () => ({ title: 'Contacto - Gracias | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/contacto\/.+\/gracias$/,
    head: () => ({ title: 'Contacto - Gracias | Ford Costa Rica | Grupo Purdy', noindex: true }),
  },
  {
    test: /^\/contacto$/,
    head: () => ({
      title: 'Contacto | Ford Costa Rica | Grupo Purdy',
      description: 'Contacta a Ford para obtener información sobre vehículos nuevos, financiamiento, seguros, repuestos originales y mecánica general. ¡Nuestro equipo te espera!',
    }),
  },
  {
    test: /^\/contactanos$/,
    head: () => ({
      title: 'Contacto | Ford Costa Rica | Grupo Purdy',
      description: 'Contacta a Ford para obtener información sobre vehículos nuevos, financiamiento, seguros, repuestos originales y mecánica general. ¡Nuestro equipo te espera!',
    }),
  },
  {
    test: /^\/solicitar-test-drive\/gracias$/,
    head: (_m, { suffix }) => ({ title: `Solicitar test drive - Gracias | ${suffix}`, noindex: true }),
  },
  {
    test: /^\/solicitar-test-drive$/,
    head: (_m, { suffix }) => ({
      title: `Solicitar test drive | ${suffix}`,
      description: 'Solicitá una prueba de manejo de tu Ford en Costa Rica. Completá tus datos y un asesor te contactará para coordinar la cita.',
    }),
  },
  {
    test: /^\/select-family\/.+\/test-drive$/,
    head: (_m, { suffix }) => ({ title: `Solicitar test drive | ${suffix}` }),
  },
  {
    test: /^\/autos\/[^/]+\/calcular\/[^/]+\/asesor$/,
    head: (_m, { suffix }) => ({ title: `Contactar asesor de ventas | ${suffix}` }),
  },
  {
    test: /^\/autos\/[^/]+\/calcular\/[^/]+\/reserva$/,
    head: (_m, { suffix }) => ({ title: `Solicitar reserva de vehículo | ${suffix}` }),
  },
  {
    test: /^\/autos\/[^/]+\/calcular\/[^/]+\/prueba-manejo$/,
    head: (_m, { suffix }) => ({ title: `Solicitar test drive | ${suffix}` }),
  },
  {
    test: /^\/autos\/[^/]+\/calcular\/[^/]+\/correo$/,
    head: (_m, { suffix }) => ({ title: `Enviar cotización al correo | ${suffix}` }),
  },
  {
    test: /^\/citas-taller-movil$/,
    head: () => ({ title: 'Citas Taller Móvil | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/autos\/[^/]+\/(?:asesor|reserva|prueba-manejo)\/[^/]+\/gracias$/,
    head: (_m, { suffix }) => ({ title: `Gracias | ${suffix}`, noindex: true }),
  },
  {
    test: /^\/accesorios\/[^/]+\/asesor$/,
    head: (_m, { suffix }) => ({ title: `Contactar asesor de ventas | ${suffix}` }),
  },
  {
    test: /^\/accesorios\/[^/]+\/correo$/,
    head: (_m, { suffix }) => ({ title: `Enviar cotización por correo | ${suffix}` }),
  },
  {
    test: /^\/accesorios\/[^/]+\/(?:asesor|correo)\/gracias$/,
    head: (_m, { suffix }) => ({ title: `Gracias | ${suffix}`, noindex: true }),
  },
  {
    test: /^\/reserva\/[^/]+\/modelos$/,
    head: (_m, { suffix }) => ({ title: `Solicitar reserva de vehículo - Elegir modelo | ${suffix}` }),
  },
  {
    test: /^\/reserva\/[^/]+\/[^/]+$/,
    head: (_m, { suffix }) => ({
      title: `Sistema de reserva de vehículo | ${suffix}`,
      description: 'Solicita la reserva de tu Ford en línea. Elige el modelo ideal y asegura tu compra.',
    }),
  },
  {
    test: /^\/reserva$/,
    head: (_m, { suffix }) => ({
      title: `Sistema de reserva de vehículo | ${suffix}`,
      description: 'Solicita la reserva de tu Ford en línea. Elige el modelo ideal, configura las características y asegura tu compra.',
    }),
  },
]
