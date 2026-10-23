import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

/**
 * Campos de formulario con el mismo marcado y clases que el sitio anterior
 * (`.input-field`, `.label--black`, `.input`), para conservar el estilo original.
 */
type Base = { id: string; label: ReactNode; required?: boolean; error?: string; className?: string; hint?: ReactNode }

const Label = ({ id, label, required }: Pick<Base, 'id' | 'label' | 'required'>) => (
  <label htmlFor={id} className="label--black">
    {required ? <span className="text--primary">* </span> : null}
    {label}
  </label>
)

const Error = ({ id, error }: { id: string; error?: string }) =>
  error ? (
    <span id={`${id}-error`} className="error text--primary" role="alert">
      {error}
    </span>
  ) : null

export function TextField({ id, label, required, error, className = '', hint, ...rest }: Base & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`input-field ${error ? 'has-error' : ''} ${className}`}>
      <Label id={id} label={label} required={required} />
      <input id={id} name={rest.name ?? id} className="input" required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      {hint}
      <Error id={id} error={error} />
    </div>
  )
}

export function TextAreaField({ id, label, required, error, className = '', hint, ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={`input-field ${error ? 'has-error' : ''} ${className}`}>
      <Label id={id} label={label} required={required} />
      <textarea id={id} name={rest.name ?? id} className="input" required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      {hint}
      <Error id={id} error={error} />
    </div>
  )
}

export type Option = { value: string | number; label: string }

export function SelectField({
  id,
  label,
  required,
  error,
  className = '',
  options,
  placeholder,
  hint,
  ...rest
}: Base & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[]; placeholder?: string }) {
  return (
    <div className={`input-field select ${error ? 'has-error' : ''} ${className}`}>
      <Label id={id} label={label} required={required} />
      <select id={id} name={rest.name ?? id} className="input js-select browser-default" required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest}>
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint}
      <Error id={id} error={error} />
    </div>
  )
}

/** Casilla con texto (por ejemplo, consentimiento informado). */
export function CheckField({ id, label, error, className = '', ...rest }: Omit<Base, 'required'> & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`input-field checkbox ${error ? 'has-error' : ''} ${className}`}>
      <input type="checkbox" id={id} name={rest.name ?? id} {...rest} />
      <label htmlFor={id}>{label}</label>
      <Error id={id} error={error} />
    </div>
  )
}
