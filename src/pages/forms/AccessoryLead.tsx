import { Navigate, useParams } from 'react-router-dom'
import { FormPage, VehicleInterest } from '@/components/forms/FormPage'
import { LeadForm } from '@/components/forms/LeadForm'
import { useFamily } from '@/data/content'

const COPY: Record<string, { title: string; intro: string; submit: string; comment?: boolean; commentRequired?: boolean }> = {
  asesor: {
    title: 'Contactar asesor de ventas',
    intro: 'Dejanos tus datos y un asesor te contactará para cotizar los accesorios de tu Ford.',
    submit: 'Enviar mensaje',
    comment: true,
    commentRequired: true,
  },
  correo: {
    title: 'Enviar cotización al correo',
    intro: 'Completá tus datos y te enviaremos la cotización de accesorios al correo.',
    submit: 'Enviar cotización',
    comment: true,
  },
}

/** Formularios de accesorios: /accesorios/:slug/asesor y /accesorios/:slug/correo. */
export function AccessoryLead({ type }: { type: 'asesor' | 'correo' }) {
  const { slug } = useParams()
  const family = useFamily(slug)
  const copy = COPY[type]
  if (!family || !copy) return <Navigate to="/404" replace />

  return (
    <FormPage
      title={copy.title}
      intro={
        <>
          <p>{copy.intro}</p>
          <p className="form__title">ME INTERESAN LOS ACCESORIOS PARA:</p>
          <VehicleInterest family={family.name} />
        </>
      }
      back={{ href: `/accesorios/${family.slug}`, label: <>Volver a <strong>cotización</strong></> }}
    >
      <LeadForm
        type={type}
        submitLabel={copy.submit}
        comment={copy.comment}
        commentRequired={copy.commentRequired}
        family={String(family.legacyId ?? family.slug)}
        slug={family.slug}
      />
    </FormPage>
  )
}
