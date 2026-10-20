import { esc, money } from './html'
import { absolute, getPosts, getSite, getSlider } from './data'

/**
 * (El CMS anterior pasaba estos bloques por un parser DOM: por eso las etiquetas
 * de cierre extra como </source></source>; se conservan para que el HTML sea idéntico.)
 *
 * Bloques dinámicos que el CMS anterior insertaba dentro del contenido con
 * <div data-controller="…" data-parameters="…">. Mismo marcado que las
 * plantillas Twig originales; los datos salen de Payload.
 */
type Params = Record<string, string | number | boolean>
type Controller = (params: Params) => Promise<string>

/** data-parameters del Symfony usa JSON con comillas simples: {'name':'BANNER_HOME', 'showContainer': true} */
export function parseParams(raw: string | undefined): Params {
  if (!raw) return {}
  const decoded = raw.replace(/&quot;/g, '"').replace(/&#039;/g, "'")
  try {
    return JSON.parse(decoded.replace(/'/g, '"'))
  } catch {
    return {}
  }
}

const renderSlider: Controller = async (params) => {
  const slides = await getSlider(String(params.name ?? ''))
  const showContainer = params.showContainer === true || params.showContainer === 'true'
  const showBackLink = params.showBackLink === true || params.showBackLink === 'true'
  let out = ''
  if (showBackLink) {
    out += `
    <div class="hidden-xs bg-muted padding-1 text-left">
        <div class="container">
            <a href="javascript:history.back()" class="text--primary"><strong><i class="icon icon-arrow-left"></i>  Volver</strong></a>
        </div>
    </div>
`
  }
  out += '<!-- slider file -->\n'
  if (showContainer) out += '    <div class="slider--hero">\n'
  slides.forEach((item: any, i: number) => {
    const alt = esc(item.alt || `Banner ${i + 1}`)
    out += `    <div class="hero-slide">
`
    if (showBackLink) out += `            <a href="javascript:history.back()" class="hidden-md floating-back-link"><strong><i class="icon icon-arrow-left"></i>  Volver<strong></strong></strong></a>
`
    if (item.video) {
      out += `            <video class="hero-background" autoplay muted loop poster="${esc(item.md)}">
                <source src="${esc(item.video)}"
                        type="video/mp4">
                Sorry, your browser doesn't support embedded videos.
            </video>
`
    } else if (item.xs) {
      out += `            <picture class="hero-background">
                                                    <source media="(max-width: 599px)" srcset="${esc(item.xs)}">
                    <source media="(min-width: 600px) and (max-width: 767px)" srcset="${esc(item.md)}">
                    <source media="(min-width: 768px)" srcset="${esc(item.lg)}">
                    <img src="${esc(item.xs)}" alt="${alt}" class="bannerimg">
                            </source></source></source></picture>
`
    } else {
      out += `            <picture class="hero-background">
                                                    <source media="(min-width: 600px) and (max-width: 1199px)" srcset="${esc(item.md)}">
                    <source media="(min-width: 768px)" srcset="${esc(item.lg)}">
                    <img src="${esc(item.lg)}" alt="${alt}" class="bannerimg">
                            </source></source></picture>
`
    }
    out += `        <div class="title_container">
            <h1 class="title text--light">${esc(item.title)}</h1>
        </div>
`
    if (item.link) {
      out += `        <div class="button-container">
            <a class="btn btn--primary btn-banner"${item.link === 'https://purdyenlinea.com/' ? ' target="_blank"' : ''} href="${esc(item.link)}">
            ${item.btnText ? esc(item.btnText) : 'Ver más'}</a>
        </div>
`
    }
    out += `            </div>
`
  })
  if (showContainer) out += '    </div>\n'
  return out
}

/** Pestañas de vehículos del inicio (LumenAppBundle:Default:familyList). */
const familyList: Controller = async () => {
  const site = await getSite()
  const types = site.familyTypes
  const tabs = types.map((t, i) => `                    <li class="tab ${i === 0 ? 'active' : ''} ${t.textColor.toLowerCase() !== '#000000' ? 'custom-color' : ''}" style="--category-text-color:${esc(t.textColor)};
                        --underlined-text-color:${esc(t.underlineColor)};">
                <a href="#slider${i + 1}" data-toggle="tab">${esc(t.name)}</a>
            </li>
`).join('')
  const panes = types.map((t, i) => `                    <li class="tab-pane fade tab--find-car ${i === 0 ? 'in active' : ''}" id="slider${i + 1}">
                <div class="row">
                    <div class="slider slider--car js-slider-car js-equal-height-parent">
${t.families.map((f) => `                                                    <div style="--linear-gradient-custom:${esc(f.homeGradient)}; ">
                                <div class="model-bg" style="background-color:${esc(f.homeColor)}"></div>
                                <a href="/autos/${esc(f.slug)}" class="slider__link js-equal-height ">
                                    <p>Ford</p>
                                    <h2>${esc(f.name)}</h2>
${f.hidePrice ? '' : `                                                                            <p>desde</p>
                                        <h3>$${money(f.startPrice)}</h3>
`}                                                                        <img src="${esc(f.homeImage)}" alt="car">
                                    <button class="btn btn--clear">Ver más <i class="icon icon-arrow-right"></i></button>
                                </a>
                            </div>
`).join('')}                                            </div>
                </div>
            </li>
`).join('')
  return `<div class="container">
    <ul class="tabs tabs-home js-tabs-car">
${tabs}            </ul>
    <ul class="collapsible tab-content js-collapse-car">
${panes}            </ul>
</div>`
}

/** Últimas notas del blog (LumenAppBundle:Snippet:renderRecentBlog). */
const renderRecentBlog: Controller = async (params) => {
  const size = Number(params.size ?? 6) || 6
  const posts = (await getPosts()).slice(0, size)
  return `    <div class="container">
        <div class="row">
            <div class="col-md-3">
                <h3 class="subtitle">Noticias recientes</h3>
                <h2 class="title news-title">FORD</h2>
                <a class="btn hidden-xs text--bold" href="/blog">Ir a blog</a>
            </div>
            <div class="col-md-9">
                <div class="news-slider js-equal-height-parent">
${posts.map((p) => `                                            <div class="card--link">
                            <div class="news-card-img" style="background-image:url('${esc(absolute(teaser(p.image)))}')">
                                                            </div>
                            <div class="card__content js-equal-height">
                                <h4 class="title">${esc(p.title)}</h4>
                                <a class="btn btn--clear" href="${esc(p.path)}">Ver más <i class="icon icon-arrow-right"></i></a>
                            </div>
                        </div>
`).join('')}                                    </div>
                <a class="btn visible-xs text--bold" href="/blog">Ir a blog</a>
            </div>
        </div>
    </div>
`
}

/** Miniatura del blog (filtro blog_teaser de LiipImagine). */
export function teaser(path: string): string {
  if (!path) return ''
  return path.startsWith('/uploads/') ? `/media/cache/blog_teaser${path}` : path
}

export const CONTROLLERS: Record<string, Controller> = {
  'LumenCMSBundle:Default:renderSlider': renderSlider,
  'LumenAppBundle:Default:familyList': familyList,
  'LumenAppBundle:Snippet:renderRecentBlog': renderRecentBlog,
}

export const KNOWN_CONTROLLERS = new Set(Object.keys(CONTROLLERS))

/** Rellena los bloques dinámicos vacíos del contenido de una página. */
export async function fillControllers(content: string): Promise<string> {
  const re = /<div data-controller="([^"]+)"(?: data-parameters="([^"]*)")?><\/div>/g
  const jobs: Promise<string>[] = []
  const parts: string[] = []
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    const controller = CONTROLLERS[m[1]]
    if (!controller) continue
    parts.push(content.slice(last, m.index + m[0].length - 6))
    jobs.push(controller(parseParams(m[2])).catch((error) => {
      console.error(`Bloque ${m![1]} falló:`, error)
      return ''
    }))
    last = m.index + m[0].length - 6
  }
  if (!jobs.length) return content
  const rendered = await Promise.all(jobs)
  let out = ''
  parts.forEach((p, i) => { out += p + rendered[i] })
  return out + content.slice(last)
}
