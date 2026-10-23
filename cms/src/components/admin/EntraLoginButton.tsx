export function EntraLoginButton() {
  return (
    <div className="ford-entra-login">
      <a className="btn btn--style-primary" href="/api/auth/entra/login">
        Continuar con Microsoft Entra
      </a>
      <p>Usa tu cuenta corporativa autorizada para entrar al CMS de Ford.</p>
    </div>
  )
}
