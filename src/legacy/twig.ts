/**
 * Motor Twig (twig.js) para reutilizar las plantillas del Symfony sin
 * reescribirlas: correos, pasos de citas y fragmentos AJAX. Así el HTML que
 * recibe el usuario es el mismo que generaba el sitio anterior.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import Twig from 'twig'

const VIEWS = path.join(process.cwd(), 'src/legacy/views')
const STUB = path.join(process.cwd(), 'src/legacy/base.stub.twig')

/** Rutas Symfony → URL (las que usan las plantillas portadas). */
const ROUTES: Record<string, string> = {
  citas: '/citas', step1: '/citas/step1', step2: '/citas/step2', step3: '/citas/step3', step4: '/citas/step4',
  'scheduled-car': '/citas/scheduled-car', user_vehicles: '/citas/user-vehicles', validate_odometer: '/citas/validate-odometer',
  available_schedules: '/citas/available-schedules', cancel_appointment: '/citas/cancel-appointment', create_appointment: '/citas/create-appointment',
  sucursals_list: '/citas/sucursals-list', save_details: '/citas/save/details', save_branch_date: '/citas/save/branch/date', delete_plate: '/citas/delete_plate',
  index: '/', home: '/', cms_home: '/', contacto: '/contacto', sucursales: '/sucursales', talleres: '/talleres', calculate: '/calcular', blog: '/blog',
  model_list: '/autos/{slug}', thanks: '/contacto/gracias', solicitar_test_drive: '/solicitar-test-drive', comparador: '/comparador',
}

export function pathFor(name: string, params: Record<string, unknown> = {}): string {
  let url = ROUTES[name] ?? '/'
  const extra: string[] = []
  for (const [k, v] of Object.entries(params || {})) {
    if (k === '_keys') continue
    if (url.includes(`{${k}}`)) url = url.replace(`{${k}}`, encodeURIComponent(String(v)))
    else extra.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  }
  return extra.length ? `${url}?${extra.join('&')}` : url
}

function normalize(name: string): string {
  let n = name.trim()
  if (n === 'base.html.twig' || n === '::base.html.twig') return '__base'
  n = n.replace(/^@LumenApp\//, '')
  const m = /^LumenAppBundle:([^:]*):(.+)$/.exec(n)
  if (m) n = (m[1] ? `${m[1]}/` : '') + m[2]
  return n.replace(/^\/+/, '')
}

let params: Record<string, string> = {}

/** Parámetros editables (Configuración del sitio → Parámetros). Se cargan antes de renderizar. */
export function setTwigParameters(values: Record<string, string>) {
  params = values
}

function citasMaintenanceModalActive(): boolean {
  const flag = (params.CITAS_MAINTENANCE_MODAL_ENABLED ?? '0').trim().toLowerCase()
  if (!['1', 'true', 'yes'].includes(flag)) return false
  const from = (params.CITAS_MAINTENANCE_MODAL_ACTIVE_FROM ?? '').trim()
  const until = (params.CITAS_MAINTENANCE_MODAL_ACTIVE_UNTIL ?? '').trim()
  if (!from && !until) return true
  if (!from || !until) return false
  // Hora local de Costa Rica (UTC-6, sin horario de verano).
  const parse = (s: string) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s.replace(' ', 'T')}${s.length <= 10 ? 'T00:00:00' : ''}-06:00`)
  const a = parse(from), b = parse(until), now = new Date()
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) return false
  return now >= a && now <= b
}

let loaded = false
let register: (id: string, data: string) => void = () => {}
const registered = new Set<string>()

/** Carga una plantilla y, antes, las que incluye o extiende. */
function ensure(id: string) {
  load()
  if (registered.has(id)) return
  registered.add(id)
  if (id === '__base') return
  const src = readFileSync(path.join(VIEWS, id), 'utf8')
  for (const m of src.matchAll(/\{%\s*(?:extends|include|embed|import|from)\s+["']([^"']+)["']|include\(\s*["']([^"']+)["']/g)) {
    const dep = normalize(m[1] || m[2])
    try { ensure(dep) } catch { /* plantilla opcional ausente */ }
  }
  register(id, src)
}

function load() {
  if (loaded) return
  loaded = true
  Twig.cache(true)
  Twig.extendFilter('translate_field_name', (value: any) => {
    const names: Record<string, string> = { '00NA0000006ZtDU': 'Marca', '00NA0000006ZtDK': 'Familia', '00NA0000006ZtDP': 'Modelo', tipoCedula: 'Tipo de Identificación' }
    return (names[String(value)] ?? String(value)) as string
  })
  Twig.extendFunction('path', (name: string, params?: Record<string, unknown>) => pathFor(name, params))
  Twig.extendFunction('url', (name: string, params?: Record<string, unknown>) => (process.env.NEXT_PUBLIC_SERVER_URL || '') + pathFor(name, params))
  Twig.extendFunction('asset', (p: string) => `/${String(p).replace(/^\//, '')}`)
  Twig.extendFunction('csrf_token', () => '')
  Twig.extendFunction('dump', () => '')
  Twig.extendFilter('localizeddate', (value: any, args: any) => {
    const [dateType = 'medium', timeType = 'medium', , tz = 'America/Costa_Rica'] = (args as string[] | undefined) ?? []
    const d = value instanceof Date ? value : new Date(String(value))
    if (Number.isNaN(d.getTime())) return ''
    const opts: Intl.DateTimeFormatOptions = { timeZone: tz }
    if (dateType !== 'none') opts.dateStyle = dateType as any
    if (timeType !== 'none') opts.timeStyle = timeType as any
    return new Intl.DateTimeFormat('es-CR', opts).format(d)
  })
  Twig.extendFunction('getParameter', (name: string, fallback?: string) => params[name] ?? fallback ?? '')
  Twig.extendFunction('citasMaintenanceModalActive', (() => citasMaintenanceModalActive()) as any)
  Twig.extendFilter('imagine_filter', (value: any, args: any) => `/media/cache/${(args as string[] | undefined)?.[0] ?? 'resolve'}${String(value).startsWith('/') ? '' : '/'}${value}`)
  register = (id: string, data: string) => {
    const src = data.replace(/(\{%\s*(?:extends|include|embed|import|from)\s+)(["'])([^"']+)\2/g, (_m, pre, q, name) => `${pre}${q}${normalize(name)}${q}`)
      .replace(/(\{\{\s*include\(\s*)(["'])([^"']+)\2/g, (_m, pre, q, name) => `${pre}${q}${normalize(name)}${q}`)
    Twig.twig({ id, data: src, allowInlineIncludes: true, rethrow: true } as any)
  }
  register('__base', readFileSync(STUB, 'utf8'))
  registered.add('__base')
}

export function renderTwig(name: string, context: Record<string, unknown> = {}): string {
  ensure(normalize(name))
  const tpl = (Twig as any).twig({ ref: normalize(name) })
  if (!tpl) throw new Error(`Plantilla no encontrada: ${name}`)
  return tpl.render({
    server_url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.ford.cr',
    assetsVersion: '1775667654984',
    app: { request: { get: () => null, locale: 'es', host: (process.env.NEXT_PUBLIC_SERVER_URL || '').replace(/^https?:\/\//, '') }, environment: 'prod', session: { get: () => null } },
    ...context,
  })
}

/** Renderiza una plantilla de página (que extiende base.html.twig) y devuelve sus bloques. */
export function renderTwigPage(name: string, context: Record<string, unknown> = {}) {
  const out = renderTwig(name, context)
  const pick = (a: string, b: string) => out.slice(out.indexOf(`<!--@@${a}@@-->`) + a.length + 11, out.indexOf(`<!--@@${b}@@-->`))
  return { styles: pick('STYLES', 'CUSTOM'), custom: pick('CUSTOM', 'BODY'), body: pick('BODY', 'SCRIPTS'), scripts: pick('SCRIPTS', 'TITLE'), title: pick('TITLE', 'END').trim() }
}
