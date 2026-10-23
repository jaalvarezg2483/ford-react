import type { RouteObject } from 'react-router-dom'
import { CitasIndex } from '@/pages/citas/CitasIndex'
import { CitasStep1 } from '@/pages/citas/CitasStep1'
import { CitasStep2 } from '@/pages/citas/CitasStep2'
import { CitasStep3 } from '@/pages/citas/CitasStep3'
import { CitasStep4 } from '@/pages/citas/CitasStep4'
import { ScheduledCar } from '@/pages/citas/ScheduledCar'

/**
 * Citas de taller.
 * Páginas en src/pages/citas/, componentes en src/components/citas/.
 */
export const citasRoutes: RouteObject[] = [
  { path: '/citas', element: <CitasIndex /> },
  { path: '/citas/step1', element: <CitasStep1 /> },
  { path: '/citas/step2', element: <CitasStep2 /> },
  { path: '/citas/step3', element: <CitasStep3 /> },
  { path: '/citas/step4', element: <CitasStep4 /> },
  { path: '/citas/scheduled-car', element: <ScheduledCar /> },
]
