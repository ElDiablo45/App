import { getServiceSupabase } from "@/lib/supabase/server"
import { MOCK_LOADOUTS } from "../equipo/data"
import type { LoadoutRow } from "../equipo/loadouts"
import type { ArsenalItem, ArsenalSort } from "./types"

export { filterArsenalItems, sortArsenalItems } from "./arsenal-filter"

export interface ArsenalRow extends LoadoutRow {
  like_count?: number | string | null
  armas_slugs?: string[] | null
}

export function mapRowToArsenalItem(row: ArsenalRow): ArsenalItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    topics: row.topics ?? [],
    authorName: row.owner_name,
    authorAvatarUrl: row.owner_avatar_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    views: row.views ?? 0,
    createdAt: row.created_at,
    likeCount:
      row.like_count === undefined || row.like_count === null
        ? (row.rating_count ?? 0)
        : Number(row.like_count),
    armasSlugs: row.armas_slugs ?? [],
  }
}

function mockToArsenalItem(l: (typeof MOCK_LOADOUTS)[number]): ArsenalItem {
  return { ...l, likeCount: l.ratingCount, armasSlugs: [] }
}

const SORT_COLUMN: Record<ArsenalSort, string> = {
  popular: "like_count",
  top: "like_count",
  latest: "created_at",
}

export async function getArsenalItems(sort: ArsenalSort): Promise<ArsenalItem[]> {
  try {
    const supabase = getServiceSupabase()
    if (!supabase) return MOCK_LOADOUTS.map(mockToArsenalItem)
    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .order(SORT_COLUMN[sort], { ascending: false })
    if (error || !data) {
      console.warn("[arsenal] supabase read failed, using mocks")
      return MOCK_LOADOUTS.map(mockToArsenalItem)
    }
    return (data as ArsenalRow[]).map(mapRowToArsenalItem)
  } catch {
    console.warn("[arsenal] supabase read failed, using mocks")
    return MOCK_LOADOUTS.map(mockToArsenalItem)
  }
}

export async function toggleLike(
  loadoutId: string,
  discordId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const supabase = getServiceSupabase()
  if (!supabase) throw new Error("[arsenal] supabase no configurado")
  const likes = supabase.from("loadout_likes")
  const { data: existing, error: readError } = await likes
    .select("loadout_id")
    .eq("loadout_id", loadoutId)
    .eq("discord_id", discordId)
    .maybeSingle()
  if (readError) throw new Error(`[arsenal] toggleLike read failed: ${readError.message}`)
  if (existing) {
    const { error } = await likes
      .delete()
      .eq("loadout_id", loadoutId)
      .eq("discord_id", discordId)
    if (error) throw new Error(`[arsenal] toggleLike delete failed: ${error.message}`)
  } else {
    const { error } = await likes.insert({
      loadout_id: loadoutId,
      discord_id: discordId,
    })
    if (error) throw new Error(`[arsenal] toggleLike insert failed: ${error.message}`)
  }
  const { data: row } = await supabase
    .from("loadouts")
    .select("like_count")
    .eq("id", loadoutId)
    .single()
  const likeCount = Number(
    (row as { like_count?: number | string | null } | null)?.like_count ?? 0,
  )
  return { liked: !existing, likeCount }
}

export async function incrementView(loadoutId: string): Promise<void> {
  try {
    const supabase = getServiceSupabase()
    if (!supabase) return
    const { data } = await supabase
      .from("loadouts")
      .select("views")
      .eq("id", loadoutId)
      .single()
    const views = Number(
      (data as { views?: number | null } | null)?.views ?? 0,
    )
    await supabase.from("loadouts").update({ views: views + 1 }).eq("id", loadoutId)
  } catch {
    // Contador no crítico: nunca rompe la página.
  }
}
