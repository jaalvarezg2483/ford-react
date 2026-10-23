import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useContent } from '@/data/content'
import { useRouteHead } from '@/lib/useHead'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Spinner } from '@/components/layout/Spinner'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { GtmNoScript, HeadTracking, pageView } from '@/components/layout/Tracking'
import { SiteRoutes } from '@/routes'

/** Al navegar vuelve arriba (salvo anclas) y avisa a Google Tag Manager de la nueva página. */
function useRouteEffects() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, search, hash])
  useEffect(() => pageView(pathname + search), [pathname, search])
}

/** Plantilla común del sitio (encabezado, pie, WhatsApp) y rutas de las páginas migradas. */
export function App() {
  const { site } = useContent()
  useRouteHead()
  useRouteEffects()
  return (
    <>
      <HeadTracking gtmId={site.gtmId} site24x7Key={site.site24x7Key} />
      <GtmNoScript gtmId={site.gtmId} />
      <a className="ford-skip-link" href="#main-content">
        Saltar al contenido principal
      </a>
      <SiteChrome topMenu={site.topMenu} social={site.social} familyTypes={site.familyTypes} />
      <SiteRoutes />
      <SiteFooter footer={site.footer} footerSocial={site.footerSocial} />
      <WhatsAppButton whatsapp={site.whatsapp} />
      <Spinner />
    </>
  )
}
