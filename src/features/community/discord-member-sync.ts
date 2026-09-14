import "server-only"
import { upsertCommunityMember } from "./community-repo"

interface BotGuildMember {
  nick: string | null
  joined_at: string
  roles: string[]
}

/**
 * Lee el miembro del servidor vía Bot (1 fetch pequeño por usuario).
 * Devuelve null sin configuración o ante cualquier fallo. Nunca lanza.
 */
export async function fetchGuildMemberForSync(discordId: string): Promise<BotGuildMember | null> {
  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()
  if (!guildId || !botToken) return null
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return (await res.json()) as BotGuildMember
  } catch {
    return null
  }
}

export interface SyncIdentity {
  displayName?: string | null
  avatarUrl?: string | null
}

/**
 * Sincroniza el cache visible del miembro + sus roles staff/streamer.
 * Fire-and-forget: nunca lanza ni bloquea al llamador ante fallos.
 * community_members no tiene columnas not null problemáticas, así que el
 * upsert es seguro tanto en login (fila aún sin registro) como en registro.
 */
export async function syncCommunityMember(discordId: string, identity: SyncIdentity = {}): Promise<void> {
  try {
    const member = await fetchGuildMemberForSync(discordId)
    if (!member) return
    await upsertCommunityMember({
      discord_id: discordId,
      display_name: identity.displayName ?? null,
      avatar_url: identity.avatarUrl ?? null,
      nick: member.nick,
      joined_at: member.joined_at,
      role_ids: member.roles,
    })
  } catch {
    // fire-and-forget
  }
}
