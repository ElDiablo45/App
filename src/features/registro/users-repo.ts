import "server-only"
import { getServiceSupabase } from "@/lib/supabase/server"

export interface RegistroUser {
  discord_id: string
  email: string
  birth_date: string
  nationality?: string | null
  verified_at?: string | null
}

export async function getUserByDiscordId(discordId: string) {
  const sb = getServiceSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("users")
    .select("discord_id")
    .eq("discord_id", discordId)
    .maybeSingle()
  if (error) {
    console.warn("[users-repo] getUserByDiscordId failed", error.message)
    return null
  }
  return data
}

export async function upsertUser(input: RegistroUser) {
  const sb = getServiceSupabase()
  if (!sb) return { ok: false as const, error: "Supabase no configurado" }
  const { error } = await sb.from("users").upsert(
    {
      discord_id: input.discord_id,
      email: input.email,
      birth_date: input.birth_date,
      nationality: input.nationality ?? null,
      verified_at: input.verified_at ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "discord_id" },
  )
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
