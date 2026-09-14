import { getStreamersFromDb, sinceLabelFromJoinedAt } from "@/features/community/community-repo"

export interface StreamerMember {
  id: string
  name: string
  avatarUrl: string
  sinceLabel: string
}

/**
 * Streamers de la comunidad desde Supabase (0 llamadas a Discord).
 * La tabla community_members se rellena al autorizar (login) y al
 * completar el registro; el home solo lee la DB.
 * Devuelve undefined si no hay datos o falla → el UI muestra vacío.
 */
export async function getStreamerMembers(): Promise<StreamerMember[] | undefined> {
  const rows = await getStreamersFromDb()
  if (!rows || rows.length === 0) return undefined
  return rows
    .filter((r) => r.displayName)
    .map((r) => ({
      id: r.id,
      name: r.displayName as string,
      avatarUrl:
        r.avatarUrl ?? `https://cdn.discordapp.com/embed/avatars/${[...r.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 5}.png`,
      sinceLabel: sinceLabelFromJoinedAt(r.joinedAt),
    }))
}
