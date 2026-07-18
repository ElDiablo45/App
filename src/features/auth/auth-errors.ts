const authErrorMessages: Record<string, string> = {
  AccessDenied: "Has cancelado o rechazado el acceso con Discord.",
  OAuthCallback:
    "Discord no pudo completar el inicio de sesión. Inténtalo de nuevo.",
}

export function getAuthErrorMessage(code?: string) {
  if (!code) {
    return undefined
  }

  return (
    authErrorMessages[code] ??
    "No se pudo iniciar sesión con Discord. Inténtalo de nuevo."
  )
}
