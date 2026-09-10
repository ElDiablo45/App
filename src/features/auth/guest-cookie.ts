export const GUEST_COOKIE = "hh_guest"
export const GUEST_MAX_AGE = 28_800

export function isGuestCookie(
  raw: string | null | undefined,
): boolean {
  if (!raw) return false
  return raw
    .split(";")
    .some((part) => part.trim().startsWith(`${GUEST_COOKIE}=1`))
}

// Client-only: la cookie de invitado no es httpOnly (la pone login-panel
// con document.cookie), así que el propio navegador puede borrarla al salir.
export function clearGuestCookie(): void {
  if (typeof document === "undefined") return
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}
