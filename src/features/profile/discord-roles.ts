import type { DiscordProfile } from "@/features/discord/discord-profile"

export interface DiscordRole {
  id: string
  name: string
  color: string
}

export interface HuntGuildMember {
  roles: DiscordRole[]
  joinedAt?: string // ISO de Discord member.joined_at
  nick?: string | null
}

function colorToHex(color: number): string {
  if (!color) return "#6b7280"
  return `#${color.toString(16).padStart(6, "0")}`
}

/**
 * Obtiene datos reales del miembro en el servidor de Hunt Hispano via Bot.
 * Requiere HUNT_GUILD_ID + DISCORD_BOT_TOKEN.
 * Devuelve roles + fecha de entrada al servidor. Si falla o no está configurado, undefined.
 * Nunca expone tokens al cliente.
 */
export async function getHuntGuildMember(profile: DiscordProfile): Promise<HuntGuildMember | undefined> {
  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()

  if (!guildId || !botToken) return undefined

  try {
    const memberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 60 },
    })
    if (!memberRes.ok) return undefined
    const member = (await memberRes.json()) as { roles: string[]; joined_at: string; nick: string | null }

    const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 300 },
    })
    if (!rolesRes.ok) {
      return { roles: [], joinedAt: member.joined_at, nick: member.nick }
    }
    const allRoles = (await rolesRes.json()) as Array<{ id: string; name: string; color: number }>

    const map = new Map(allRoles.map((r) => [r.id, r]))
    const roles: DiscordRole[] = member.roles
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((r) => ({ id: r!.id, name: r!.name, color: colorToHex(r!.color) }))
      .filter((r) => r.name !== "@everyone")
      .slice(0, 12)

    return { roles, joinedAt: member.joined_at, nick: member.nick }
  } catch {
    return undefined
  }
}

export async function getHuntGuildRoles(profile: DiscordProfile): Promise<DiscordRole[] | undefined> {
  const member = await getHuntGuildMember(profile)
  return member?.roles.length ? member.roles : undefined
}
