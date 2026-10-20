/** Modal de confirmación de los formularios del CMS (Snippets/contact-form.html.twig). */
export function snippetModal(req: Request): { html: string } | null {
  const m = /(?:^|;\s*)snippet_sended=([01])/.exec(req.headers.get('cookie') || '')
  if (!m) return null
  const ok = m[1] === '1'
  return {
    html: `
            <div class="modal fade in show" id="modal-success">
                <div class="modal-dialog" role="document">
                    <button type="button" class="modal__close close-modal-success" data-dismiss="modal"> <i class="icon icon-close"></i> </button>
                    <div class="modal-content text-center padding-2">
                        <h3 class="text--bold text--primary">${ok ? 'SU mensaje se ha enviado con éxito' : 'Ha ocurrido un error al enviar su mensaje'}</h3>
                        <p>${ok ? 'Pronto nos pondremos en contacto con usted' : 'Por favor intente más tarde'}</p>
                        <div>
                            <button class="btn btn--primary close-modal-success" data-dismiss="modal">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
    <script type="text/javascript">
     document.addEventListener('DOMContentLoaded', function () { $('body').on('click', '.close-modal-success', function(){ $('#modal-success').removeClass('in show'); }) })
    </script>
`,
  }
}
