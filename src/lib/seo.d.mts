import type { SiteContent } from '../data/types'

export const SITE_SUFFIX: string
export type PageHead = { title: string; description: string; image: string; url: string; noindex: boolean }
export function headFor(pathname: string, params: URLSearchParams, content: SiteContent | null, origin: string): PageHead
export function injectHead(html: string, head: PageHead): string
