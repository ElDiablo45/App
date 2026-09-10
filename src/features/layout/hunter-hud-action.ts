"use server"

import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { getHuntGuildMember } from "@/features/profile/discord-roles"
import { prestigeForRoles } from "@/features/profile/prestige"

/**
 * Nivel de prestigio del usuario actual según sus roles de Discord.
 * Falla cerrado (sin nivel) sin sesión, sin bot o sin roles.
 *
 * Se memoiza por request con `cache()` para que si la misma página
 * (p. ej. /perfil) ya pidió el miembro de Discord, no se repita el
 * fetch dentro del mismo render.
 */
export const getMyPrestige = cache(async function getMyPrestige(): Promise<{ ok: true; level?: number } | { ok: false }> {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) return { ok: false }

  const member = await getHuntGuildMember(profile)
  if (!member) return { ok: true, level: undefined }

  return { ok: true, level: prestigeForRoles(member.roles) }
})
