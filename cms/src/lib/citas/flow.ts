import { gateway } from '../gateway'
import { json } from '../http'
import type { Session } from '../session'

const K = {
  VEHICLE: 'vehicle',
  LIST_VEHICLE: 'list_vehicle',
  FULL_NAME: 'full_name',
  VEHICLE_SELECTED: 'vehicle_selected',
  TASKS: 'tasks',
  TASK_SELECTED: 'task_selected',
  CURRENT_APPOINTMENT: 'current_appointment',
  APPOINTMENT_DATA: 'appointment_data',
  TIMES_AVAILABLE: 'times_available',
  ODOMETER_SCHEDULE: 'odometer_schedule',
  DETAILS_SCHEDULE: 'details_schedule',
  INFO_SCHEDULE: 'info_schedule',
  LIST_SUCURSAL: 'list_sucursal',
}

const config = {
  validBrands: ['ford'],
  defaultIcon: 'icon-maintenance',
  tasks: { P00022: { iconClass: '' }, P00030: { iconClass: '' }, 2020: { iconClass: 'icon-oil' }, 2121: { iconClass: 'icon-oil' }, 2119: { iconClass: 'icon-oil' }, P00141: { iconClass: '' } },
  branches: { blacklist: [] as string[], transformNames: { 'Taller Ciudad Toyota': 'Ciudad Toyota' } as Record<string, string> },
}

const ELECTRIC = ['ELÉCTRICO', 'BZ4X', 'Mach-e', 'G3i', 'G9', 'P7', 'RZ450e', 'I-Road', 'MIRAI', 'ELECTRICO', 'UX300E', 'FOCUS-Sedan-2000', 'Electrica', 'ID4', 'G6']

type Vehicle = Record<string, any>
type Branch = Record<string, any>
type Task = Record<string, any>

export function formatVehicles(list: Vehicle[]): Vehicle[] {
  return (list || []).flatMap((vehicle) => {
    const brand = String(vehicle.Marca ?? '').replace(/\d+/g, '').trim()
    if (!config.validBrands.includes(brand.toLowerCase())) return []
    const out: Vehicle = { ...vehicle, Marca: brand }
    if (Array.isArray(out.Citas_Activas)) out.Citas_Activas = out.Citas_Activas[0] ?? out.Citas_Activas
    return [out]
  })
}

export function formatBranches(list: Branch[]): Branch[] {
  return (list || [])
    .filter((b) => !config.branches.blacklist.includes(String(b.Suc_Id)))
    .map((b) => ({ ...b, Suc_Nombre: config.branches.transformNames[b.Suc_Nombre] ?? b.Suc_Nombre }))
    .sort((a, b) => String(a.Suc_Nombre).localeCompare(String(b.Suc_Nombre)))
}

export function parseLegacyDate(s: string) {
  const m = /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?/i.exec(String(s || '').trim())
  if (!m) return new Date(s)
  let h = Number(m[2])
  const ampm = m[5]?.toLowerCase()
  if (ampm === 'pm' && h < 12) h += 12
  if (ampm === 'am' && h === 12) h = 0
  return new Date(`${m[1]}T${String(h).padStart(2, '0')}:${m[3]}:${m[4] ?? '00'}`)
}

export function activeAppointment(vehicle: Vehicle | null | undefined) {
  return vehicle && vehicle.Citas_Activas ? vehicle.Citas_Activas : false
}

export function appointmentToTask(appt: Record<string, any> | false) {
  if (!appt || !appt.work) return false
  return { CTrabajo_Id: appt.work.id, Detalle: appt.work.detail, Precio_CT_Sugerido: '0', services: [] as string[] }
}

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hms = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`

function ampmLabel(d: Date) {
  let h = d.getHours()
  const suffix = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${suffix}`
}

function timeItems(dates: Date[]) {
  return dates.map((d) => ({ value: `${ymd(d)} ${ampmLabel(d)}`, label: ampmLabel(d) }))
}

function electricTasks(tasks: Task[], vehicleSelected: Vehicle | false) {
  const modelo = String(vehicleSelected && vehicleSelected.Modelo ? vehicleSelected.Modelo : '')
  if (ELECTRIC.some((w) => modelo.includes(w))) return tasks.filter((t) => t.CTrabajo_Id !== 'LBExpress')
  return tasks
}

export function sessionState(session: Session) {
  const vehicleSelected = session.get(K.VEHICLE_SELECTED, false)
  const tasks = electricTasks(session.get(K.TASKS, []) || [], vehicleSelected)
  const times = session.get(K.TIMES_AVAILABLE, { am: [], pm: [] })
  return {
    fullName: session.get(K.FULL_NAME, '') || '',
    vehicles: session.get(K.LIST_VEHICLE, []) || [],
    vehicleSelected,
    tasks,
    taskSelected: session.get(K.TASK_SELECTED, false),
    currentAppointment: session.get(K.CURRENT_APPOINTMENT, false),
    appointmentData: session.get(K.APPOINTMENT_DATA, false),
    timesAvailable: times,
    odometer: session.get(K.ODOMETER_SCHEDULE, vehicleSelected ? vehicleSelected.Odometro : 0),
  }
}

async function vehicleByPlate(session: Session, plate: string) {
  const vehicles: Vehicle[] = session.get(K.LIST_VEHICLE, []) || []
  if (!plate || !vehicles.length) return null
  return vehicles.find((x) => x.Placa === plate) ?? null
}

async function vehicleModel(session: Session, plate: string) {
  const name = session.get(K.VEHICLE, false)
  if (name) return name
  return (await vehicleByPlate(session, plate))?.Modelo ?? ''
}

async function getBranch(session: Session, id: string, companyId: string) {
  let branches: Branch[] = session.get(K.LIST_SUCURSAL, [])
  if (!branches.length) {
    const task = session.get(K.TASK_SELECTED, false)
    const vehicle = session.get(K.VEHICLE_SELECTED, false)
    if (task && vehicle) {
      const r = await gateway.getBranchOffices(vehicle.Placa, task.CTrabajo_Id)
      if (r.status) {
        branches = formatBranches(r.data)
        session.set(K.LIST_SUCURSAL, branches)
      }
    }
  }
  return branches.find((b) => String(b.Suc_Id) === String(id) && String(b.Empresa) === String(companyId)) ?? null
}

function removeAppointment(session: Session, plate: string) {
  const vehicles = (session.get(K.LIST_VEHICLE, []) as Vehicle[]).map((x) => {
    if (x.Placa !== plate) return x
    const updated = { ...x, Citas_Activas: null }
    if (session.get(K.VEHICLE_SELECTED, false)) session.set(K.VEHICLE_SELECTED, updated)
    return updated
  })
  session.set(K.LIST_VEHICLE, vehicles)
}

export async function dispatch(action: string, v: Record<string, string>, session: Session, url: URL): Promise<Response | null> {
  switch (action) {
    case 'session':
      return json(sessionState(session))
    case 'user-vehicles': {
      for (const k of [K.VEHICLE, K.FULL_NAME, K.LIST_VEHICLE, K.CURRENT_APPOINTMENT, K.APPOINTMENT_DATA, K.TASKS, K.VEHICLE_SELECTED]) session.remove(k)
      let vehicles: Vehicle[] = []
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
      const response: Record<string, any> = { validated_odometer: { ...(odo.status ? odo.data : odo.error), Exitoso: odo.status } }
      session.set(K.ODOMETER_SCHEDULE, v.odometer)
      if (odo.status && !current) {
        const tasks = await gateway.getTasks(v.plate, v.odometer)
        if (tasks.status) {
          response.tasks = tasks.data
          session.set(K.TASKS, tasks.data)
        }
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
      const response: Record<string, any> = raw.data ?? {}
      response.Exitoso = response.Exitoso === 'true' || response.Exitoso === true
      const am: Date[] = []
      const pm: Date[] = []
      if (response.Exitoso) {
        const list = response.Lista_Horarios?.THorario_Disponible ?? []
        for (const t of Array.isArray(list) ? list : [list]) {
          const d = new Date(t.Fecha_Hora_Inicio)
          ;(d.getHours() < 12 ? am : pm).push(d)
        }
      }
      session.set(K.TIMES_AVAILABLE, { am: am.map((d) => d.toISOString()), pm: pm.map((d) => d.toISOString()) })
      response.times = { am: timeItems(am), pm: timeItems(pm) }
      return json(response)
    }
    case 'cancel-appointment': {
      if (!v.plate) return json({}, 405)
      const vehicle = await vehicleByPlate(session, v.plate)
      if (!vehicle) return json({ status: false, error: 'Sesión inválida' }, 403)
      let response: Record<string, any> = { status: false }
      const appt = activeAppointment(vehicle)
      if (appt) {
        response = await gateway.cancelAppointment(appt.company, appt.subsidiaryId, appt.ot, v.plate)
        if (response.status) {
          removeAppointment(session, v.plate)
          if (v.reloadTasks && v.reloadTasks !== 'false') {
            response.tasks = []
            const odometer = session.get(K.ODOMETER_SCHEDULE, false)
            if (odometer) {
              const tasks = await gateway.getTasks(v.plate, odometer)
              if (tasks.status) {
                response.tasks = tasks.data
                session.set(K.TASKS, tasks.data)
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
      if (!vehicle) return json({ Exitoso: false, Mensaje_Error: 'Sesión inválida' }, 403)
      const current = activeAppointment(vehicle)
      const response = await gateway.createAppointment({
        companyId: v.empresa,
        clientName: session.get(K.FULL_NAME),
        dateTime: `${ymd(when)}T${hms(when)}`,
        odometer: v.odometer ?? 1,
        details: Boolean(v.info),
        detailsInfo: v.info ?? '',
        email: v.email,
        lat: branch?.Suc_Latitud,
        lng: branch?.Suc_Longitud,
        plate: v.plate,
        subsidiaryAddress: branch?.Suc_Direccion,
        subsidiaryId: v.sucursal,
        subsidiaryName: branch?.Suc_Nombre,
        vehicle: await vehicleModel(session, v.plate),
        workId: v.work_id,
      }, current)
      const data: Record<string, any> = (response.status ? response.data : response.error) ?? {}
      data.Exitoso = data.Exitoso === 'true' || data.Exitoso === true
      const appointmentData = { ...session.get(K.APPOINTMENT_DATA, {}), completed: data.Exitoso, email: v.email }
      session.set(K.APPOINTMENT_DATA, appointmentData)
      return json(data)
    }
    case 'sucursals-list': {
      const task = session.get(K.TASK_SELECTED, false)
      const vehicle = session.get(K.VEHICLE_SELECTED, false)
      let response: Record<string, any> = { status: false }
      let branches: Branch[] = []
      if (task && vehicle) {
        response = await gateway.getBranchOffices(vehicle.Placa, task.CTrabajo_Id)
        if (response.status) {
          branches = formatBranches(response.data)
          session.set(K.LIST_SUCURSAL, branches)
        }
      }
      return json({ Lista_Sucursales: branches, Exitoso: response.status })
    }
    case 'save/details': {
      const task = (session.get(K.TASKS, []) as Task[]).find((t) => String(t.CTrabajo_Id) === String(v.details))
      if (task) session.set(K.TASK_SELECTED, task)
      session.set(K.DETAILS_SCHEDULE, Boolean(v.info))
      session.set(K.INFO_SCHEDULE, v.info ?? null)
      return json({ msn: 'OK' })
    }
    case 'save/branch/date': {
      const branch = await getBranch(session, v.branchId, v.companyId)
      if (branch) {
        session.set(K.APPOINTMENT_DATA, { date: v.date, branch })
        return json({ status: true })
      }
      return json({ status: false })
    }
    case 'delete_plate': {
      const plate = v.plate || url.searchParams.get('plate') || ''
      if (!plate) return null
      const vehicles: Vehicle[] = session.get(K.LIST_VEHICLE, []) || []
      if (!vehicles.some((x) => x.Placa === plate)) return json({ msn: 'error' }, 403)
      const response = await gateway.detachVehicle(plate)
      if (response.status) session.set(K.LIST_VEHICLE, vehicles.filter((x) => x.Placa !== plate))
      return json(response.status ? { msn: 'ok' } : { msn: 'error', ...response })
    }
    case 'getParameters': {
      const response = await gateway.getAppointmentsDateRange()
      return json(response.data ?? null)
    }
  }
  return null
}
