"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { validateRegistro } from "./registro-validation"
import { grantVerifiedRole } from "./verified-role"
import {
  REGISTRO_COOKIE,
  REGISTRO_MAX_AGE,
  buildRegistroCookie,
} from "./registro-store"

interface CompletarInput {
  email: string
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

  const email = input.email.trim()
  const birthDate = input.birthDate.trim()
  const nationality = (input.nationality ?? "").trim()

  const errors = validateRegistro({ email, birthDate, nationality })
  if (Object.keys(errors).length > 0) {
    return { ok: false as const, errors }
  }

  // El rol verificado no bloquea el registro: si Discord falla, la medalla
  // aparece cuando el bot lea los roles. El fallo queda en el log.
  if (!(await grantVerifiedRole(profile.id))) {
    console.warn("[registro] verified role grant failed for", profile.id)
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
