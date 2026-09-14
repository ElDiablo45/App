// Backfill único: vuelca los miembros con rol staff/streamer a Supabase.
// Uso (una sola vez, con el servidor parado o no): `node scripts/sync-community.mjs`
// Lee HUNT_GUILD_ID, DISCORD_BOT_TOKEN, SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY de .env.local.
// Después de ejecutarlo, este script puede archivarse/borrarse.
import { readFileSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

function loadEnv(path = ".env.local") {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  } catch {
    console.error(`No se pudo leer ${path}`)
    process.exit(1)
  }
}
loadEnv()

const guildId = process.env.HUNT_GUILD_ID?.trim()
const botToken = process.env.DISCORD_BOT_TOKEN?.trim()
const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!guildId || !botToken || !url || !key) {
  console.error("Faltan HUNT_GUILD_ID, DISCORD_BOT_TOKEN, SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local")
  process.exit(1)
}

const STAFF = "1352786195482017873"
const STREAMER = "1352786191593767022"

const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
  headers: { Authorization: `Bot ${botToken}` },
  signal: AbortSignal.timeout(15000),
})
if (!res.ok) {
  console.error("Discord devolvió", res.status)
  process.exit(1)
}
const members = await res.json()
const sb = createClient(url, key, { auth: { persistSession: false } })

let synced = 0
for (const m of members) {
  const wanted = (m.roles ?? []).filter((r) => r === STAFF || r === STREAMER)
  if (wanted.length === 0) continue
  const display = m.nick || m.user?.global_name || m.user?.username || null
  const hash = m.user?.avatar
  const avatar = hash
    ? `https://cdn.discordapp.com/avatars/${m.user.id}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=256`
    : null
  const now = new Date().toISOString()
  const { error: upErr } = await sb.from("community_members").upsert(
    {
      discord_id: m.user.id,
      display_name: display,
      avatar_url: avatar,
      nick: m.nick ?? null,
      joined_at: m.joined_at ?? null,
      synced_at: now,
      updated_at: now,
    },
    { onConflict: "discord_id" },
  )
  if (upErr) {
    console.error("upsert miembro", m.user.id, upErr.message)
    continue
  }
  const { error: roleErr } = await sb
    .from("community_member_roles")
    .upsert(wanted.map((role_id) => ({ discord_id: m.user.id, role_id })), {
      onConflict: "discord_id,role_id",
    })
  if (roleErr) {
    console.error("upsert roles", m.user.id, roleErr.message)
    continue
  }
  synced++
}
console.log(`OK: ${synced} miembros staff/streamer sincronizados de ${members.length} totales.`)
