import type { RouteObject } from 'react-router-dom'
import { Fichas } from '@/pages/places/Fichas'
import { Offices } from '@/pages/places/Offices'
import { Resultados } from '@/pages/places/Resultados'
import { Sitemap } from '@/pages/places/Sitemap'
import { Videos } from '@/pages/places/Videos'
import { ViewPdf } from '@/pages/places/ViewPdf'

/**
 * Sucursales, talleres, búsqueda, videos, especificaciones y fichas técnicas.
 * Páginas en src/pages/places/, componentes en src/components/places/.
 */
export const placesRoutes: RouteObject[] = [
  { path: '/videos', element: <Videos /> },
  { path: '/videos/:category', element: <Videos /> },
  { path: '/sucursales', element: <Offices kind="sucursales" /> },
  { path: '/talleres', element: <Offices kind="talleres" /> },
  { path: '/resultados', element: <Resultados /> },
  { path: '/fichas-tecnicas-precios', element: <Fichas /> },
  { path: '/fichas-tecnicas-precios/:slug', element: <Fichas /> },
  { path: '/view-pdf/:slug/:id', element: <ViewPdf /> },
  { path: '/sitemap', element: <Sitemap /> },
]
