import type { DiscordProfile } from "@/features/discord/discord-profile"

export interface HuntMessage {
  id: string
  channelId: string
  channelName: string
  content: string
  timestamp: string
}

export interface HuntMessagesResult {
  messages: HuntMessage[]
  totalRecent: number
}

/**
 * Obtiene mensajes recientes del usuario en el servidor de Hunt Hispano vía Bot.
 * Requiere HUNT_GUILD_ID + DISCORD_BOT_TOKEN y que el bot tenga permisos de lectura.
 * Recorre canales de texto y filtra por author.id.
 * Limitado a 100 mensajes por canal (aproximación, no histórico completo sin DB externa).
 * Devuelve undefined si no está configurado o falla.
 */
export async function getHuntUserMessages(
  profile: DiscordProfile,
  limit = 50,
): Promise<HuntMessagesResult | undefined> {
  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()

  if (!guildId || !botToken) return undefined

  try {
    const channelsRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 60 },
    })
    if (!channelsRes.ok) return undefined
    const channels = (await channelsRes.json()) as Array<{ id: string; name: string; type: number }>

    // Tipos de canal con mensajes: 0 = GUILD_TEXT, 5 = GUILD_ANNOUNCEMENT, 10-12 = threads
    const textChannels = channels.filter((c) => [0, 5, 10, 11, 12].includes(c.type))

    // Limitar cantidad de canales a escanear para no saturar rate limits (máx 15 canales más recientes)
    const channelsToScan = textChannels.slice(0, 15)

    const allMessages: HuntMessage[] = []

    for (const channel of channelsToScan) {
      try {
        const messagesRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages?limit=100`, {
          headers: { Authorization: `Bot ${botToken}` },
          next: { revalidate: 60 },
        })
        if (!messagesRes.ok) continue
        const messages = (await messagesRes.json()) as Array<{
          id: string
          content: string
          timestamp: string
          author: { id: string }
        }>
        for (const m of messages) {
          if (m.author.id === profile.id) {
            allMessages.push({
              id: m.id,
              channelId: channel.id,
              channelName: channel.name,
              content: m.content || "(sin contenido de texto)",
              timestamp: m.timestamp,
            })
          }
        }
      } catch {
        continue
      }
      if (allMessages.length >= limit) break
    }

    allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const sliced = allMessages.slice(0, limit)

    return { messages: sliced, totalRecent: allMessages.length }
  } catch {
    return undefined
  }
}
