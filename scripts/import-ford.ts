/**
 * Importa ford.cr al CMS: archivos, páginas, menú, vehículos, banners, blog y calculadora.
 *
 *   npm run import:ford                                         (lee https://www.ford.cr)
 *   npm run import:ford -- source=/ruta/captura                 (carpeta de captura)
 *   npm run import:ford -- source=/ruta/captura fallback-live   (y baja de ford.cr lo que falte)
 *
 * En Railway/Azure también se puede lanzar desde el admin: POST /api/import-ford (solo administradores).
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { runImport } from '../src/import/run'

// `payload run` solo pasa argumentos posicionales.
const argv = process.argv.slice(2).map((a) => a.replace(/^--/, ''))
const arg = (name: string) => argv.find((a) => a.startsWith(`${name}=`))?.split('=').slice(1).join('=')

try {
  const payload = await getPayload({ config })
  await runImport(payload, { source: arg('source') || process.env.IMPORT_SOURCE || 'live', fallbackLive: argv.includes('fallback-live') })
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
