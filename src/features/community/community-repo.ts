import "server-only"
import { getServiceSupabase } from "@/lib/supabase/server"

export interface CommunityStreamer {
  id: string
  displayName: string | null
  avatarUrl: string | null
  joinedAt: string | null
}

function sinceLabelFromJoinedAt(joinedAt: string | null): string {
  if (!joinedAt) return ""
  const diffDays = Math.floor((Date.now() - new Date(joinedAt).getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "hoy"
  if (diffDays === 1) return "1 día"
  return `${diffDays} días`
}

/**
 * Lee los streamers desde Supabase (0 llamadas a Discord).
 * Lleva caché en memoria de 5 min: cada roundtrip a Supabase cuesta
 * 0.5-1.8s desde nuestro entorno, así que solo se paga 1 vez cada 5 min
 * en vez de en cada carga del home. En tests se omite el caché.
 * Devuelve undefined si Supabase no está configurado o falla → el UI muestra vacío.
 */
const STREAMERS_TTL_MS = 5 * 60 * 1000
let streamersCache: { at: number; rows: CommunityStreamer[] } | null = null

export async function getStreamersFromDb(): Promise<CommunityStreamer[] | undefined> {
  if (process.env.NODE_ENV !== "test" && streamersCache && Date.now() - streamersCache.at < STREAMERS_TTL_MS) {
    return streamersCache.rows
  }
  const sb = getServiceSupabase()
  if (!sb) return undefined
  const { data, error } = await sb
    .from("community_member_roles")
    .select("discord_id, community_members!inner(display_name, avatar_url, joined_at), community_roles!inner(key)")
    .eq("community_roles.key", "streamer")
  if (error) {
    console.warn("[community-repo] getStreamersFromDb failed", error.message)
    return undefined
  }
  const rows = (data ?? []) as Array<{
    discord_id: string
    community_members:
      | { display_name: string | null; avatar_url: string | null; joined_at: string | null }
      | Array<{ display_name: string | null; avatar_url: string | null; joined_at: string | null }>
      | null
    community_roles: { key: string } | Array<{ key: string }> | null
  }>
  const one = <T>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)
  const streamers = rows.map((r) => {
    const m = one(r.community_members)
    return {
      id: r.discord_id,
      displayName: m?.display_name ?? null,
      avatarUrl: m?.avatar_url ?? null,
      joinedAt: m?.joined_at ?? null,
    }
  })
  if (process.env.NODE_ENV !== "test") {
    streamersCache = { at: Date.now(), rows: streamers }
  }
  return streamers
}

export interface CommunityMemberUpsert {
  discord_id: string
  display_name?: string | null
  avatar_url?: string | null
  nick?: string | null
  joined_at?: string | null
  /** IDs de rol de Discord (solo se concilian staff/streamer conocidos). */
  role_ids?: string[]
}

/**
 * Inserta/actualiza el cache visible del miembro y reconcilia sus roles
 * staff/streamer. Nunca lanza: devuelve ok:false ante cualquier fallo.
 */
export async function upsertCommunityMember(input: CommunityMemberUpsert) {
  const sb = getServiceSupabase()
  if (!sb) return { ok: false as const, error: "Supabase no configurado" }
  const now = new Date().toISOString()
  const { error: memberError } = await sb.from("community_members").upsert(
    {
      discord_id: input.discord_id,
      display_name: input.display_name ?? null,
      avatar_url: input.avatar_url ?? null,
      nick: input.nick ?? null,
      joined_at: input.joined_at ?? null,
      synced_at: now,
      updated_at: now,
    },
    { onConflict: "discord_id" },
  )
  if (memberError) return { ok: false as const, error: memberError.message }

  if (!input.role_ids) return { ok: true as const }

  const { data: knownRoles, error: rolesError } = await sb.from("community_roles").select("role_id")
  if (rolesError) return { ok: false as const, error: rolesError.message }
  const known = new Set((knownRoles ?? []).map((r) => r.role_id as string))
  const wanted = input.role_ids.filter((id) => known.has(id))

  const { data: current, error: currentError } = await sb
    .from("community_member_roles")
    .select("role_id")
    .eq("discord_id", input.discord_id)
  if (currentError) return { ok: false as const, error: currentError.message }
  const have = new Set((current ?? []).map((r) => r.role_id as string))

  const toAdd = wanted.filter((id) => !have.has(id))
  const toRemove = [...have].filter((id) => !wanted.includes(id))

  if (toAdd.length > 0) {
    const { error } = await sb
      .from("community_member_roles")
      .insert(toAdd.map((role_id) => ({ discord_id: input.discord_id, role_id })))
    if (error) return { ok: false as const, error: error.message }
  }
  if (toRemove.length > 0) {
    const { error } = await sb
      .from("community_member_roles")
      .delete()
      .eq("discord_id", input.discord_id)
      .in("role_id", toRemove)
    if (error) return { ok: false as const, error: error.message }
  }
  return { ok: true as const }
}

export { sinceLabelFromJoinedAt }
