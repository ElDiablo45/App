"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { getFreshRoleIds } from "@/features/profile/discord-roles"

const ROLES_BASELINE_COOKIE = "hh_roles"
const ROLES_MAX_AGE = 28_800

/**
 * Purga la caché de datos de la página actual (roles, mensajes, miembros…)
 * para que el siguiente render lea Discord de nuevo. Solo rutas internas.
 */
export async function revalidateCurrentPage(path: string) {
  if (!path.startsWith("/") || path.includes("://")) {
    return { ok: false as const }
  }
  revalidatePath(path)
  return { ok: true as const }
}

function isInternalPath(path: string) {
  return path.startsWith("/") && !path.includes("://")
}

function sameIdSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  const set = new Set(a)
  return b.every((id) => set.has(id))
}

function parseBaseline(raw: string | null | undefined): { discordId: string; ids: string[] } | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const { discordId, ids } = parsed as { discordId?: unknown; ids?: unknown }
    if (typeof discordId !== "string" || !Array.isArray(ids) || !ids.every((i) => typeof i === "string")) {
      return null
    }
    return { discordId, ids }
  } catch {
    return null
  }
}

/**
 * Sincroniza los roles de Discord del usuario actual: compara la lectura
 * fresca con la última conocida (cookie) y revalida la página.
 * Devuelve si hubo cambios. Falla cerrado sin sesión, sin bot o ruta externa.
 */
export async function syncRoles(path: string) {
  if (!isInternalPath(path)) {
    return { ok: false as const }
  }

  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) {
    return { ok: false as const }
  }

  const fresh = await getFreshRoleIds(profile.id)
  if (!fresh) {
    return { ok: false as const }
  }

  const { cookies } = await import("next/headers")
  const store = await cookies()
  const baseline = parseBaseline(store.get(ROLES_BASELINE_COOKIE)?.value ?? null)

  // Primera sincronización: establece la base en silencio.
  const known = baseline !== null && baseline.discordId === profile.id
  const changed = known && !sameIdSet(baseline.ids, fresh)

  store.set(
    ROLES_BASELINE_COOKIE,
    JSON.stringify({ discordId: profile.id, ids: fresh }),
    {
      httpOnly: true,
      maxAge: ROLES_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  )

  await revalidateCurrentPage(path)
  return { ok: true as const, changed }
}
