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

    return { roles, joinedAt: member.joined_at, nick: member.nick }
  } catch {
    return undefined
  }
}

export async function getHuntGuildRoles(profile: DiscordProfile): Promise<DiscordRole[] | undefined> {
  const member = await getHuntGuildMember(profile)
  return member?.roles.length ? member.roles : undefined
}

/**
 * Lee los IDs de roles del miembro saltándose la caché (para sincronización
 * manual). Devuelve null sin configuración, ante error de Discord o fallo de red.
 */
export async function getFreshRoleIds(discordId: string): Promise<string[] | null> {  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()

  if (!guildId || !botToken) return null

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`, {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    const member = (await res.json()) as { roles: string[] }
    return member.roles
  } catch {
    return null
  }
}

const DISCORD_EPOCH = BigInt(1420070400000)

/**
 * La fecha de una entrada del audit-log vive en su snowflake (sin campo propio).
 */
export function auditEntryDate(entryId: string): string {
  const ts = Number((BigInt(entryId) >> BigInt(22)) + DISCORD_EPOCH)
  return new Date(ts).toISOString()
}

interface AuditChange {
  key: string
  new_value?: Array<string | { id?: string }> | null
}

interface AuditEntry {
  id: string
  target_id?: string
  changes?: AuditChange[]
}

function addedRoleIds(entry: AuditEntry): string[] {
  const ids: string[] = []
  for (const change of entry.changes ?? []) {
    if (change.key !== "$add" || !Array.isArray(change.new_value)) continue
    for (const v of change.new_value) {
      const id = typeof v === "string" ? v : v?.id
      if (id) ids.push(id)
    }
  }
  return ids
}

/**
 * Fecha real de concesión por rol (último $add en el audit-log) para los IDs
 * pedidos. Requiere el permiso "Ver registro de auditoría" en el bot; sin él
 * (403), sin configuración o ante fallos devuelve {} y se usan aproximaciones.
 * Recorre hasta 8 páginas de 100 entradas buscando al usuario.
 */
export async function getMedalGrantedDates(
  discordId: string,
  roleIds: string[],
): Promise<Record<string, string>> {
  const guildId = process.env.HUNT_GUILD_ID?.trim()
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim()
  if (!guildId || !botToken || roleIds.length === 0) return {}

  const found: Record<string, string> = {}
  const pending = new Set(roleIds)
  let before: string | undefined

  try {
    for (let page = 0; page < 8 && pending.size > 0; page++) {
      const url =
        `https://discord.com/api/v10/guilds/${guildId}/audit-logs?action_type=25&limit=100` +
        (before ? `&before=${before}` : "")
      const res = await fetch(url, {
        headers: { Authorization: `Bot ${botToken}` },
        next: { revalidate: 60 },
      })
      if (!res.ok) return found
      const data = (await res.json()) as { audit_log_entries?: AuditEntry[] }
      const entries = data.audit_log_entries ?? []
      if (entries.length === 0) return found

      for (const entry of entries) {
        if (entry.target_id !== discordId) continue
        for (const id of addedRoleIds(entry)) {
          if (pending.has(id)) {
            pending.delete(id)
            found[id] = auditEntryDate(entry.id)
          }
        }
      }
      before = entries[entries.length - 1]?.id
    }
    return found
  } catch {
    return found
  }
}
