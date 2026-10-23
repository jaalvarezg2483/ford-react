import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FamilyPicker } from '@/components/forms/FamilyPicker'
import { FormPage, VehicleInterest } from '@/components/forms/FormPage'
import { LeadForm, matchSucursal } from '@/components/forms/LeadForm'
import { A } from '@/components/ui/A'
import { useFamily } from '@/data/content'

function decodeParam(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * /select-family/:branch/test-drive — elige familia (o muestra el formulario si ya viene family en la query).
 * La sucursal sale del nombre de la sucursal en la ruta (enlace desde /sucursales).
 */
export function SelectFamilyTestDrive() {
  const { branch = '' } = useParams()
  const [params] = useSearchParams()
  const sucursalName = decodeParam(branch)
  const sucursal = matchSucursal(sucursalName)
  const familyKey = params.get('family') || ''
  const family = useFamily(familyKey)

  if (familyKey) {
    if (!family) return <Navigate to="/404" replace />
    const model = family.models[0]
    return (
      <FormPage
        title="Solicitar test drive"
        intro={
          <>
            <p>Completá tus datos para coordinar la prueba de manejo en {sucursalName}.</p>
            <p className="form__title">ME INTERESA EL VEHÍCULO:</p>
            <VehicleInterest family={family.name} model={model?.name} />
          </>
        }
        back={{ href: `/select-family/${encodeURIComponent(sucursalName)}/test-drive`, label: <>Volver a <strong>familias</strong></> }}
      >
        <LeadForm
          type="prueba-manejo"
          sucursal
          sucursalDefault={sucursal}
          family={String(family.legacyId ?? family.slug)}
          model={model ? String(model.id ?? model.code) : undefined}
          slug={family.slug}
          code={model?.code}
        />
      </FormPage>
    )
  }

  return (
    <FormPage
      title="Prueba de manejo"
      intro={
        <>
          <p className="text text-center">Elegí la familia para solicitar la prueba de manejo{sucursalName ? ` en ${sucursalName}` : ''}.</p>
          <p className="text-center">
            <A href="/sucursales">Ver sucursales</A>
          </p>
        </>
      }
      back={{ href: '/sucursales', label: <>Volver a <strong>sucursales</strong></> }}
    >
      <FamilyPicker hrefFor={(f) => `/select-family/${encodeURIComponent(sucursalName)}/test-drive?family=${encodeURIComponent(f.slug)}`} />
    </FormPage>
  )
}
