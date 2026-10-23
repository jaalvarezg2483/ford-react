/**
 * Metadatos (título, descripción, noindex) de las páginas del módulo "citas".
 * Cada regla: { test: RegExp sobre la ruta sin barra final, head: (match, { content, origin, suffix }) => { title, description?, image?, noindex? } }.
 * Gana la primera regla que coincide. Los títulos salen de ford.cr (tabla pages del CMS importado).
 */
/** @type {Array<{ test: RegExp; head: (m: RegExpExecArray, ctx: { content: any; origin: string; suffix: string }) => { title?: string; description?: string; image?: string; noindex?: boolean } }>} */
export default [
  {
    test: /^\/citas(\/step[1-4])?$/,
    head: () => ({ title: 'Citas Ford | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/citas\/scheduled-car$/,
    head: () => ({ title: 'Citas Ford | Ford Costa Rica | Grupo Purdy' }),
  },
]
