"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { toggleLike } from "./arsenal"

export async function toggleArsenalLike(loadoutId: string) {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) {
    return { ok: false as const, error: "Inicia sesión con Discord para votar." }
  }
  try {
    const result = await toggleLike(loadoutId, profile.id)
    revalidatePath("/arsenal")
    revalidatePath(`/arsenal/${loadoutId}`)
    return { ok: true as const, ...result }
  } catch {
    return { ok: false as const, error: "No se pudo registrar tu voto." }
  }
}
