import { useSearchParams } from 'react-router-dom'
import { FormPage } from '@/components/forms/FormPage'
import { LeadForm, matchSucursal } from '@/components/forms/LeadForm'
import { useContent } from '@/data/content'

/** Página /solicitar-test-drive: formulario corto para coordinar una prueba de manejo. */
export function TestDrive() {
  const [params] = useSearchParams()
  const { families } = useContent()
  const sucursal = matchSucursal(params.get('sucursal') || '')
  const familyKey = params.get('family') || ''
  const family = families.find((f) => f.slug === familyKey || String(f.legacyId) === familyKey)
  return (
    <FormPage
      title="Solicitar test drive"
      intro={<p>Completá tus datos y elegí la sucursal. Un asesor te contactará para coordinar la prueba de manejo.</p>}
      back={{ href: '/', label: <>Volver al <strong>inicio</strong></> }}
    >
      <LeadForm
        type="solicitar_test_drive"
        sucursal
        sucursalDefault={sucursal}
        family={family ? String(family.legacyId ?? family.slug) : familyKey || undefined}
        slug={family?.slug}
      />
    </FormPage>
  )
}
