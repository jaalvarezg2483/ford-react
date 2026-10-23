import { Navigate, type RouteObject } from 'react-router-dom'
import { Accesorios } from '@/pages/calculator/Accesorios'
import { AccesoriosIndex } from '@/pages/calculator/AccesoriosIndex'
import { AccesoriosResumen } from '@/pages/calculator/AccesoriosResumen'
import { Adicionales } from '@/pages/calculator/Adicionales'
import { Calcular } from '@/pages/calculator/Calcular'
import { Modelos } from '@/pages/calculator/Modelos'
import { Resumen } from '@/pages/calculator/Resumen'

/**
 * Calculadora de cuota, selección de modelos, accesorios, resumen y PDF de cotización.
 * Páginas en src/pages/calculator/, componentes en src/components/calculator/.
 */
export const calculatorRoutes: RouteObject[] = [
  { path: '/calcular', element: <Calcular /> },
  { path: '/autos/:slug/modelos', element: <Modelos /> },
  { path: '/autos/:slug/calcular/:code', element: <Adicionales /> },
  { path: '/autos/:slug/calcular/:code/resumen', element: <Resumen /> },
  { path: '/accesorios', element: <AccesoriosIndex /> },
  { path: '/accesorios/:slug', element: <Accesorios /> },
  { path: '/accesorios/:slug/resumen', element: <AccesoriosResumen /> },
  { path: '/preaprobador', element: <Navigate to="/preaprobador/familias" replace /> },
  { path: '/preaprobador/familias', element: <Calcular mode="preaprobador" /> },
  { path: '/preaprobador/:slug/modelos', element: <Modelos mode="preaprobador" /> },
  { path: '/preaprobador/:slug/calcular/:code/resumen', element: <Resumen mode="preaprobador" /> },
]
