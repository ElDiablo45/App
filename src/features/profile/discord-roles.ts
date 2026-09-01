import type { DiscordProfile } from "@/features/discord/discord-profile"

export interface DiscordRole {
  id: string
  name: string
  color: string
}

function colorToHex(color: number): string {
  if (!color) return "#6b7280"
  return `#${color.toString(16).padStart(6, "0")}`
}

/**
 * Intenta obtener roles del guild de Hunt Hispano via Discord API.
 * Requiere HUNT_GUILD_ID + DISCORD_BOT_TOKEN o acceso con guilds.members.read.
 * Si no hay credenciales o falla, devuelve undefined para que el UI muestre placeholders.
 * Esta función es segura: nunca expone tokens al cliente.
 */
export async function getHuntGuildRoles(profile: DiscordProfile): Promise<DiscordRole[] | undefined> {
  const guildId = process.env.HUNT_GUILD_ID
  const botToken = process.env.DISCORD_BOT_TOKEN

  if (!guildId || !botToken) return undefined

  try {
    // 1) Obtener miembro del guild
    const memberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${profile.id}`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 60 },
    })
    if (!memberRes.ok) return undefined
    const member = (await memberRes.json()) as { roles: string[] }

    // 2) Obtener definición de roles del guild para color/nombre
    const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 300 },
    })
    if (!rolesRes.ok) return undefined
    const allRoles = (await rolesRes.json()) as Array<{ id: string; name: string; color: number }>

    const map = new Map(allRoles.map((r) => [r.id, r]))
    const memberRoles: DiscordRole[] = member.roles
      .map((id) => map.get(id))
      .filter(Boolean)
      .map((r) => ({ id: r!.id, name: r!.name, color: colorToHex(r!.color) }))
      .filter((r) => r.name !== "@everyone")
      .slice(0, 8)

    return memberRoles.length ? memberRoles : undefined
  } catch {
    return undefined
  }
}
