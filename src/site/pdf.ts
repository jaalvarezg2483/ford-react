import { renderTwig, setTwigParameters } from '@/legacy/twig'
import { calculatorEntity, calculators, findFamily, findModel, siteParameters } from './legacy-data'
import { applyCalculatorSession, sessionTotal } from './calculator'
import { getSession, withSession } from './session'
import { readFields } from './forms'

/**
 * PDF de la cotización (quotationPdfGenerationAction). Misma plantilla Twig
 * (PDF/quotation.html.twig); el Symfony usaba Flying Saucer y aquí se imprime con Chromium.
 */
export async function quotationPdf(req: Request, slug: string, code: string): Promise<Response | null> {
  const family = await findFamily({ slug })
  const hit = family ? await findModel({ code }, family) : null
  if (!family || !hit) return null
  const session = await getSession(req)
  // Igual que el Symfony: valida la selección contra la familia antes de cotizar.
  await applyCalculatorSession(req, new URL(`/autos/${slug}/calcular/${code}`, 'http://local'), '', session)
  const fields = await readFields(req)
  const price = Number(hit.model.price ?? family.startPrice ?? 0)
  const aditionalFields = {
    accesories: session.get('Se_accessories', {}),
    insurance: session.get('Se_insurance', {}),
    maintenance: session.get('Se_maintenance', {}),
    total: price + sessionTotal(session),
    price,
  }
  setTwigParameters(await siteParameters())
  const port = process.env.PORT || '3000'
  const html = renderTwig('PDF/quotation.html.twig', {
    insurancePrice: 0,
    model: { ...hit.model, getName: () => hit.model.name },
    family: { ...family, getName: () => family.name },
    financiamientos: (await calculators()).map(calculatorEntity),
    aditionalFields,
    contactName: fields.quotation_name ?? '',
    ingress_service_url: process.env.PDF_ASSETS_URL || `http://127.0.0.1:${port}`,
  })
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({ executablePath: process.env.PDF_CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 30_000 })
    const pdf = await page.pdf({ format: 'Letter', printBackground: true })
    const filename = `Cotización ${family.name}-${hit.model.code}.pdf`
    const res = new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
    return withSession(res, session)
  } finally {
    await browser.close()
  }
}
