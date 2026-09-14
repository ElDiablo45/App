"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { validateRegistro } from "./registro-validation"
import { grantVerifiedRole } from "./verified-role"
import { upsertUser } from "./users-repo"
import {
  REGISTRO_COOKIE,
  REGISTRO_MAX_AGE,
  buildRegistroCookie,
} from "./registro-store"

interface CompletarInput {
  birthDate: string
  nationality?: string
  discordId: string
}

export async function completarRegistro(input: CompletarInput) {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile || profile.id !== input.discordId) {
    return { ok: false as const, error: "Sesión no válida. Vuelve a iniciar sesión con Discord." }
  }

  // El email es el de Discord y no se puede cambiar: se ignora cualquier
  // valor del cliente para evitar registros manipulados.
  const email = (
    (session?.user?.email as string | null) ??
    profile.email ??
    ""
  ).trim()
  if (!email) {
    return { ok: false as const, error: "Añade y verifica un email en Discord para completar el registro." }
  }

  const birthDate = input.birthDate.trim()
  const nationality = (input.nationality ?? "").trim()

  const errors = validateRegistro({ email, birthDate, nationality })
  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors }
  }

  // El rol verificado no bloquea el registro: si Discord falla, la medalla
  // aparece cuando el bot lea los roles. El fallo queda en el log y
  // verified_at queda null (pendiente).
  const roleGranted = await grantVerifiedRole(profile.id)
  if (!roleGranted) {
    console.warn("[registro] verified role grant failed for", profile.id)
  }

  // Sincroniza el cache visible (display/roles staff-streamer) con 1 fetch
  // Bot pequeño. Fire-and-forget: nunca bloquea el registro.
  void import("@/features/community/discord-member-sync")
    .then((m) =>
      m.syncCommunityMember(profile.id, {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      }),
    )
    .catch(() => {})

  // Persistencia real: si Supabase falla, bloqueamos para no perder el registro.
  const persisted = await upsertUser({
    discord_id: profile.id,
    email,
    birth_date: birthDate,
    nationality: nationality || null,
    verified_at: roleGranted ? new Date().toISOString() : null,
  })
  if (!persisted.ok) {
    console.warn("[registro] supabase upsert failed for", profile.id, persisted.error)
    return { ok: false as const, error: "No se pudo guardar tu registro. Inténtalo de nuevo." }
  }

  const { cookies } = await import("next/headers")
  const store = await cookies()
  store.set(
    REGISTRO_COOKIE,
    buildRegistroCookie({
      email,
      birthDate,
      nationality: nationality || undefined,
      completedAt: new Date().toISOString(),
      discordId: profile.id,
    }),
    {
      httpOnly: true,
      maxAge: REGISTRO_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  )

  return { ok: true as const }
}
