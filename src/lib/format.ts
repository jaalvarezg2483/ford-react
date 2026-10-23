/** Precio con separador de miles "." como number_format(0, ',', '.') del sitio anterior. */
export function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return ''
  return Math.round(Number(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Ruta de una imagen del CMS como la sirve el sitio (miniatura de blog, etc.). */
export const blogThumb = (image: string) => (image.startsWith('/uploads/') ? `/media/cache/blog_teaser${image}` : image)
