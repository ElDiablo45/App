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
  // 1) bbcode [img]url[/img]
  const bb = resolved.match(/\[img\]([^\]]+)\[\/img\]/i)
  if (bb) return bb[1].trim()
  // 2) url directa con extension (permite query params ?v=... y comillas)
  const match = resolved.match(/https?:\/\/[^\s"'<>\]]+\.(jpg|jpeg|png|gif|webp)(\?[^\s"'<>\]]*)?/i)
  if (match) return match[0]
  // 3) cualquier imagen del CDN de steam aunque no tenga extension visible
  const cdn = resolved.match(/https?:\/\/(clan\.fastly\.steamstatic\.com|shared\.fastly\.steamstatic\.com|cdn\.akamai\.steamstatic\.com)[^\s"'<>\]]+/i)
  return cdn ? cdn[0] : null
}

export function stripSteamBbcode(text: string): string {
  let out = resolveSteamClanImages(text)
  // youtube preview -> quitar tag, el video se extrae aparte
  out = out.replace(/\[previewyoutube[^\]]*\][\s\S]*?\[\/previewyoutube\]/gi, " ")
  // imagenes bbcode -> quitar (ya se muestran como hero/galeria)
  out = out.replace(/\[img\][\s\S]*?\[\/img\]/gi, " ")
  // links [url=...]texto[/url] -> dejar texto
  out = out.replace(/\[url=[^\]]*\]([\s\S]*?)\[\/url\]/gi, "$1")
  // quitar resto de tags bbcode: [p], [b], [i], [u], [list], [*], etc
  out = out.replace(/\[\/?[a-z*=][^\]]*\]/gi, " ")
  // urls de imagen sueltas
  out = out.replace(/https?:\/\/[^\s"'<>\]]+\.(jpg|jpeg|png|gif|webp)(\?[^\s"'<>\]]*)?/gi, " ")
  // entidades html basicas
  out = out.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
  // colapsar espacios y lineas
  out = out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim()
  return out
}

export function extractSteamYoutubeIds(text: string): string[] {
  const ids: string[] = []
  const re = /\[previewyoutube=([^\];]+)[^\]]*\]/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const id = m[1].replace(/['"]/g, "").split(";")[0].split("?")[0].trim()
    if (id) ids.push(id)
  }
  return Array.from(new Set(ids))
}

function buildExcerpt(contents: string, maxlength = 220): string {
  let text = stripSteamBbcode(contents)
  // quitar urls restantes para el excerpt
  text = text.replace(/https?:\/\/[^\s]+/g, " ").trim()
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
export async function getHuntSteamNews(limit = 4, maxlength = 0): Promise<SteamNewsItem[]> {
  try {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${STEAM_APP_ID}&count=${limit}&maxlength=${maxlength}&format=json`
    const res = await fetch(url, { next: { revalidate: 600 }, signal: AbortSignal.timeout(5000) })
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
  // ventana amplia para que IDs clicados desde home o antiguos no den 404
  const items = await getHuntSteamNews(100, 0)
  const found = items.find((i) => i.id === gid) ?? null
  if (found) return found
  // reintento sin cache por si la lista cacheada aun no incluye la noticia nueva
  try {
    const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${STEAM_APP_ID}&count=100&maxlength=0&format=json`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return null
    const data = (await res.json()) as SteamApiResponse
    const raw = data.appnews?.newsitems ?? []
    const match = raw.find((r) => r.gid === gid)
    if (!match) return null
    const imageUrl = extractFirstImage(match.contents) ?? fallbackImage()
    return {
      id: match.gid,
      title: match.title,
      url: match.url,
      contents: resolveSteamClanImages(match.contents),
      excerpt: buildExcerpt(match.contents),
      imageUrl,
      author: match.author || "Hunt: Showdown",
      date: new Date(match.date * 1000).toISOString(),
      timestamp: match.date,
      feedLabel: match.feedlabel || "NOTICIAS",
    }
  } catch {
    return null
  }
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
