import shell from './shell.json'
import { esc } from './html'
import { renderChrome } from './chrome'
import { fillControllers } from './controllers'
import { getSite, type PageDoc } from './data'

/**
 * Arma el documento HTML de una página con la misma estructura de
 * app/Resources/views/base.html.twig del Symfony.
 */
const LEGACY_RECAPTCHA = '6LeotmQUAAAAAEEmdheY_96QrWQBPnTdZY2DI8Qo'
const LEGACY_MAPS = 'AIzaSyDQI6kxn1-YxaAk6jyd3VsPDNGj-AbQVh4'

/**
 * Las llaves de reCAPTCHA y Google Maps del sitio actual están restringidas al
 * dominio ford.cr. En otros dominios (Railway, pruebas) se pueden reemplazar
 * con RECAPTCHA_SITE_KEY y GOOGLE_MAPS_API_KEY.
 */
export function applyEnvKeys(html: string): string {
  let out = html
  const recaptcha = process.env.RECAPTCHA_SITE_KEY
  const maps = process.env.GOOGLE_MAPS_API_KEY
  if (recaptcha && recaptcha !== LEGACY_RECAPTCHA) out = out.replaceAll(LEGACY_RECAPTCHA, recaptcha)
  if (maps && maps !== LEGACY_MAPS) out = out.replaceAll(LEGACY_MAPS, maps)
  return out
}

export async function renderPage(page: PageDoc): Promise<string> {
  return applyEnvKeys(await renderDocument(page))
}

async function renderDocument(page: PageDoc): Promise<string> {
  if (page.template === 'raw') return page.rawDocument || ''
  const site = await getSite()
  const v = site.assetsVersion
  const content = await fillControllers(page.content || '')
  const route = page.route || page.bodyClass || ''
  return (
    shell.docStart +
    '\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name=viewport content="width=device-width, initial-scale=1">\n' +
    (page.metaHtml ?? '') +
    site.headScripts +
    '<title>\n            ' + esc(page.title || '') + '        ' +
    shell.titleCloseToTheme +
    (page.headStyles ?? '\n\n        ') +
    shell.cssBlock.replaceAll('{{v}}', v) +
    (page.headCustom ?? '') +
    shell.headCloseToBody +
    `<body class="${esc(page.bodyClass || '')}">` +
    (page.bodyStart || site.bodyStartHtml) +
    (page.seoH1 ?? '') +
    renderChrome(site, page.activeMenu || '') +
    content +
    site.footerHtml +
    shell.spinner +
    shell.mainJs.replaceAll('{{v}}', v) +
    `
        <script>
            var route = "${esc(route)}";
            var enviroment = "prod" === "dev"? "/app_dev.php":"";
        </script>` +
    (page.scripts ?? '') +
    (page.tail || site.bodyEndScripts) +
    shell.docEnd
  )
}
