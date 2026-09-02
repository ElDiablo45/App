import type { NewMember } from "./types"

function avatarUrlFor(user: { id: string; avatar: string | null; discriminator?: string }): string {
  if (user.avatar) {
    const ext = user.avatar.startsWith("a_") ? "gif" : "png"
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`
  }
  // default avatar 0-5
  const idx = Number(user.discriminator ?? "0") % 5
  // fallback to embed avatar
  return `https://cdn.discordapp.com/embed/avatars/${idx}.png`
}

function sinceLabelFromJoinedAt(joinedAt: string): string {
  const joined = new Date(joinedAt)
  const diffMs = Date.now() - joined.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "hoy"
  if (diffDays === 1) return "1 día"
  return `${diffDays} días`
}

function flagsForMember(memberId: string): string[] {
  // pool similar to screenshot: country flags + 🍃 💗 🍲 etc.
  const pools = [
    ["🇪🇸", "🍃", "💗"],
    ["🇦🇷", "🍃", "💗"],
    ["🇨🇴", "🇦🇷", "🍃"],
    ["🇪🇸", "🇦🇷", "🍃"],
    ["🇲🇽", "🍃", "💗"],
    ["🇦🇷", "🍲", "🍃"],
    ["🇪🇸", "🇵🇹", "🍃"],
    ["🇨🇴", "🍃", "💗"],
    ["🇪🇸", "🇭🇷", "🍃"],
  ]
  const hash = [...memberId].reduce((a, c) => a + c.charCodeAt(0), 0)
  return pools[hash % pools.length]
}

interface DiscordApiMember {
  user: {
    id: string
    username: string
    global_name?: string | null
    avatar: string | null
    discriminator: string
  }
  nick?: string | null
  joined_at: string
  roles: string[]
}

/**
 * Obtiene los miembros más recientes del servidor Hunt (ordenados por joined_at desc).
 * Requiere HUNT_GUILD_ID + DISCORD_BOT_TOKEN y privilegio GUILD_MEMBERS.
 * Devuelve undefined si no está configurado o falla → el UI caerá a MOCK_NEW.
 */
export async function getRecentHuntMembers(limit = 20): Promise<NewMember[] | undefined> {
  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()
  if (!guildId || !botToken) return undefined

  try {
    // Discord limita a 1000 por request. Para guilds grandes habría que paginar con `after`.
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 60 },
    })
    if (!res.ok) return undefined
    const members = (await res.json()) as DiscordApiMember[]

    // Ordenar por joined_at más reciente primero
    members.sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())

    const sliced = members.slice(0, limit)

    return sliced.map((m) => {
      const display = m.nick || m.user.global_name || m.user.username
      return {
        id: m.user.id,
        name: display,
        avatarUrl: avatarUrlFor(m.user),
        sinceLabel: sinceLabelFromJoinedAt(m.joined_at),
        flags: flagsForMember(m.user.id),
      }
    })
  } catch {
    return undefined
  }
}
