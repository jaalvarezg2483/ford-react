import { redirectTo } from './respond'
import { findFamily } from './legacy-data'

/**
 * Redirecciones fijas del RedirectController del Symfony (URLs viejas que
 * pueden seguir enlazadas o indexadas). Las que el Symfony mandaba a rutas
 * inexistentes (escudería) no se incluyen: allá terminaban en error.
 */
const FIXED: Record<string, [string, number]> = {
  '/pagina/seguros': ['/seguros/contacto', 302],
  '/pagina/que-hacer-accidente': ['/seguros/que-hacer-accidente', 301],
  '/pagina/seguros-beneficios': ['/seguros/seguros-beneficios', 301],
  '/pagina/mantenimiento': ['/mantenimiento/contacto', 301],
  '/pagina/planes-mantenimiento': ['/mantenimiento/planes-mantenimiento', 301],
  '/pagina/por-que-toyota': ['/ayuda/por-que-toyota', 301],
  '/pagina/compra-contado': ['/ayuda/compra-contado', 301],
  '/pagina/entrega-usado-parte': ['/ayuda/entrega-usado-parte', 301],
  '/seguros/contacto-beneficios': ['/seguros/beneficios', 301],
  '/llamado-al-servicio-2015': ['/llamado-al-servicio/agosto-2015', 301],
  '/autos/rav4': ['/autos/rav4-2-0l', 301],
  '/purdy-renting': ['/servicios/soluciones-empresas', 301],
}

/** /autos/{slug}/calculate/{code}/… → /autos/{slug}/calcular/{code}/… */
const CALCULATE: Record<string, string> = { asesor: 'asesor', email: 'correo', mantenimiento: 'mantenimiento', resumen: 'resumen' }

export function legacyRedirect(req: Request, path: string): Response | null {
  const fixed = FIXED[path]
  if (fixed) return redirectTo(req, fixed[0], fixed[1])
  let m = /^\/autos\/([^/]+)\/calculate\/([^/]+)\/(asesor|email|mantenimiento|resumen)$/.exec(path)
  if (m) return redirectTo(req, `/autos/${m[1]}/calcular/${m[2]}/${CALCULATE[m[3]]}`, 301)
  m = /^\/accesorios\/([^/]+)\/resume$/.exec(path)
  if (m) return redirectTo(req, `/accesorios/${m[1]}/resumen`, 301)
  return null
}

/**
 * /test-drive/{slug} (carTestDriveAction): lleva a la prueba de manejo del
 * modelo más barato de la familia. Las familias importadas ya traen su redirección
 * exacta; esto cubre las que se creen después en el CMS.
 */
export async function testDriveRedirect(req: Request, path: string): Promise<Response | null> {
  const m = /^\/test-drive\/([^/]+)$/.exec(path)
  if (!m) return null
  const family = await findFamily({ slug: decodeURIComponent(m[1]) })
  // ModelRepository::getModelByFamily: modelos publicados ordenados por precio; el primero.
  const model = family?.models.filter((x) => Number(x.price) > 0).sort((a, b) => Number(a.price) - Number(b.price))[0]
  return family && model ? redirectTo(req, `/autos/${family.slug}/calcular/${model.code}/prueba-manejo`) : null
}
