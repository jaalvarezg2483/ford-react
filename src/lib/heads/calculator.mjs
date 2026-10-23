/**
 * Metadatos (título, descripción, noindex) de las páginas del módulo "calculator".
 * Cada regla: { test: RegExp sobre la ruta sin barra final, head: (match, { content, origin, suffix }) => { title, description?, image?, noindex? } }.
 * Gana la primera regla que coincide. Los títulos salen de ford.cr (tabla pages del CMS importado).
 */
/** @type {Array<{ test: RegExp; head: (m: RegExpExecArray, ctx: { content: any; origin: string; suffix: string }) => { title?: string; description?: string; image?: string; noindex?: boolean } }>} */
export default [
  {
    test: /^\/calcular$/,
    head: () => ({
      title: 'Calcular Financiamiento | Ford Costa Rica | Grupo Purdy',
      description: 'Calcula el financiamiento para tu vehículo Ford fácilmente. Usa nuestra herramienta para evaluar pagos, plazos y opciones. ¡Comienza en nuestra web ahora!',
    }),
  },
  {
    test: /^\/autos\/[^/]+\/modelos$/,
    head: () => ({ title: 'Cotizador | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/autos\/[^/]+\/calcular\/[^/]+(\/resumen)?$/,
    head: () => ({ title: 'Cotizador | Ford Costa Rica | Grupo Purdy', noindex: true }),
  },
  {
    test: /^\/accesorios$/,
    head: () => ({ title: 'Accesorios - Elegir familia | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/accesorios\/([^/]+)\/resumen$/,
    head: (m, { content, suffix }) => {
      const family = (content.families || []).find((f) => f.slug === decodeURIComponent(m[1]))
      return { title: `Accesorios para ${family?.name || m[1]} | ${suffix}`, noindex: true }
    },
  },
  {
    test: /^\/accesorios\/([^/]+)$/,
    head: (m, { content, suffix }) => {
      const family = (content.families || []).find((f) => f.slug === decodeURIComponent(m[1]))
      return { title: `Accesorios para ${family?.name || m[1]} | ${suffix}` }
    },
  },
  {
    test: /^\/preaprobador\/familias$/,
    head: () => ({
      title: 'Pre aprobación de crédito | Ford Costa Rica | Grupo Purdy | Elegir familia',
      description: 'Solicita la preaprobación rápida para crédito de vehículos Ford en línea. Asegura el financiamiento y acelera tu compra. ¡Solicítalo en nuestra web hoy!',
    }),
  },
  {
    test: /^\/preaprobador\/[^/]+\/modelos$/,
    head: () => ({ title: 'Pre Aprobación de Crédito | Ford Costa Rica | Grupo Purdy | Elegir modelo' }),
  },
  {
    test: /^\/preaprobador\/[^/]+\/calcular\/[^/]+\/resumen$/,
    head: () => ({ title: 'Pre Aprobación de Crédito | Ford Costa Rica | Grupo Purdy', noindex: true }),
  },
]
