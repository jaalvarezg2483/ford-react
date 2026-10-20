import shell from './shell.json'
import { esc } from './html'
import { renderChrome } from './chrome'
import { fillControllers } from './controllers'
import { getSite, type PageDoc } from './data'

/**
 * Arma el documento HTML de una página con la misma estructura de
 * app/Resources/views/base.html.twig del Symfony.
 */
export async function renderPage(page: PageDoc): Promise<string> {
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
