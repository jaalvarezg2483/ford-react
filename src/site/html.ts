/** Escapa texto para HTML (mismo criterio que el autoescape de Twig). */
export function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Precio con separador de miles "." como number_format(0, ',', '.') de Twig. */
export function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return ''
  return Math.round(Number(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
