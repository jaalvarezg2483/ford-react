import { readFileSync } from 'node:fs'
import path from 'node:path'
import { renderTwig, renderTwigPage, setTwigParameters } from '@/legacy/twig'
import { gateway, GatewayUnavailable } from './gateway'
import { readFields } from './forms'
import { siteParameters } from './legacy-data'
import { getSession, json, withSession, type Session } from './session'
import { html, redirectTo } from './respond'
import { renderPage } from './render'

/**
 * Citas de taller: port directo de CitasController.php. Mismas rutas, mismas
 * respuestas JSON y mismas plantillas Twig; los datos vienen del gateway de
 * microservicios (user_vehicles, appointments, branch_offices, configuration_store).
 */
const K = {
  VEHICLE: 'vehicle', LIST_VEHICLE: 'list_vehicle', FULL_NAME: 'full_name', VEHICLE_SELECTED: 'vehicle_selected', TASKS: 'tasks',
  TASK_SELECTED: 'task_selected', CURRENT_APPOINTMENT: 'current_appointment', APPOINTMENT_DATA: 'appointment_data', TIMES_AVAILABLE: 'times_available',
  ODOMETER_SCHEDULE: 'odometer_schedule', DETAILS_SCHEDULE: 'details_schedule', INFO_SCHEDULE: 'info_schedule', LIST_SUCURSAL: 'list_sucursal',
}

const config = {
  validBrands: ['ford'],
  defaultIcon: 'icon-maintenance',
  tasks: { P00022: { iconClass: '' }, P00030: { iconClass: '' }, 2020: { iconClass: 'icon-oil' }, 2121: { iconClass: 'icon-oil' }, 2119: { iconClass: 'icon-oil' }, P00141: { iconClass: '' } },
  branches: { blacklist: [] as string[], transformNames: { 'Taller Ciudad Toyota': 'Ciudad Toyota' } as Record<string, string> },
}

const ELECTRIC = ['ELÉCTRICO', 'BZ4X', 'Mach-e', 'G3i', 'G9', 'P7', 'RZ450e', 'I-Road', 'MIRAI', 'ELECTRICO', 'UX300E', 'FOCUS-Sedan-2000', 'Electrica', 'ID4', 'G6']

/** GET de los pasos (/citas/step1…step4). */
export async function renderCitasStep(req: Request, step: string): Promise<Response | null> {
  const session = await getSession(req)
  const url = new URL(req.url)
  setTwigParameters(await siteParameters())
  let template: string
  let ctx: Record<string, unknown>
  const vehicleSelected = session.get(K.VEHICLE_SELECTED, false)
  switch (step) {
    case 'step1':
      template = 'Citas/step1.html.twig'
      ctx = { vehicleInfo: session.get(K.VEHICLE, false), vehicles: session.get(K.LIST_VEHICLE, []), fullName: session.get(K.FULL_NAME), debug: url.searchParams.get('ACN_DEBUG') === 'true' }
      break
    case 'step2': {
      if (session.get(K.CURRENT_APPOINTMENT, false)) return withSession(redirectTo(req, '/citas/step3'), session)
      let tasks: any[] = session.get(K.TASKS, []) || []
      const modelo = String(vehicleSelected?.Modelo ?? '')
      if (ELECTRIC.some((w) => modelo.includes(w))) tasks = tasks.filter((t) => t.CTrabajo_Id !== 'LBExpress')
      template = 'Citas/step2.html.twig'
      ctx = { vehicleSelected, tasks, appointmentConfig: config, hasAppointment: false }
      break
    }
    case 'step3':
      template = 'Citas/step3.html.twig'
      ctx = { taskSelected: session.get(K.TASK_SELECTED, false), vehicleSelected, currentAppointment: session.get(K.CURRENT_APPOINTMENT, false) !== false }
      break
    case 'step4': {
      const times = session.get(K.TIMES_AVAILABLE, { am: [], pm: [] })
      template = 'Citas/step4.html.twig'
      ctx = {
        taskSelected: session.get(K.TASK_SELECTED, false), vehicleSelected, appointmentData: session.get(K.APPOINTMENT_DATA, false),
        timesAvailable: [...times.am, ...times.pm].map((t: string) => new Date(t)),
        odometer: session.get(K.ODOMETER_SCHEDULE, vehicleSelected ? vehicleSelected.Odometro : 0),
        debug: url.searchParams.get('ACN_DEBUG'), currentAppointment: session.get(K.CURRENT_APPOINTMENT, false) !== false,
      }
      break
    }
    case 'scheduled-car':
      template = 'Citas/scheduled-car.html.twig'
      ctx = {}
      break
    default:
      return null
  }
  const route = step === 'scheduled-car' ? 'scheduled-car' : step
  const pageParts = renderTwigPage(template, { ...ctx, app: { request: { get: (k: string) => (k === '_route' ? route : url.searchParams.get(k)) } } })
  const body = await renderPage({
    id: 0, path: url.pathname, title: `${pageParts.title} | Ford Costa Rica | Grupo Purdy`, template: 'default', bodyClass: route, route,
    activeMenu: '/citas', headStyles: `\n\n            ${pageParts.styles.trim()}\n\n        `, headCustom: pageParts.custom, content: `\n${pageParts.body}\n`, scripts: pageParts.scripts,
    metaHtml: citasMeta(),
  })
  await session.save()
  return withSession(html(body), session)
}

let metaCache = ''
function citasMeta() {
  if (!metaCache) {
    try { metaCache = readFileSync(path.join(process.cwd(), 'src/legacy/citas-meta.html'), 'utf8') } catch { metaCache = '' }
  }
  return metaCache
}

/** POST /citas/* (AJAX de citas.min.js). */
export async function handleCitas(req: Request, url: URL): Promise<Response> {
  const session = await getSession(req)
  const action = url.pathname.replace(/^\/citas\//, '').replace(/\/$/, '')
  const v = await readFields(req)
  try {
    const result = await dispatch(action, v, session, url)
    await session.save()
    return result ? withSession(result, session) : json({}, 404, session)
  } catch (error) {
    if (error instanceof GatewayUnavailable) return json({ status: false, error: 'Servicio de citas no disponible' }, 503, session)
    console.error(`Citas ${action} falló`, error)
    return json({ status: false, error: 'Error' }, 500, session)
  }
}

async function dispatch(action: string, v: Record<string, string>, session: Session, url: URL): Promise<Response | null> {
  switch (action) {
    case 'user-vehicles': {
      for (const k of [K.VEHICLE, K.FULL_NAME, K.LIST_VEHICLE, K.CURRENT_APPOINTMENT, K.APPOINTMENT_DATA, K.TASKS, K.VEHICLE_SELECTED]) session.remove(k)
      let vehicles: any[] = []
      const response = await gateway.getUserVehicles(v.type === 'PLATE' ? 'plate' : 'identification', v.id)
      if (response.status) {
        vehicles = formatVehicles(response.data)
        response.status = vehicles.length > 0
        if (vehicles.length) {
          session.set(K.LIST_VEHICLE, vehicles)
          if (v.type === 'PLATE') session.set(K.VEHICLE, vehicles[0].Modelo)
          session.set(K.FULL_NAME, vehicles[0].Propietario)
        }
      } else if (v.type === 'PLATE') {
        // El Symfony comparaba con "=" (asignación): siempre devolvía custom_error para placas.
        return json({ custom_error: response.data, status: response.status })
      }
      return json({ Lista_Vehiculos: vehicles, status: response.status })
    }
    case 'validate-odometer': {
      const vehicle = await vehicleByPlate(session, v.plate)
      session.remove(K.VEHICLE_SELECTED)
      session.remove(K.CURRENT_APPOINTMENT)
      if (!vehicle) return json({ validated_odometer: { Exitoso: false, Mensaje_Error: 'Vehículo no encontrado' } })
      session.set(K.VEHICLE_SELECTED, vehicle)
      const current = activeAppointment(vehicle)
      if (current) session.set(K.CURRENT_APPOINTMENT, current)
      const odo = await gateway.validateOdometer(v.plate, v.odometer)
      const response: any = { validated_odometer: { ...(odo.status ? odo.data : odo.error), Exitoso: odo.status } }
      session.set(K.ODOMETER_SCHEDULE, v.odometer)
      if (odo.status && !current) {
        const tasks = await gateway.getTasks(v.plate, v.odometer)
        if (tasks.status) { response.tasks = tasks.data; session.set(K.TASKS, tasks.data) }
      } else if (current) {
        const task = appointmentToTask(current)
        if (task) {
          response.tasks = [task]
          session.set(K.TASK_SELECTED, task)
          session.set(K.DETAILS_SCHEDULE, false)
          session.set(K.INFO_SCHEDULE, null)
        }
        session.set(K.TASKS, response.tasks)
      }
      response.tasks ??= []
      return json(response)
    }
    case 'available-schedules': {
      const date = (v.date || '').slice(0, 10)
      const noon = await gateway.isHighNoon(date)
      if (noon.data === true) return json({ Exitoso: false, Mensaje_Error: 'No hay citas disponibles para ese horario' })
      const vehicle = await vehicleByPlate(session, v.plate)
      const current = activeAppointment(vehicle)
      const odometer = session.get(K.ODOMETER_SCHEDULE, vehicle ? vehicle.Odometro : 0)
      const raw = await gateway.availableSchedules(v.empresa, v.sucursal, Boolean(v.info), date, v.plate, v.work_id, odometer, current)
      const response: any = raw.data ?? {}
      response.Exitoso = response.Exitoso === 'true' || response.Exitoso === true
      const am: Date[] = [], pm: Date[] = []
      if (response.Exitoso) {
        const list = response.Lista_Horarios?.THorario_Disponible ?? []
        for (const t of Array.isArray(list) ? list : [list]) {
          const d = new Date(t.Fecha_Hora_Inicio)
          ;(d.getHours() < 12 ? am : pm).push(d)
        }
      }
      session.set(K.TIMES_AVAILABLE, { am: am.map((d) => d.toISOString()), pm: pm.map((d) => d.toISOString()) })
      response.html = { am: renderTwig('Citas/partials/_time-item.html.twig', { times: am }), pm: renderTwig('Citas/partials/_time-item.html.twig', { times: pm }) }
      return json(response)
    }
    case 'cancel-appointment': {
      if (!v.plate) return json({}, 405)
      const vehicle = await vehicleByPlate(session, v.plate)
      let response: any = { status: false }
      if (vehicle) {
        const appt = activeAppointment(vehicle)
        if (appt) {
          response = await gateway.cancelAppointment(appt.company, appt.subsidiaryId, appt.ot, v.plate)
          if (response.status) {
            removeAppointment(session, v.plate)
            if (v.reloadTasks) {
              response.tasks = []
              const odometer = session.get(K.ODOMETER_SCHEDULE, false)
              if (odometer) {
                const tasks = await gateway.getTasks(v.plate, odometer)
                if (tasks.status) { response.tasks = tasks.data; session.set(K.TASKS, tasks.data) }
              }
            }
          }
        }
      }
      return json({ status: response.status, error: response.status === false ? response.error ?? null : null })
    }
    case 'create-appointment': {
      const when = parseLegacyDate(v.date_time)
      const noon = await gateway.isHighNoon(ymd(when))
      if (noon.data === true) return json({ Exitoso: false, Mensaje_Error: 'No hay citas disponibles para ese horario' })
      const branch = await getBranch(session, v.sucursal, v.empresa)
      const vehicle = await vehicleByPlate(session, v.plate)
      const current = activeAppointment(vehicle)
      const response = await gateway.createAppointment({
        companyId: v.empresa, clientName: session.get(K.FULL_NAME), dateTime: `${ymd(when)}T${hms(when)}`, odometer: v.odometer ?? 1,
        details: Boolean(v.info), detailsInfo: v.info ?? '', email: v.email, lat: branch?.Suc_Latitud, lng: branch?.Suc_Longitud, plate: v.plate,
        subsidiaryAddress: branch?.Suc_Direccion, subsidiaryId: v.sucursal, subsidiaryName: branch?.Suc_Nombre, vehicle: await vehicleModel(session, v.plate), workId: v.work_id,
      }, current)
      const data: any = (response.status ? response.data : response.error) ?? {}
      data.Exitoso = data.Exitoso === 'true' || data.Exitoso === true
      const appointmentData = { ...session.get(K.APPOINTMENT_DATA, {}), completed: data.Exitoso, email: v.email }
      session.set(K.APPOINTMENT_DATA, appointmentData)
      data.html = appointmentActions(session, appointmentData, null)
      return json(data)
    }
    case 'debug/step4': {
      const appointmentData = { ...session.get(K.APPOINTMENT_DATA, {}), completed: (v.result ?? 'true') === 'true' }
      return json({ view: appointmentActions(session, appointmentData, url.searchParams.get('ACN_DEBUG')) })
    }
    case 'sucursals-list': {
      const task = session.get(K.TASK_SELECTED, false)
      const vehicle = session.get(K.VEHICLE_SELECTED, false)
      let response: any = { status: false }
      let branches: any[] = []
      if (task && vehicle) {
        response = await gateway.getBranchOffices(vehicle.Placa, task.CTrabajo_Id)
        if (response.status) { branches = formatBranches(response.data); session.set(K.LIST_SUCURSAL, branches) }
      }
      return json({ Lista_Sucursales: branches, Exitoso: response.status, html: response.status ? renderTwig('Citas/partials/_branches.html.twig', { branches }) : false })
    }
    case 'save/details': {
      const task = (session.get(K.TASKS, []) as any[]).find((t) => String(t.CTrabajo_Id) === String(v.details))
      if (task) session.set(K.TASK_SELECTED, task)
      session.set(K.DETAILS_SCHEDULE, Boolean(v.info))
      session.set(K.INFO_SCHEDULE, v.info ?? null)
      return json({ msn: 'OK' })
    }
    case 'save/branch/date': {
      const branch = await getBranch(session, v.branchId, v.companyId)
      if (branch) { session.set(K.APPOINTMENT_DATA, { date: v.date, branch }); return json({ status: true }) }
      return json({ status: false })
    }
    case 'delete_plate': {
      const plate = v.plate || url.searchParams.get('plate')
      if (!plate) return null
      const response = await gateway.detachVehicle(plate)
      return json(response.status ? { msn: 'ok' } : { msn: 'error', ...response })
    }
    case 'getParameters': {
      const response = await gateway.getAppointmentsDateRange()
      return json(response.data ?? null)
    }
  }
  return null
}

function appointmentActions(session: Session, appointmentData: any, debug: unknown) {
  const vehicle = session.get(K.VEHICLE_SELECTED, false)
  const times = session.get(K.TIMES_AVAILABLE, { am: [], pm: [] })
  return renderTwig('Citas/partials/_appointment-actions.html.twig', {
    taskSelected: session.get(K.TASK_SELECTED, false), vehicleSelected: vehicle, appointmentData,
    timesAvailable: [...times.am, ...times.pm].map((t: string) => new Date(t)), odometer: session.get(K.ODOMETER_SCHEDULE, vehicle ? vehicle.Odometro : 0), debug,
  })
}

function formatVehicles(list: any[]): any[] {
  return (list || []).flatMap((vehicle) => {
    const brand = String(vehicle.Marca ?? '').replace(/\d+/g, '').trim()
    if (!config.validBrands.includes(brand.toLowerCase())) return []
    const out = { ...vehicle, Marca: brand }
    if (Array.isArray(out.Citas_Activas)) out.Citas_Activas = out.Citas_Activas[0] ?? out.Citas_Activas
    return [out]
  })
}

function formatBranches(list: any[]): any[] {
  return (list || [])
    .filter((b) => !config.branches.blacklist.includes(String(b.Suc_Id)))
    .map((b) => ({ ...b, Suc_Nombre: config.branches.transformNames[b.Suc_Nombre] ?? b.Suc_Nombre }))
    .sort((a, b) => String(a.Suc_Nombre).localeCompare(String(b.Suc_Nombre)))
}

async function vehicleByPlate(session: Session, plate: string) {
  let vehicles: any[] = session.get(K.LIST_VEHICLE, [])
  if (!vehicles.length && plate) {
    const r = await gateway.getUserVehicles('plate', plate)
    if (r.status && r.data?.length) {
      session.set(K.VEHICLE, r.data[0].Modelo)
      session.set(K.FULL_NAME, r.data[0].Propietario)
      vehicles = formatVehicles(r.data)
    }
  }
  return vehicles.find((x) => x.Placa === plate) ?? null
}

async function vehicleModel(session: Session, plate: string) {
  const name = session.get(K.VEHICLE, false)
  if (name) return name
  return (await vehicleByPlate(session, plate))?.Modelo ?? ''
}

async function getBranch(session: Session, id: string, companyId: string) {
  let branches: any[] = session.get(K.LIST_SUCURSAL, [])
  if (!branches.length) {
    const task = session.get(K.TASK_SELECTED, false)
    const vehicle = session.get(K.VEHICLE_SELECTED, false)
    if (task && vehicle) {
      const r = await gateway.getBranchOffices(vehicle.Placa, task.CTrabajo_Id)
      if (r.status) { branches = formatBranches(r.data); session.set(K.LIST_SUCURSAL, branches) }
    }
  }
  return branches.find((b) => String(b.Suc_Id) === String(id) && String(b.Empresa) === String(companyId)) ?? null
}

function removeAppointment(session: Session, plate: string) {
  const vehicles = (session.get(K.LIST_VEHICLE, []) as any[]).map((x) => {
    if (x.Placa !== plate) return x
    const updated = { ...x, Citas_Activas: null }
    if (session.get(K.VEHICLE_SELECTED, false)) session.set(K.VEHICLE_SELECTED, updated)
    return updated
  })
  session.set(K.LIST_VEHICLE, vehicles)
}

function activeAppointment(vehicle: any) {
  return vehicle && vehicle.Citas_Activas ? vehicle.Citas_Activas : false
}

function appointmentToTask(appt: any) {
  if (!appt?.work) return false
  return { CTrabajo_Id: appt.work.id, Detalle: appt.work.detail, Precio_CT_Sugerido: '0', services: [] }
}

/** "YYYY-MM-DD H:MM am" → Date en hora de Costa Rica. */
function parseLegacyDate(s: string) {
  const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?/i.exec(String(s || '').trim())
  if (!m) return new Date(s)
  let h = Number(m[2])
  const ampm = m[5]?.toLowerCase()
  if (ampm === 'pm' && h < 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  return new Date(`${m[1]}T${String(h).padStart(2, '0')}:${m[3]}:${m[4] ?? '00'}`)
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hms = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
