import { A } from '@/components/ui/A'

const STEPS = [
  { n: 1, label: 'Vehículo', href: '/citas/step1' },
  { n: 2, label: 'Servicio', href: '/citas/step2' },
  { n: 3, label: 'Taller y Fecha', href: '/citas/step3' },
  { n: 4, label: 'Confirmación', href: '/citas/step4' },
]

export function CitasSteps({ activeStep, blockStep = {} }: { activeStep: number; blockStep?: Record<number, boolean> }) {
  return (
    <div className="calculate-nav calculate-nav--wide">
      {STEPS.map((step) => {
        const current = activeStep >= step.n
        const blocked = Boolean(blockStep[step.n])
        return (
          <div key={step.n} className={`calculate-nav-item ${current ? 'current' : 'disabled'} ${blocked ? 'disabled' : ''}`}>
            <A href={step.href} className="calculate-nav-btn">
              {step.n}
            </A>
            <span>{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
