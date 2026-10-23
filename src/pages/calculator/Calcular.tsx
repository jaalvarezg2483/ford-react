import { A } from '@/components/ui/A'
import { CalculateNav } from '@/components/calculator/CalculateNav'
import { VehiclePicker } from '@/components/calculator/VehiclePicker'

type Props = { mode?: 'calcular' | 'preaprobador' }

/** Intro de calculadora o preaprobador: texto, pasos y selector de familia. */
export function Calcular({ mode = 'calcular' }: Props) {
  const pre = mode === 'preaprobador'
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper wrapper-accesories">
        <div className="calculate--cancel bg--accent-light">
          <div className="container">
            <A className="btn btn--clear" href="/">
              <i className="icon icon-arrow-left" /> Atrás
            </A>
          </div>
        </div>
        <div className="container">
          <div className="margin--top">
            {pre ? <h1 className="title text-center">Pre Aprobación de Crédito</h1> : <h2 className="title">Calcular Financiamiento</h2>}
          </div>
          {pre ? null : (
            <>
              <div className="text margin--top margin--bottom">
                <p>
                  Encontrá el Ford ideal para vos. Primero seleccioná el modelo que más te interesa y personalizalo con los accesorios que prefirás.
                  <br />
                  Luego, utilizá nuestra herramienta de cálculo de financiamiento para conocer las opciones disponibles y elegir la que mejor se adapte a tus necesidades. En solo tres
                  pasos podés configurar tu vehículo y explorar las diferentes alternativas de financiamiento para hacer realidad tu nuevo Ford.
                </p>
              </div>
              <CalculateNav step={1} />
            </>
          )}
        </div>
        <div className="container">
          <VehiclePicker
            linkBase={pre ? '/preaprobador/' : '/autos/'}
            columns={3}
            hrefFor={(slug) => (pre ? `/preaprobador/${slug}/modelos` : `/autos/${slug}/modelos`)}
          />
        </div>
      </div>
    </main>
  )
}
