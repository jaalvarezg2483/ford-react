import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@/styles/site.scss'
import { getSite } from '@/site/data'
import { SiteChrome } from '@/components/site/SiteChrome'
import { SiteFooter } from '@/components/site/SiteFooter'
import { Spinner } from '@/components/site/Spinner'
import { WhatsAppButton } from '@/components/site/WhatsAppButton'
import { GtmNoScript, HeadTracking } from '@/components/site/Tracking'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#ffffff' }

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(env.SERVER_URL),
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: { url: '/apple-touch-icon.png', sizes: '120x120' },
      other: [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#00498f' }],
    },
    manifest: '/manifest.json',
    other: { 'mobile-web-app-capable': 'yes', google: 'notranslate' },
    // Fuera de www.ford.cr no se indexa la copia.
    robots: /^https:\/\/www\.ford\.cr$/.test(env.SERVER_URL) || env.NODE_ENV !== 'production' ? undefined : { index: false, follow: false },
  }
}

/** Plantilla común del sitio (base.html.twig del Symfony) en React. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const site = await getSite()
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700|Roboto:100,300,400,500,700,900|Montserrat:400,500,700&display=swap" />
        <HeadTracking gtmId={site.gtmId} site24x7Key={site.site24x7Key} />
      </head>
      <body>
        <GtmNoScript gtmId={site.gtmId} />
        <a className="ford-skip-link" href="#main-content">
          Saltar al contenido principal
        </a>
        <SiteChrome topMenu={site.topMenu} social={site.social} familyTypes={site.familyTypes} />
        {children}
        <SiteFooter footer={site.footer} footerSocial={site.footerSocial} />
        <WhatsAppButton whatsapp={site.whatsapp} />
        <Spinner />
      </body>
    </html>
  )
}
