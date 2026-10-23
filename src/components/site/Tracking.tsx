import Script from 'next/script'

const safeId = (v: string) => v.replace(/[^\w-]/g, '')

/** Google Tag Manager y monitoreo Site24x7, configurables en el CMS (antes HTML pegado). */
export function HeadTracking({ gtmId, site24x7Key }: { gtmId: string; site24x7Key: string }) {
  const gtm = safeId(gtmId)
  const rum = safeId(site24x7Key)
  return (
    <>
      {gtm ? (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      ) : null}
      {rum ? <Script id="site24x7" strategy="lazyOnload" src={`https://static.site24x7rum.com/beacon/site24x7rum-min.js?appKey=${rum}`} /> : null}
    </>
  )
}

export function GtmNoScript({ gtmId }: { gtmId: string }) {
  const gtm = safeId(gtmId)
  if (!gtm) return null
  return (
    <noscript>
      <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="GTM" />
    </noscript>
  )
}

/** Píxel de retargeting Sizmek DSP de la portada. */
export function SizmekTracking({ rb, ca }: { rb?: string | null; ca?: string | null }) {
  const r = safeId(rb ?? '')
  const c = safeId(ca ?? '')
  if (!r || !c) return null
  return (
    <Script id="sizmek" strategy="lazyOnload">
      {`(function(){var w=window,d=document;var s=d.createElement('script');s.async=true;s.src='//c1.rfihub.net/js/tc.min.js';var f=d.getElementsByTagName('script')[0];f.parentNode.insertBefore(s,f);if(typeof w['_rfi']!=='function'){w['_rfi']=function(){w['_rfi'].commands=w['_rfi'].commands||[];w['_rfi'].commands.push(arguments);};}_rfi('setArgs','ver','9');_rfi('setArgs','rb','${r}');_rfi('setArgs','ca','${c}');_rfi('setArgs','_o','${r}');_rfi('setArgs','_t','${c}');_rfi('track');})();`}
    </Script>
  )
}
