import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { bumpSiteVersion } from '@/site/cache'

/** Cualquier cambio en el CMS invalida la caché en memoria del sitio público. */
export const revalidateSite: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({ doc }: { doc: unknown }) => {
  bumpSiteVersion()
  return doc
}
