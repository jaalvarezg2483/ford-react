/**
 * Metadatos (título, descripción, noindex) de las páginas del módulo "places".
 * Cada regla: { test: RegExp sobre la ruta sin barra final, head: (match, { content, origin, suffix }) => { title, description?, image?, noindex? } }.
 * Gana la primera regla que coincide. Los títulos salen de ford.cr (tabla pages del CMS importado).
 */
/** @type {Array<{ test: RegExp; head: (m: RegExpExecArray, ctx: { content: any; origin: string; suffix: string }) => { title?: string; description?: string; image?: string; noindex?: boolean } }>} */
export default [
  {
    test: /^\/videos(\/.*)?$/,
    head: () => ({
      title: 'Videos | Ford Costa Rica | Grupo Purdy',
      description: 'Descubre videos de Ford Costa Rica para explorar el diseño, rendimiento y tecnología de nuestros vehículos. ¡Visita nuestra página para ver más contenido!',
    }),
  },
  {
    test: /^\/sucursales$/,
    head: () => ({
      title: 'Sucursales | Ford Costa Rica | Grupo Purdy',
      description: 'Ponemos a disposición de nuestros usuarios 4 sucursales distribuidas estratégicamente por el territorio nacional, encontrá la que esté más cerca de tu ubicación',
    }),
  },
  {
    test: /^\/talleres$/,
    head: () => ({
      title: 'Talleres | Ford Costa Rica | Grupo Purdy',
      description: 'Somos expertos en el mantenimiento regular y preventivo de vehiculos Ford, nuestros talleres cuentan con técnicos especialistas en las últimas tecnologías',
    }),
  },
  {
    test: /^\/resultados$/,
    head: () => ({ title: 'Buscador | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/fichas-tecnicas-precios\/([^/]+)$/,
    head: (m, { content, suffix }) => {
      const family = (content.families || []).find((f) => f.slug === decodeURIComponent(m[1]))
      if (!family) return { noindex: true }
      return { title: `${family.name} | Especificaciones  | ${suffix}` }
    },
  },
  {
    test: /^\/fichas-tecnicas-precios$/,
    head: (_m, { suffix }) => ({ title: `Especificaciones  | ${suffix}` }),
  },
  {
    test: /^\/sitemap$/,
    head: () => ({ title: 'Mapa del Sitio | Ford Costa Rica | Grupo Purdy' }),
  },
  {
    test: /^\/view-pdf\/([^/]+)\/([^/]+)$/,
    head: (m, { content, suffix }) => {
      const family = (content.families || []).find((f) => f.slug === decodeURIComponent(m[1]))
      const sheet = family?.dataSheets?.find((d) => d.id != null && String(d.id) === m[2])
      if (!family || !sheet) return { noindex: true }
      return { title: `${suffix} | Ficha Técnica ${family.name}` }
    },
  },
]
