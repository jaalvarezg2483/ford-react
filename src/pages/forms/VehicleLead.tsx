import { Navigate, useLocation, useParams } from 'react-router-dom'
import { FormPage, VehicleInterest } from '@/components/forms/FormPage'
import { LeadForm } from '@/components/forms/LeadForm'
import { useFamily } from '@/data/content'

const COPY: Record<string, { title: string; intro: string; submit: string; comment?: boolean; commentRequired?: boolean; sucursal?: boolean }> = {
  asesor: {
    title: 'Contactar asesor de ventas',
    intro: 'Dejanos tus datos y un asesor de ventas te contactará pronto.',
    submit: 'Enviar mensaje',
    comment: true,
    commentRequired: true,
  },
  reserva: {
    title: 'Solicitar reserva de vehículo',
    intro: 'Completá tus datos para solicitar la reserva de tu Ford. Un asesor te contactará para dar seguimiento.',
    submit: 'Enviar solicitud',
    sucursal: true,
  },
  'prueba-manejo': {
    title: 'Solicitar test drive',
    intro: 'Completá tus datos y elegí la sucursal. Un asesor te contactará para coordinar la prueba de manejo.',
    submit: 'Enviar solicitud',
    sucursal: true,
  },
  correo: {
    title: 'Enviar cotización al correo',
    intro: 'Completá tus datos y te enviaremos la cotización del vehículo al correo.',
    submit: 'Enviar cotización',
    comment: true,
  },
}

/** Formularios ligados a un modelo: /autos/:slug/calcular/:code/(asesor|reserva|prueba-manejo) y /reserva/:slug/:code. */
export function VehicleLead({ type }: { type: 'asesor' | 'reserva' | 'prueba-manejo' | 'correo' }) {
  const { slug, code } = useParams()
  const { pathname } = useLocation()
  const family = useFamily(slug)
  const model = family?.models.find((m) => m.code === code)
  const copy = COPY[type]
  if (!family || !model || !copy) return <Navigate to="/404" replace />

  const fromReserva = pathname.startsWith('/reserva/')
  const back = fromReserva
    ? { href: `/reserva/${family.slug}/modelos`, label: <>Volver a <strong>modelos</strong></> }
    : { href: `/autos/${family.slug}/calcular/${model.code}`, label: <>Volver a <strong>cotización</strong></> }

  return (
    <FormPage
      title={copy.title}
      intro={
        <>
          <p>{copy.intro}</p>
          <p className="form__title">ME INTERESA EL VEHÍCULO:</p>
          <VehicleInterest family={family.name} model={model.name} />
        </>
      }
      back={back}
    >
      <LeadForm
        type={type}
        submitLabel={copy.submit}
        sucursal={copy.sucursal}
        comment={copy.comment}
        commentRequired={copy.commentRequired}
        family={String(family.legacyId ?? family.slug)}
        model={String(model.id ?? model.code)}
        slug={family.slug}
        code={model.code}
      />
    </FormPage>
  )
}
