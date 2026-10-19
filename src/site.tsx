import { useMemo, useState, type FormEvent } from 'react'

type Vehicle = { name: string; price: string; href: string; image: string; group: string }
const ford = (file: string) => `https://www.ford.cr/uploads/family/${file}`
const vehicles: Vehicle[] = [
  { name: 'Ford Ranger XLT', price: 'desde $57.990', href: '/autos/ranger-xlt', image: ford('697e02a9d9b1fdfb90b904b83e49bf22af4405ee.png'), group: 'Pickups' },
  { name: 'Ford Ranger XL', price: 'desde $52.990', href: '/autos/rangerxl', image: ford('e593c429c6230d04cd777650be148ac27d3d8f26.png'), group: 'Pickups' },
  { name: 'Ford Ranger WILDTRAK', price: 'desde $78.990', href: '/autos/ranger-wildtrak', image: ford('9d2e3d767c401db45cf55b032e227afc48e2a80d.png'), group: 'Pickups' },
  { name: 'Ford Ranger Raptor', price: 'desde $98.990', href: '/autos/ranger-raptor', image: ford('f6ba5ce3d3ed9deedf2040a80f5e57c2fc3587cc.png'), group: 'Pickups' },
  { name: 'Ford Territory', price: 'desde $45.990', href: '/autos/territory', image: ford('da5fe965fbd3120f01aa078d5dfb11970b67aad5.png'), group: 'SUVs & Crossovers' },
  { name: 'Ford Everest', price: 'desde $76.990', href: '/autos/everest', image: ford('21ce9fc0b1bff7103c77513dc82267aec96ff9a3.png'), group: 'SUVs & Crossovers' },
  { name: 'Ford Explorer', price: 'desde $89.990', href: '/autos/explorer', image: ford('3abeead99a70c23b6719b1d1930ef20958f75aa8.png'), group: 'SUVs & Crossovers' },
  { name: 'Ford MUSTANG GT', price: 'desde $99.990', href: '/autos/mustang', image: ford('f75603f066149cdb4a5024c88ae1dd64e5186d7c.png'), group: 'Automóviles' },
]
const heroSlides = [
  'https://www.ford.cr/uploads/slides/57f25c074653141ef79021b5e8131426ebfe337b.png',
  'https://www.ford.cr/uploads/slides/5d00c1908cc98657893b32d441040039abe52a3d.png',
  'https://www.ford.cr/uploads/slides/57758f579bc1cd3228139d44d9a910616a8c933e.png',
  'https://www.ford.cr/uploads/slides/9649984676a75d17a8e647f97bf32a87a368afe1.png',
  'https://www.ford.cr/uploads/slides/f9e04c2084dd0ec4c079027567be8ca78d5a3c6a.png',
  'https://www.ford.cr/uploads/slides/bebd1b20c4868bc62af043e85a51a0feb8c54679.jpeg',
  'https://www.ford.cr/uploads/slides/93bc456741eb8ac8937eee2524fa07197ad3c74b.png',
]
const categories = ['Pickups', 'SUVs & Crossovers', 'Automóviles', 'Ford Performance']
const services = [
  ['Test Drive', 'Conocé tu próximo Ford en el camino.', '/solicitar-test-drive', '↗'],
  ['Citas de Taller en Línea', 'Agendá el mantenimiento de tu Ford.', '/citas', '◷'],
  ['Comparador de vehículos', 'Compará entre todas nuestras opciones.', '/comparador', '⇄'],
  ['Catálogo Accesorios', 'Personalizá tu Ford con accesorios originales.', '/documents/CATALOGO%20DE%20ACCESORIOS%20FORD%202026.pdf', '＋'],
  ['Seguros', 'Encontrá la protección que necesitás.', '/seguros', '◇'],
]
const articles = [
  ['Comprá tu Ford nuevo en el evento de cierre Purdython 2026', 'Grupo Purdy Motor'],
  ['¿Qué híbrido elegir? Conocé sus principales diferencias', 'Industria'],
  ['Aprovechá la Purdython 2026 con Ford', 'Poder Ford'],
]

function Header() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [query, setQuery] = useState('')
  const result = useMemo(() => vehicles.filter(v => `${v.name} ${v.group}`.toLowerCase().includes(query.toLowerCase())), [query])
  return <header className="site-header">
    <a className="brand" href="/" aria-label="Ford Costa Rica"><img src="/brand/ford.svg" alt="Ford" /></a>
    <nav className="main-nav" aria-label="Navegación principal">
      <a className="active" href="/">Inicio</a>
      <button className={open ? 'nav-trigger selected' : 'nav-trigger'} onClick={() => setOpen(!open)} aria-expanded={open}>Vehículos nuevos <span className="chevron">⌄</span></button>
      <a href="/servicios">Servicios</a><a href="/citas">Citas Taller</a><a href="/blog">Blog</a><a href="/contacto">Contactanos</a>
    </nav>
    <div className="header-actions"><a href="/herramientas-de-compra"><span className="action-icon">＄</span><span>Herramientas de<br />compra</span></a><a href="/calcular"><span className="action-icon">▦</span><span>Calcular<br />Financiamiento</span></a><button aria-label="Buscar" onClick={() => setSearch(!search)} className="search-trigger">⌕</button></div>
    <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Abrir menú">☰</button>
    {open && <div className="vehicle-menu"><div className="vehicle-menu-heading"><span>Vehículos</span><b>nuevos</b></div><div className="vehicle-menu-cats">{categories.map((c, i) => <a href={`#category-${i}`} key={c}>{c}</a>)}</div><div className="vehicle-menu-list">{vehicles.slice(0, 4).map(v => <a href={v.href} key={v.name}><img src={v.image} alt=""/><span>{v.name} <small>{v.price}</small></span><b>›</b></a>)}</div></div>}
    {search && <form className="search-panel" onSubmit={e => {e.preventDefault(); if (result[0]) location.href = result[0].href}}><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en el sitio" aria-label="Buscar en el sitio"/><button>Buscar</button>{query && <div className="search-results">{result.slice(0,4).map(v=><a key={v.name} href={v.href}>{v.name}</a>)}</div>}</form>}
  </header>
}

function Hero() {
  const [current, setCurrent] = useState(0)
  return <section className="hero" aria-label="Promociones Ford">
    <img className="hero-image" src={heroSlides[current]} alt={`Promoción Ford Costa Rica, banner ${current + 1}`} />
    <div className="hero-shade" />
    <a className="hero-link" href="/promociones" aria-label="Ver promociones actuales" />
    <div className="hero-controls"><button onClick={() => setCurrent((current + 6) % 7)} aria-label="Banner anterior">‹</button><div className="hero-dots">{Array.from({length:7}, (_,i)=><button key={i} className={i===current?'current':''} aria-label={`Banner ${i+1}`} onClick={()=>setCurrent(i)} />)}</div><button onClick={() => setCurrent((current + 1) % 7)} aria-label="Banner siguiente">›</button></div>
  </section>
}

function Models() {
  const [category, setCategory] = useState('Pickups')
  const [offset, setOffset] = useState(0)
  const items = vehicles.filter(v => v.group === category || (category === 'Ford Performance' && /Raptor|MUSTANG/.test(v.name)))
  const visible = [...items.slice(offset), ...items.slice(0,offset)].slice(0,4)
  return <section className="models section" id="vehiculos"><div className="section-heading"><p className="eyebrow">FORD COSTA RICA</p><h1>Vehículos Nuevos</h1></div>
    <div className="tabs" role="tablist">{categories.map((c,i)=><button id={`category-${i}`} role="tab" aria-selected={category===c} className={category===c?'selected':''} key={c} onClick={()=>{setCategory(c);setOffset(0)}}>{c}</button>)}</div>
    <div className="model-carousel"><button className="round-arrow left" onClick={()=>setOffset((offset+items.length-1)%items.length)} aria-label="Anterior">‹</button><div className="model-grid">{visible.map(v=><a className="model-card" href={v.href} key={v.name}><div className="model-image"><img src={v.image} alt={v.name}/></div><div className="model-copy"><span>{v.name}</span><b>{v.price}</b><span className="more-link">Ver más <i>›</i></span></div></a>)}</div><button className="round-arrow right" onClick={()=>setOffset((offset+1)%items.length)} aria-label="Siguiente">›</button></div>
    <a className="text-cta" href="/vehiculos">Ver todos los vehículos <span>→</span></a>
  </section>
}

function ContactForm() {
  const [state, setState] = useState('idle')
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setState('sending')
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    const body = Object.fromEntries(form.entries())
    try {
      const response = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      if (!response.ok) throw new Error('contact failed')
      setState('sent'); formElement.reset()
    } catch { setState('error') }
  }
  return <form className="contact-form" onSubmit={submit}>
    <label>Área o Departamento *<select name="department" required defaultValue=""><option value="" disabled>Seleccioná una opción</option><option>Ventas nuevos</option><option>Citas taller</option><option>Repuestos</option><option>Seguros</option></select></label>
    <label>Sucursal<select name="branch" defaultValue=""><option value="">Seleccioná una sucursal</option><option>Aleste</option><option>Escazú</option><option>La Uruca</option><option>Liberia</option></select></label>
    <div className="form-row"><label>Nombre *<input name="firstName" placeholder="Juan" required/></label><label>Apellidos *<input name="lastName" placeholder="Rodríguez" required/></label></div>
    <div className="form-row"><label>Correo electrónico *<input name="email" type="email" placeholder="ejemplo@mail.com" required/></label><label>Número telefónico *<input name="phone" type="tel" placeholder="88888888" required/></label></div>
    <label>Número de Placa<input name="plate" placeholder="ABC123"/></label><label>Mensaje *<textarea name="message" rows={4} required/></label>
    <button className="button button-blue" disabled={state==='sending'}>{state==='sending'?'Enviando…':'Enviar Mensaje'}</button>
    {state==='sent'&&<p className="form-success" role="status">Recibimos tu mensaje. Gracias por contactar a Ford.</p>}{state==='error'&&<p className="form-error" role="alert">No se pudo enviar el mensaje. Intentá de nuevo.</p>}
  </form>
}

export function FordHome() {
  return <><Header/><main>
    <Hero/><Models/>
    <section className="services-section section"><div className="section-heading"><p className="eyebrow">PARA SEGUIR ADELANTE</p><h2>Servicios</h2><p>Somos los distribuidores exclusivos para Ford Costa Rica. Nuestros talleres cuentan con tecnología, herramientas y capacidad para darle el mejor mantenimiento a tu FORD.</p></div><div className="service-grid">{services.map(([title,copy,href,icon])=><a href={href} className="service-card" key={title}><span className="service-icon">{icon}</span><h3>{title}</h3><p>{copy}</p><span className="service-more">Ver más&nbsp; ›</span></a>)}</div></section>
    <section className="technology section"><div className="tech-intro"><p className="eyebrow">INNOVACIÓN FORD</p><h2>Tecnología</h2><p>La innovación forma parte del ADN de Ford. Continuamente ampliamos las fronteras de la innovación y las posibilidades para llevar tu experiencia de conducción a otro nivel.</p><a className="text-cta" href="/tecnologia">Conocé más <span>→</span></a></div><div className="tech-cards"><article><div className="tech-image sync"><span>SYNC<sup>®</sup></span></div><div><h3>SYNC®</h3><p>Conectate, orientate y disfrutá el camino sin quitar las manos del volante.</p></div></article><article><div className="tech-image copilot"><span>FORD<br/>Co-Pilot360<sup>™</sup></span></div><div><h3>CoPilot 360</h3><p>Tecnologías inteligentes para darte más confianza en la carretera.</p></div></article><article><div className="tech-image ecoboost"><span>EcoBoost<sup>®</sup></span></div><div><h3>EcoBoost®</h3><p>Potencia y eficiencia para cada recorrido.</p></div></article></div></section>
    <section className="shopping-tools"><div className="tool-panel finance"><div className="tool-icon">▦</div><div><p className="eyebrow">FÁCIL Y RÁPIDO</p><h2>Calculá tu<br/><b>financiamiento</b></h2><p>Cotizar tu FORD es muy fácil. Elegí el modelo y extras y obtené un estimado de la cuota.</p><a className="button button-white" href="/calcular">Calcular <span>›</span></a></div></div><div className="tool-panel compare"><div className="tool-icon">⇄</div><div><p className="eyebrow">ENCONTRÁ TU FORD</p><h2>Compará<br/><b>vehículos</b></h2><p>Conocé las diferencias entre todas nuestras opciones y elegí la que va con vos.</p><a className="button button-white" href="/comparador">Comparar <span>›</span></a></div></div></section>
    <section className="news-section section"><div className="news-title"><div><p className="eyebrow">HISTORIAS QUE NOS MUEVEN</p><h2>Noticias recientes <b>FORD</b></h2></div><a className="text-cta" href="/blog">Ir a blog <span>→</span></a></div><div className="news-grid">{articles.map(([title,cat],i)=><a className={`news-card news-${i+1}`} href="/blog" key={title}><div className="news-art"><span>FORD</span><b>{cat}</b></div><div className="news-copy"><p>{cat}</p><h3>{title}</h3><span>Ver más&nbsp; ›</span></div></a>)}</div></section>
    <section className="contact-section" id="contacto"><div className="contact-aside"><p className="eyebrow">FORD COSTA RICA</p><h2>Contactanos</h2><p>Para nosotros vos siempre estás primero.</p><div className="contact-detail"><b>Ventas nuevos y citas taller</b><a href="tel:+50625197777">(506) 2519-7777</a></div><div className="contact-detail"><b>Repuestos</b><a href="tel:+50624597615">(506) 2459-7615</a></div><div className="contact-detail"><b>Correo electrónico</b><a href="mailto:info@ford.cr">Contactanos por correo</a></div></div><div className="contact-main"><h3>¿Tenés alguna duda o consulta?</h3><p className="form-hint">* Campos obligatorios</p><ContactForm/></div></section>
    <section className="purdygo"><div className="purdygo-mark">P</div><div><p className="eyebrow">TU NUEVA CONEXIÓN CON PURDY</p><h2>Todo Purdy en un solo lugar</h2><p>Ver tu historial, agendar citas de taller y más.</p><a className="button button-white" href="https://purdygo.com/#/register">¡REGISTRATE YA! <span>→</span></a><div className="store-links"><a href="https://apps.apple.com/us/app/purdygo/id1536614177">App Store</a><a href="https://play.google.com/store/apps/details?id=com.purdymo.PurdyGo">Google Play</a></div></div><div className="phone-art">PURDY<br/><b>GO</b></div></section>
  </main><Footer/><a className="whatsapp" href="https://api.whatsapp.com/send?phone=50685891000&text=Quiero%20informaci%C3%B3n%20de%20Ford" aria-label="Escribir por WhatsApp">◉</a></>
}

function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div className="footer-brand"><img src="/brand/ford.svg" alt="Ford"/><p>Ford Costa Rica, con el respaldo de Grupo Purdy.</p><div className="socials"><a href="https://www.facebook.com/FordCostaRica">f</a><a href="https://www.youtube.com/channel/UC9dvZm4Gt1ggI428hfulSDQ">▶</a><a href="https://www.instagram.com/fordcostarica/">◎</a><a href="https://www.tiktok.com/@fordcostarica">♪</a></div></div><div className="footer-links"><h3>Vehículos</h3><a href="/autos">Vehículos nuevos</a><a href="/sobre-nosotros">Sobre Nosotros</a><a href="/herramientas-de-compra">Herramientas de compra</a><a href="/servicios">Servicios</a></div><div className="footer-links"><h3>Descubrí Ford</h3><a href="/videos">Videos</a><a href="/contacto">Contactanos</a><a href="/tecnologia">Seguridad y Tecnología</a><a href="https://purdyusados.com/">Vehículos usados</a></div><div className="footer-links"><h3>Estamos para ayudarte</h3><a href="/sucursales">Sucursales</a><a href="/talleres">Talleres</a><a href="/citas">Citas de taller</a><a href="/blog">Noticias</a></div></div><div className="ethics">La Línea Ética es un espacio seguro y confidencial para reportar, de forma anónima, actos deshonestos o violaciones a las políticas internas y normas de conducta. <a href="https://grupopurdy.com/linea-etica">Info Aquí</a></div><div className="footer-bottom"><span>©2026 All rights reserved</span><div><a href="https://grupopurdy.com/linea-etica">Línea Ética</a><a href="/reglamentos">Reglamentos</a><a href="/article/terminos-condiciones">Términos y condiciones</a><a href="/documents/politica-de-cookies.pdf">Cookies</a><a href="/sitemap">Mapa</a></div></div></footer>
}
