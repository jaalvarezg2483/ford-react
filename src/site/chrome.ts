import { esc, money } from './html'
import type { SiteData, FamilyTypeView } from './data'

/** Encabezado, menú, submenú de vehículos y buscador (partials _header y _search del Symfony). */
export function renderChrome(site: SiteData, active: string): string {
  const is = (key: string) => active.split(',').includes(key)
  const top = site.topMenu
    .map((item) => `<li >
    <a href="${esc(item.href)}" class="menu__item ${is(item.href) ? 'active' : ''}"
             >${esc(item.label)}
            </a>
</li>
`)
    .join('')
  return `<header class="header">
	<a class="text-replace logo-ford" href="/">FORD</a>
	<button type="button" class="btn btn--smallest js-submenu-open hidden-md" data-sub="subNuevos">Vehículos nuevos</button>
	<button type="button" class="menu__toggle js-menu-toggle"><i class="icon icon-hamburger"></i></button>
</header>


<menu class="menu">
	<!-- <a href="" class="menu__search"> <i class="mdi mdi-magnify"></i> Buscar en el sitio </a> -->
	<div class="menu__field">
		<!-- <a class="js-close_search"><i class="mdi mdi-close"></i></a> -->
		<form action="/resultados" method="get">
			<input class="js-hidde_menu input" type="text" placeholder="Buscar en el sitio">
			<button type="button" name="button"><i class="icon icon-arrow-right"></i></button>
		</form>

	</div>
	<ul class="menu__top">
		<li><a href="/" class="menu__item ${is('/') ? 'active' : ''}">Inicio</a></li>
		<li>
			<button type="button" class="menu__item js-submenu-open ${is('subNuevos') ? 'active' : ''}
							" data-sub="subNuevos">Vehículos nuevos</button>
		</li>
		${top}	</ul>
	<ul class="menu__right">	
		<li>
			<a href="/herramientas-de-compra" class="menu__item wide-line ${is('/herramientas-de-compra') ? 'active' : ''}"><span class="icon icon-dolar hidden-xs"></span> Herramientas de compra </a>
		</li>
		<li><a href="/calcular" class="menu__item wide-line ${is('/calcular') ? 'active' : ''}"> <i class="icon icon-calculator hidden-xs"></i> Calcular Financiamiento </a></li>
		<li><a href="#" class="btn--search menu__item js-search-open"> <i class="icon icon-search"></i> </a></li>
	</ul>
	<ul class="menu__social-media">
${site.social.map((s) => `		<li><a href="${esc(s.href)}" target="_blank"><span class="icon ${esc(s.icon)}"></span></a></li>`).join('\n')}
	</ul>
	</menu>
${renderSubmenu(site.familyTypes)}
        <div class="search">
	<div class="search__head">
		<div class="container">
			<div class="search__field">
				<a class="js-search-close"><i class="icon icon-close"></i></a>
				<form action="/resultados" method="GET">
					<input class="input" type="text" placeholder="Buscar en el sitio" name="q">
					<button type="submit"><i class="icon icon-arrow-right"></i></button>
				</form>
			</div>
		</div>
	</div>
</div>`
}

function tabStyle(t: FamilyTypeView) {
  return `--category-text-color:${esc(t.textColor)};
					--underlined-text-color:${esc(t.underlineColor)};`
}

export function renderSubmenu(types: FamilyTypeView[]): string {
  const tabs = types
    .map((t, i) => `						<li class="tab ${i === 0 ? ' active ' : ''} ${t.textColor.toLowerCase() !== '#000000' ? 'custom-color' : ''}" style="${tabStyle(t)}">
				<a href="#submenu${i + 1}" data-toggle="tab">${esc(t.name)}</a>
			</li>
`)
    .join('')
  const panes = types
    .map((t, i) => `		<li class="tab-pane fade ${i === 0 ? ' in active ' : ''}" id="submenu${i + 1}">
			<div class="collapsible__body container-fluid">
								<div class="row row--flex">
${t.families
  .map((f) => `									<div class="col-md-4 family-wrap">
						<a  href="/autos/${esc(f.slug)}">
							<div class="family">
								<div class="family__img">
									<img src="${esc(f.menuImage)}" alt="Car" class="img-responsive">
								</div>
								<div class="family__text">
									<h3 class="title">
										${esc(f.name)}
									</h3>
${f.hidePrice ? '' : `																			<p>desde</p>
										<h4 class="title">$${money(f.startPrice)}</h4>
`}${f.fordPerformance ? `																			<img class="ford-p-img" src="/img/fordPerformance.png" alt="">
` : ''}																	</div>
								<i class="icon icon-arrow-right"></i>
							</div>
						</a>
					</div>
`)
  .join('')}								</div>
			</div>
${t.menuHtml ? t.menuHtml : ''}					</li>
`)
    .join('')
  return `<div class="submenu" id="subNuevos">
<div class="submenu__tabs">
	<div class="container">
		<div class="container margin--top margin--bottom">
			<h2 class="title">Vehículos</h2>
			<h1 class="title">nuevos</h1>
		</div>
		<ul class="tabs tabs-gray js-tabs-animate">
${tabs}					</ul>
	</div>
</div>
<ul class="collapsible tab-content">
    ${panes}	</ul>
</div>`
}
