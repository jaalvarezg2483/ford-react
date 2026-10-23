import type { RouteObject } from 'react-router-dom'
import { ContentPage } from '@/pages/content/ContentPage'

/** Páginas de contenido administrables en el CMS (servicios, seguros, sobre nosotros, legales…). Es el comodín final. */
export const contentRoutes: RouteObject[] = [{ path: '*', element: <ContentPage /> }]
