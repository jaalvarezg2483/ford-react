'use client'
import { useFormFields } from '@payloadcms/ui'

/** Muestra lo que envió el formulario como tabla legible (el CMS no expone JSON). */

const LABELS: Record<string, string> = {
  name: 'Nombre', lastname: 'Apellido', email: 'Correo', phone: 'Teléfono', provincia: 'Provincia', canton: 'Cantón',
  distrito: 'Distrito', modelo: 'Modelo', model: 'Modelo', family: 'Vehículo', message: 'Mensaje', comments: 'Comentarios',
}

function humanKey(key: string) {
  if (LABELS[key]) return LABELS[key]
  const spaced = key.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function humanValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.map(humanValue).join(', ')
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => `${humanKey(k)}: ${humanValue(v)}`).join(' · ')
  }
  return String(value)
}

export function LeadDataView() {
  const value = useFormFields(([fields]) => fields?.data?.value) as Record<string, unknown> | null | undefined
  const rows = value && typeof value === 'object' && !Array.isArray(value) ? Object.entries(value) : []
  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <label className="field-label">Datos enviados</label>
      {rows.length === 0 ? (
        <p style={{ opacity: 0.7 }}>El formulario no envió datos adicionales.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {rows.map(([key, val]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--theme-elevation-100)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', width: '30%', fontWeight: 600, verticalAlign: 'top' }}>{humanKey(key)}</th>
                <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{humanValue(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
