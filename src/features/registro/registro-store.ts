import { validateRegistro } from "./registro-validation"

export const REGISTRO_COOKIE = "hh_registro"
export const REGISTRO_MAX_AGE = 28_800

export interface RegistroData {
  email: string
  birthDate: string
  nationality?: string
  completedAt: string
  discordId: string
}

function isValidData(value: unknown): value is RegistroData {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  if (typeof v.email !== "string" || typeof v.birthDate !== "string") return false
  if (typeof v.discordId !== "string" || !v.discordId) return false
  if (typeof v.completedAt !== "string" || !v.completedAt) return false
  if (v.nationality !== undefined && typeof v.nationality !== "string") return false
  const errors = validateRegistro({
    email: v.email,
    birthDate: v.birthDate,
    nationality: typeof v.nationality === "string" ? v.nationality : "",
  })
  return Object.keys(errors).length === 0
}

export function buildRegistroCookie(data: RegistroData): string {
  return JSON.stringify(data)
}

export function parseRegistroCookie(
  raw: string | null | undefined,
): RegistroData | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    return isValidData(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function isRegistroCompleteForDiscord(
  raw: string | null | undefined,
  discordId: string,
): boolean {
  const data = parseRegistroCookie(raw)
  return data?.discordId === discordId
}

// Server-only: lee la cookie en Server Components / Route Handlers.
// Se importa next/headers de forma diferida para no romper los tests unitarios.
export async function getServerRegistro(): Promise<RegistroData | null> {
  const { cookies } = await import("next/headers")
  const store = await cookies()
  return parseRegistroCookie(store.get(REGISTRO_COOKIE)?.value ?? null)
}
