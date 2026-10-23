import type { ReactNode } from 'react'

export type CitaAppointment = {
  date?: string
  subsidiaryName?: string
  subsidiaryId?: string
  company?: string
  ot?: string
  work?: { id?: string; detail?: string }
}

export type CitaVehicle = {
  Placa: string
  Modelo: string
  Marca?: string
  Anio?: string | number
  Odometro?: string | number
  Propietario?: string
  Citas_Activas?: CitaAppointment | null
}

export type CitaTask = {
  CTrabajo_Id: string
  Detalle: string
  Precio_CT_Sugerido?: string | number
  services?: string[]
  disclaimer?: string
}

export type CitaBranch = {
  Suc_Id: string | number
  Empresa: string | number
  Suc_Nombre: string
  Suc_Direccion?: string
  Suc_Latitud?: string | number
  Suc_Longitud?: string | number
  Anio?: string | number
}

export type CitaTime = { value: string; label: string }

export type CitasSession = {
  fullName: string
  vehicles: CitaVehicle[]
  vehicleSelected: CitaVehicle | false
  tasks: CitaTask[]
  taskSelected: CitaTask | false
  currentAppointment: CitaAppointment | false
  appointmentData: { date?: string; branch?: CitaBranch; completed?: boolean; email?: string } | false
  timesAvailable: { am: string[]; pm: string[] }
  odometer: string | number
}

export type ModalOption = { title: string; onClick: () => void }

export type ModalState = {
  open: boolean
  title?: string
  message: ReactNode
  optionOne?: ModalOption
  optionTwo?: ModalOption
}
