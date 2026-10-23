import { A } from '@/components/ui/A'

/** Confirmación de envío de formularios de contacto (/contacto/gracias y variantes). */
export function Gracias() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="error__container">
        <div className="container">
          <div className="error__wrap text-center no_icon">
            <p>
              ¡Gracias! <span>Tu información fue enviada y pronto te contactaremos.</span>
            </p>
            <p>
              <small>El tiempo de respuesta aproximado es de 24 horas.</small>
            </p>
            <div className="error__btns">
              <A href="/" className="btn btn--primary">
                IR A PÁGINA DE INICIO
              </A>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
