import type { RouteObject } from 'react-router-dom'
import { Home } from '@/pages/Home'
import { Vehicle } from '@/pages/Vehicle'
import { VehicleGallery } from '@/pages/VehicleGallery'
import { Blog } from '@/pages/Blog'
import { BlogPost } from '@/pages/BlogPost'
import { Compare } from '@/pages/Compare'
import { NotFound } from '@/pages/NotFound'

/** Portada, ficha y galería de vehículos, blog, comparador y 404. */
export const homeRoutes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/autos/:slug', element: <Vehicle /> },
  { path: '/autos/:slug/galeria', element: <VehicleGallery /> },
  { path: '/blog', element: <Blog /> },
  { path: '/blog/categorias/:alias', element: <Blog /> },
  { path: '/blog/:slug', element: <BlogPost /> },
  { path: '/comparador', element: <Compare /> },
  { path: '/404', element: <NotFound /> },
]
