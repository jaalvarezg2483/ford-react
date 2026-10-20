import { env } from '@/lib/env'

/**
 * Cliente del gateway de microservicios de Grupo Purdy. Mismo contrato que
 * GatewayConnector.php: token OAuth (client_credentials) en /oauth/token y
 * llamadas POST JSON a /<microservicio>/api/<acción> con la marca ford_citas.
 */
type GatewayResponse = { status?: boolean; data?: any; error?: any; code?: string | number; [k: string]: any }

let token: { value: string; expires: number } | null = null

async function call(method: 'POST_JSON' | 'POST_FORM', microservice: string, action: string, params: Record<string, unknown>, path = 'api', auth = true): Promise<GatewayResponse> {
  const base = env.MICROSERVICES_GATEWAY
  if (!base) throw new GatewayUnavailable()
  const url = microservice ? `${base.replace(/\/$/, '')}/${microservice}/${path}/${action}` : `${base.replace(/\/$/, '')}/${path}/${action}`
  const headers: Record<string, string> = {}
  let body: string
  if (method === 'POST_JSON') {
    headers['content-type'] = 'application/json'
    if (auth) headers.authorization = `Bearer ${await getToken()}`
    body = JSON.stringify(params)
  } else {
    headers['content-type'] = 'application/x-www-form-urlencoded'
    body = new URLSearchParams(params as Record<string, string>).toString()
  }
  const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(30_000) })
  const text = await res.text()
  try { return JSON.parse(text) } catch { return { status: false, error: text } }
}

async function getToken(force = false): Promise<string> {
  if (!force && token && token.expires > Date.now()) return token.value
  const result = await call('POST_FORM', '', 'token', {
    client_id: env.MICROSERVICES_CLIENT_ID || '',
    client_secret: env.MICROSERVICES_CLIENT_SECRET || '',
    grant_type: env.MICROSERVICES_GRANT_TYPE,
  }, 'oauth', false)
  const value = result.accessToken || result.access_token
  if (!value) throw new Error('El gateway no devolvió accessToken')
  // El Symfony renovaba el token cada 3 horas.
  token = { value, expires: Date.now() + 3 * 60 * 60 * 1000 - 60_000 }
  return value
}

async function authed(microservice: string, action: string, params: Record<string, unknown>): Promise<GatewayResponse> {
  let r = await call('POST_JSON', microservice, action, params)
  if (r && String(r.code) === '401') {
    await getToken(true)
    r = await call('POST_JSON', microservice, action, params)
  }
  return r ?? { status: false }
}

export class GatewayUnavailable extends Error {
  constructor() { super('MICROSERVICES_GATEWAY no está configurado') }
}

const brand = () => env.MICROSERVICES_APPOINTMENT_BRAND

export const gateway = {
  getUserVehicles: (type: 'plate' | 'identification', value: string) => authed('user_vehicles', 'get', { brand: brand(), type, value }),
  detachVehicle: (plate: string) => authed('user_vehicles', 'detach', { plate, brand: brand() }),
  hasAppointment: (plate: string) => authed('appointments', 'has-appointment', { plate, brand: brand() }),
  validateOdometer: (plate: string, odometer: unknown) => authed('appointments', 'validate-odometer', { plate, brand: brand(), odometer }),
  getTasks: (plate: string, odometer: unknown) => authed('appointments', 'get-tasks', { plate, brand: brand(), odometer }),
  getBranchOffices: (plate: string, workId: string) => authed('branch_offices', 'get', { brand: brand(), plate, workId }),
  getAppointmentsDateRange: () => authed('configuration_store', 'getDateRange', { brand: brand() }),
  isHighNoon: (date: string) => authed('configuration_store', 'isHighNoon', { brand: brand(), date }),
  availableSchedules: (companyId: unknown, branchOffice: unknown, additionalDetail: boolean, date: string, plate: string, workId: unknown, odometer: unknown, current: any) =>
    authed('branch_offices', 'available-schedules', {
      brand: brand(), companyId, branchOffice, additionalDetail, date, plate, workId, odometer,
      ...(current ? { lastAppointment: { subsidiaryId: current.subsidiaryId, companyId: current.company, ot: current.ot } } : {}),
    }),
  createAppointment: (p: Record<string, unknown>, current: any) =>
    authed('appointments', 'create-appointment', {
      ...p, brand: brand(), source: 'Ford',
      ...(current ? { lastAppointment: { subsidiaryId: current.subsidiaryId, companyId: current.company, ot: current.ot } } : {}),
    }),
  cancelAppointment: (companyId: unknown, subsidiaryId: unknown, ot: unknown, plate: string) =>
    authed('appointments', 'cancel-appointment', { companyId, brand: brand(), subsidiaryId, ot, plate }),
  /** Consentimiento informado: el Symfony lo llama sin token, en /rest/subscribe. */
  subscribeConsent: (params: Record<string, unknown>) => call('POST_JSON', 'microservice-informed-consent', 'subscribe', params, 'rest', false),
}
