import { getServiceSupabase } from "@/lib/supabase/server"
import { MOCK_LOADOUTS } from "./data"
import type { Loadout } from "./types"

export interface LoadoutRow {
  id: string
  owner_discord_id: string
  owner_name: string
  owner_avatar_url: string | null
  title: string
  description: string
  topics: string[]
  cover_url: string | null
  body: Record<string, unknown>
  rating_avg: number | string
  rating_count: number
  views: number
  created_at: string
  updated_at: string
}

export function mapRowToLoadout(row: LoadoutRow): Loadout {
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
  }
}

export async function getLoadouts(): Promise<Loadout[]> {
  try {
    const supabase = getServiceSupabase()
    if (!supabase) return MOCK_LOADOUTS
    const { data, error } = await supabase
      .from("loadouts")
      .select("*")
      .order("created_at", { ascending: false })
    if (error || !data) {
      console.warn("[equipo] supabase read failed, using mocks")
      return MOCK_LOADOUTS
    }
    return (data as LoadoutRow[]).map(mapRowToLoadout)
  } catch {
    console.warn("[equipo] supabase read failed, using mocks")
    return MOCK_LOADOUTS
  }
}
