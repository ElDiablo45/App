import { VERIFIED_ROLE_ID } from "@/features/profile/role-medals"

/**
 * Asigna el rol verificado al miembro vía Bot. Nunca lanza: devuelve false
 * si falta configuración, Discord rechaza o la red falla (el registro no se bloquea).
 */
export async function grantVerifiedRole(discordId: string): Promise<boolean> {
  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()
  if (!guildId || !botToken) return false

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${VERIFIED_ROLE_ID}`,
      { method: "PUT", headers: { Authorization: `Bot ${botToken}` } },
    )
    return res.ok
  } catch {
    return false
  }
}
