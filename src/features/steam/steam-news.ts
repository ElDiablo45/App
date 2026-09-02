export interface SteamNewsItem {
  id: string
  title: string
  url: string
  contents: string
  excerpt: string
  imageUrl: string | null
  author: string
  date: string // ISO
  timestamp: number // unix seconds
  feedLabel: string
}

const STEAM_APP_ID = 594650 // Hunt: Showdown 1896
const STEAM_CLAN_IMAGE_BASE = "https://clan.fastly.steamstatic.com/images"

function resolveSteamClanImages(text: string): string {
  return text.replaceAll("{STEAM_CLAN_IMAGE}", STEAM_CLAN_IMAGE_BASE)
}

function extractFirstImage(contents: string): string | null {
  const resolved = resolveSteamClanImages(contents)
  // match .jpg/.png url
  const match = resolved.match(/https?:\/\/[^\s"']+\.(jpg|jpeg|png|gif|webp)/i)
  return match ? match[0] : null
}

function buildExcerpt(contents: string, maxlength = 220): string {
  let text = resolveSteamClanImages(contents)
  // remove image URLs from text for excerpt
  text = text.replace(/https?:\/\/[^\s]+/g, " ").trim()
  // collapse whitespace
  text = text.replace(/\s+/g, " ")
  if (text.length > maxlength) return text.slice(0, maxlength).trim() + "…"
  return text
}

function fallbackImage(): string {
  // Steam store header fallback
  return "https://cdn.akamai.steamstatic.com/steam/apps/594650/header.jpg"
}

interface SteamApiResponse {
  appnews?: {
    appid: number
    newsitems: Array<{
      gid: string
      title: string
      url: string
      is_external_url: boolean
      author: string
      contents: string
      feedlabel: string
      date: number
      feedname: string
    }>
  }
}

/**
 * Obtiene noticias de Hunt: Showdown 1896 desde Steam.
 * Usa API pública ISteamNews/GetNewsForApp, cache 1h (revalidate: 3600).
 * Normaliza {STEAM_CLAN_IMAGE} y extrae imagen/excerpt.
 * Devuelve [] si falla (UI muestra vacío, no rompe Home).
 */
export async function getHuntSteamNews(limit = 4, maxlength = 400): Promise<SteamNewsItem[]> {
  try {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${STEAM_APP_ID}&count=${limit}&maxlength=${maxlength}&format=json`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = (await res.json()) as SteamApiResponse
    const items = data.appnews?.newsitems ?? []
    if (items.length === 0) return []

    return items.map((item) => {
      const imageUrl = extractFirstImage(item.contents) ?? fallbackImage()
      return {
        id: item.gid,
        title: item.title,
        url: item.url,
        contents: resolveSteamClanImages(item.contents),
        excerpt: buildExcerpt(item.contents),
        imageUrl,
        author: item.author || "Hunt: Showdown",
        date: new Date(item.date * 1000).toISOString(),
        timestamp: item.date,
        feedLabel: item.feedlabel || "NOTICIAS",
      }
    })
  } catch {
    return []
  }
}

export async function getHuntSteamNewsById(gid: string): Promise<SteamNewsItem | null> {
  // pide más contenido para vista detalle
  const items = await getHuntSteamNews(20, 3000)
  return items.find((i) => i.id === gid) ?? null
}

export function formatSteamDateHeader(iso: string): string {
  const d = new Date(iso)
  // 26 DE AGOSTO
  const day = d.getDate()
  const month = d.toLocaleDateString("es-ES", { month: "long" }).toUpperCase()
  return `${day} DE ${month}`
}

export function groupSteamNewsByDate(items: SteamNewsItem[]): Array<{ header: string; items: SteamNewsItem[] }> {
  const groups = new Map<string, SteamNewsItem[]>()
  for (const item of items) {
    const header = formatSteamDateHeader(item.date)
    if (!groups.has(header)) groups.set(header, [])
    groups.get(header)!.push(item)
  }
  return Array.from(groups.entries()).map(([header, list]) => ({ header, items: list }))
}
