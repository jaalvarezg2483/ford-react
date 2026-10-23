import { useRoutes } from 'react-router-dom'
import { homeRoutes } from './home'
import { formsRoutes } from './forms'
import { calculatorRoutes } from './calculator'
import { citasRoutes } from './citas'
import { placesRoutes } from './places'
import { contentRoutes } from './content'

/** Todas las rutas del sitio, un archivo por módulo (el de contenido va al final: es el comodín). */
export function SiteRoutes() {
  return useRoutes([...homeRoutes, ...formsRoutes, ...calculatorRoutes, ...citasRoutes, ...placesRoutes, ...contentRoutes])
}
