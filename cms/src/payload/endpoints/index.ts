import { siteEndpoints } from './site'
import { formsEndpoints } from './forms'
import { calculatorEndpoints } from './calculator'
import { citasEndpoints } from './citas'
import { placesEndpoints } from './places'
import { contentEndpoints } from './content'
import { importFordEndpoints } from './importFord'

/** Todos los endpoints del proyecto, un archivo por módulo. */
export const allEndpoints = [
  ...siteEndpoints,
  ...formsEndpoints,
  ...calculatorEndpoints,
  ...citasEndpoints,
  ...placesEndpoints,
  ...contentEndpoints,
  ...importFordEndpoints,
]
