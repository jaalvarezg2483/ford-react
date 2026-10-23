import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { AccessoryLead } from '@/pages/forms/AccessoryLead'
import { CitasTallerMovil } from '@/pages/forms/CitasTallerMovil'
import { Contacto } from '@/pages/forms/Contacto'
import { Gracias } from '@/pages/forms/Gracias'
import { ReservaFamily, ReservaForm, ReservaModelos } from '@/pages/forms/Reserva'
import { SelectFamilyTestDrive } from '@/pages/forms/SelectFamilyTestDrive'
import { TestDrive } from '@/pages/forms/TestDrive'
import { VehicleLead } from '@/pages/forms/VehicleLead'

/**
 * Formularios de contacto y solicitudes (contacto, test drive, asesor, reserva, cotización por correo).
 * Páginas en src/pages/forms/, componentes en src/components/forms/.
 */
export const formsRoutes: RouteObject[] = [
  { path: '/contacto/gracias', element: <Gracias /> },
  { path: '/contacto/:type/gracias', element: <Gracias /> },
  { path: '/contacto/:type/:family/gracias', element: <Gracias /> },
  { path: '/contacto', element: <Contacto /> },
  { path: '/contactanos', element: <Navigate to="/contacto" replace /> },
  { path: '/solicitar-test-drive/gracias', element: <Gracias /> },
  { path: '/solicitar-test-drive', element: <TestDrive /> },
  { path: '/select-family/:branch/test-drive', element: <SelectFamilyTestDrive /> },
  { path: '/autos/:slug/calcular/:code/asesor', element: <VehicleLead type="asesor" /> },
  { path: '/autos/:slug/calcular/:code/reserva', element: <VehicleLead type="reserva" /> },
  { path: '/autos/:slug/calcular/:code/prueba-manejo', element: <VehicleLead type="prueba-manejo" /> },
  { path: '/autos/:slug/calcular/:code/correo', element: <VehicleLead type="correo" /> },
  { path: '/citas-taller-movil', element: <CitasTallerMovil /> },
  { path: '/citas-taller-movil/gracias', element: <Navigate to="/contacto/citas-taller-movil/gracias" replace /> },
  { path: '/autos/:slug/:type/:code/gracias', element: <Gracias /> },
  { path: '/accesorios/:slug/asesor', element: <AccessoryLead type="asesor" /> },
  { path: '/accesorios/:slug/correo', element: <AccessoryLead type="correo" /> },
  { path: '/accesorios/:slug/:type/gracias', element: <Gracias /> },
  { path: '/reserva', element: <ReservaFamily /> },
  { path: '/reserva/:slug/modelos', element: <ReservaModelos /> },
  { path: '/reserva/:slug/:code', element: <ReservaForm /> },
]
