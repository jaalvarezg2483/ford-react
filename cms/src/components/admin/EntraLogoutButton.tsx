export function EntraLogoutButton() {
  return (
    <form action="/api/auth/entra/logout" method="post" className="ford-entra-logout">
      <button type="submit">Cerrar sesión de Microsoft Entra</button>
    </form>
  )
}
