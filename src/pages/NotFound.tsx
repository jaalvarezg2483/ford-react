import { A } from '@/components/ui/A'

/** Página no encontrada. Las rutas del sitio anterior ya están en React; lo que no existe es un 404. */
export function NotFound() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container margin--top margin--bottom text-center">
          <h1 className="title">Página no encontrada</h1>
          <p className="text--large">La página que busca no existe o fue movida.</p>
          <p className="margin--top">
            <A href="/" className="btn btn--primary">
              Ir al inicio
            </A>
          </p>
        </div>
      </div>
    </main>
  )
}
