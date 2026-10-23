/**
 * Contrato entre el CMS y el sitio. El CMS arma este objeto (cms/src/lib/siteContent.ts),
 * el servidor lo publica en /site-content.json y el sitio React lo consume.
 */

export type Link = { label: string; href: string }

export type FamilyCard = {
  id: number
  name: string
  slug: string
  startPrice: number | null
  hidePrice: boolean
  fordPerformance: boolean
  menuImage: string
  homeImage: string
  homeColor: string
  homeGradient: string
}

export type FamilyType = {
  id: number
  name: string
  textColor: string
  underlineColor: string
  promo: { logo: string; title: string; paragraphs: string[] } | null
  families: FamilyCard[]
  cardStyles: { slug: string; image?: string; color?: string; gradient?: string }[]
}

export type Footer = {
  links: { label: string; href: string; highlight: boolean }[]
  bottomLinks: { label: string; href: string; newTab: boolean }[]
  ethicsText: string
  ethicsUrl: string
  ethicsButton: string
  copyright: string
}

export type Site = {
  topMenu: Link[]
  social: { href: string; icon: string }[]
  /** Redes del pie (incluye las que no van en el menú, como TikTok). */
  footerSocial: { href: string; icon: string }[]
  footer: Footer
  gtmId: string
  site24x7Key: string
  recaptchaSiteKey: string
  googleMapsKey: string
  whatsapp: { phone: string; message: string; label: string } | null
  familyTypes: FamilyType[]
}

export type Cta = { kicker: string; title: string; titleMobile: string; text: string; linkLabel: string; href: string }

export type HeroSlide = { xs: string; md: string; lg: string; video: string; alt: string; title: string; link: string; btnText: string }

export type Home = {
  title: string
  description: string
  slides: HeroSlide[]
  vehiclesTitle: string
  servicesTitle: string
  servicesText: string
  serviceRows: { title: string; href: string; image: string; alt: string }[][]
  tech: { kicker: string; title: string; text: string; items: { title: string; text: string; image: string }[] }
  financing: Cta
  compare: Cta
  contact: Cta
  news: { title: string; path: string; image: string }[]
  app: {
    title?: string
    text?: string
    logo?: string
    registerUrl?: string
    buttonLabel?: string
    appStoreUrl?: string
    playStoreUrl?: string
    phoneMobile?: string
    phoneDesktop?: string
  }
  sizmek: { rb?: string | null; ca?: string | null }
}

export type Specs = Partial<Record<'cc' | 'gas' | 'traction' | 'transmission' | 'pasajeros' | 'totalLength' | 'totalHeight' | 'totalWidth' | 'distanceBetweenAxis', string | number>>

export type Model = {
  id: number | null
  code: string
  name: string
  year: number | null
  price: number | null
  image: string
  calculable: boolean
  features: string[]
  specs: Specs
}

export type Family = FamilyCard & {
  legacyId: number | null
  code: string
  year: number | null
  tagline: string
  heroDesktop: string
  heroMobile: string
  leadTitle: string
  leadText: string
  purdyGoUrl: string
  showCalculate: boolean
  colors: { name: string; hex: string; image: string; disclaimer: string }[]
  highlights: { title: string; text: string; image: string }[]
  gallery: { title: string; items: { image: string; caption: string }[] }[]
  models: Model[]
  dataSheets: { id: number | null; title: string; url: string }[]
}

export type PostSummary = {
  title: string
  path: string
  category: string
  categoryId: number | null
  views: number
  featured: boolean
  date: string
  image: string
  summary: string
}

export type PostDetail = {
  path: string
  title: string
  heading: string
  banner: string
  bodyHtml: string
  articleId: number | null
  views: number
  up: number
  down: number
  description: string
  image: string
}

export type Calculator = { name: string; rate: number; commission: number; prima: number; term: number }

/** Bloques de las páginas de contenido (colección "Páginas de contenido" del CMS). */
export type ContentBlock =
  | { type: 'html'; html: string }
  | { type: 'slider'; slides: HeroSlide[]; showContainer: boolean; showBackLink: boolean }
  | { type: 'cards'; items: { image: string; alt: string; title: string; href: string }[] }
  | { type: 'contactForm'; formType: string; title: string; phone: string; mail: string; subject: string; description: string }
  | { type: 'aboutTabs'; tabs: { title: string; text: string; images: string[] }[] }
  | { type: 'timeline'; title: string; items: { year: string; text: string; image: string }[] }
  | { type: 'simpleBanner'; slides: { xs: string; md: string; lg: string; alt: string; title: string; text: string }[] }
  | { type: 'techCards'; anchor: string; title: string; cards: { title: string; html: string; image: string }[] }
  | { type: 'techHotspots'; anchor: string; title: string; image: string; dots: { top: string; left: string; title: string; html: string; image: string }[] }
  | { type: 'techTabs'; anchor: string; title: string; tabs: { label: string; title: string; html: string; image: string; videoUrl: string }[] }
  | { type: 'vehiclePicker'; title: string; intro: string; aside: string; linkBase: string }
  | { type: 'downloads'; breadcrumb: string; title: string; items: { title: string; url: string }[] }

export type ContentPageMeta = { path: string; title: string; description: string; image: string }
export type ContentPageData = ContentPageMeta & { blocks: ContentBlock[] }

export type VideoItem = { name: string; category: string; youtube: string; image: string; description: string }

export type SiteContent = {
  generatedAt: string
  /** Sitio anterior, para enlazar las secciones que aún no se migraron. Null si este es el dominio oficial. */
  legacyUrl: string | null
  site: Site
  home: Home
  families: Family[]
  posts: PostSummary[]
  videos: VideoItem[]
  /** Entidad financiera usada para la cuota aproximada del comparador. */
  cafsa: Calculator | null
  redirects: Record<string, { to: string; permanent: boolean }>
  /** Páginas de contenido del CMS (el cuerpo se pide a /content-page.json?path=…). */
  pages: ContentPageMeta[]
}
