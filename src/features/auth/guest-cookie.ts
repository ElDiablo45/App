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
