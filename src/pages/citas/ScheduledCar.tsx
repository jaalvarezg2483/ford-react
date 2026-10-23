export function ScheduledCar() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="wrapper citas-toyota">
        <section className="citas-select">
          <p>
            Hola <span className="uppercase">NOMBRE CLIENTE</span>
          </p>
          <p>Ya tienes una cita de mantenimiento agendada para:</p>
          <form className="cards-select-vehicle">
            <div className="select-card icon-car">
              <h6>PRIUS</h6>
              <span>HIBRIDO 1.8L TA 2015</span>
              <span>Placa: TSJ6423</span>
              <article className="info-schedule">
                <span className="bold">CITA EN TALLER</span>
                <span>Jueves 20 de Noviembre 2017</span>
                <span>Hora: 2:45 P.M.</span>
              </article>
              <a className="edit-selection">EDITAR</a>
            </div>
            <button type="button" className="btn btn-transp-red">
              CANCELAR CITA
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
