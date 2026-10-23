import { A } from '@/components/ui/A'
import { VehiclePicker } from '@/components/calculator/VehiclePicker'

/** /accesorios: elegir familia, igual que accessorySelectVehicle del sitio anterior. */
export function AccesoriosIndex() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper">
        <div className="container container--breadcrumb">
          <ol className="breadcrumb">
            <li>
              <i className="icon icon-arrow-chevron-left breadcrumb-back" />
            </li>
            <li>
              <A href="/">Inicio</A>
            </li>
            <li>Elegir Modelo</li>
          </ol>
        </div>
        <div className="container">
          <h2 className="title text-center">Accesorios</h2>
          <p className="text text-center">Elegí el modelo para ver los accesorios</p>
        </div>
        <div className="container container--full-mobile">
          <section className="section">
            <VehiclePicker linkBase="/accesorios/" />
          </section>
        </div>
      </div>
    </main>
  )
}
