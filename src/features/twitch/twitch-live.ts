export interface CommunityStreamer {
  id: string
  name: string
}

export interface LiveChannelEnriched {
  id: string
  username: string
  displayName: string
  isLive: boolean
  title?: string
  gameName?: string
  viewerCount?: number
  thumbUrl: string
  avatarUrl?: string
  startedAt?: string
  offline?: boolean
}

const WORKER_STREAMERS_URL = "https://hunt-notifier.diabloxx2475.workers.dev/streamers"
const WORKER_LIST_SUBS_URL = "https://hunt-notifier.diabloxx2475.workers.dev/list-subs"

async function fetchStreamersList(): Promise<CommunityStreamer[]> {
  try {
    const res = await fetch(WORKER_STREAMERS_URL, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = (await res.json()) as { streamers: CommunityStreamer[] }
    return data.streamers ?? []
  } catch {
    return []
  }
}

async function getTwitchToken(): Promise<string | null> {
  const clientId = process.env.TWITCH_CLIENT_ID?.trim()
  const clientSecret = process.env.TWITCH_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) return null
  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token: string }
    return data.access_token
  } catch {
    return null
  }
}

interface TwitchStream {
  id: string
  user_id: string
  user_login: string
  user_name: string
  game_name: string
  title: string
  viewer_count: number
  thumbnail_url: string
  started_at: string
}

interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
}

async function fetchLiveStreams(streamers: CommunityStreamer[]): Promise<Map<string, TwitchStream>> {
  const token = await getTwitchToken()
  const clientId = process.env.TWITCH_CLIENT_ID?.trim()
  if (!token || !clientId || streamers.length === 0) return new Map()

  // Twitch allows up to 100 user_id per request
  const ids = streamers.map((s) => s.id).join("&user_id=")
  try {
    const res = await fetch(`https://api.twitch.tv/helix/streams?user_id=${ids}`, {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    })
    if (!res.ok) return new Map()
    const data = (await res.json()) as { data: TwitchStream[] }
    const map = new Map<string, TwitchStream>()
    for (const s of data.data) {
      map.set(s.user_id, s)
      map.set(s.user_login.toLowerCase(), s)
    }
    return map
  } catch {
    return new Map()
  }
}

async function fetchUsers(streamers: CommunityStreamer[]): Promise<Map<string, TwitchUser>> {
  const token = await getTwitchToken()
  const clientId = process.env.TWITCH_CLIENT_ID?.trim()
  if (!token || !clientId || streamers.length === 0) return new Map()
  const ids = streamers.map((s) => s.id).join("&id=")
  try {
    const res = await fetch(`https://api.twitch.tv/helix/users?id=${ids}`, {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    })
    if (!res.ok) return new Map()
    const data = (await res.json()) as { data: TwitchUser[] }
    const map = new Map<string, TwitchUser>()
    for (const u of data.data) {
      map.set(u.id, u)
      map.set(u.login.toLowerCase(), u)
    }
    return map
  } catch {
    return new Map()
  }
}

function buildThumb(url: string, w = 440, h = 248): string {
  return url.replace("{width}", String(w)).replace("{height}", String(h))
}

/**
 * Obtiene canales de la comunidad con estado en directo.
 * - Lee lista de streamers desde el Worker (hunt-notifier)
 * - Si hay TWITCH_CLIENT_ID/SECRET en env, consulta helix/streams y filtra solo Hunt si stream.game_name incluye "hunt"
 * - Si no hay credenciales o falla, devuelve lista con offline=true (muestra comunidad sin live)
 * - Cache 60s para streams, 5min para lista
 */
export async function getLiveCommunityChannels(): Promise<LiveChannelEnriched[]> {
  const streamers = await fetchStreamersList()
  if (streamers.length === 0) return []

  const [liveMap, userMap] = await Promise.all([fetchLiveStreams(streamers), fetchUsers(streamers)])

  const hasTwitch = liveMap.size > 0 || userMap.size > 0 || (await getTwitchToken()) !== null

  // Si no hay credenciales Twitch, mostrar todos como offline con placeholder thumb
  if (!hasTwitch) {
    return streamers.map((s) => ({
      id: s.id,
      username: s.name,
      displayName: s.name,
      isLive: false,
      offline: true,
      thumbUrl: `https://static-cdn.jtvnw.net/jtv_user_pictures/${s.name.toLowerCase()}-profile_image-300x300.png`,
    }))
  }

  return streamers.map((s) => {
    const live = liveMap.get(s.id) ?? liveMap.get(s.name.toLowerCase())
    const user = userMap.get(s.id) ?? userMap.get(s.name.toLowerCase())

    // Filtro Hunt: solo considerar live si game contiene hunt (igual que Worker). Si no es Hunt, tratar como offline para Canales en directo
    const isHuntLive = live ? live.game_name.toLowerCase().includes("hunt") : false

    if (live && isHuntLive) {
      return {
        id: s.id,
        username: live.user_login || s.name,
        displayName: live.user_name || user?.display_name || s.name,
        isLive: true,
        offline: false,
        title: live.title,
        gameName: live.game_name,
        viewerCount: live.viewer_count,
        thumbUrl: buildThumb(live.thumbnail_url),
        avatarUrl: user?.profile_image_url,
        startedAt: live.started_at,
      }
    }

    return {
      id: s.id,
      username: s.name,
      displayName: user?.display_name || s.name,
      isLive: false,
      offline: true,
      thumbUrl: user?.profile_image_url || `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=225&fit=crop`,
      avatarUrl: user?.profile_image_url,
    }
  })
}

// Helper para list-subs debug (opcional)
export async function getListSubs(): Promise<unknown> {
  try {
    const res = await fetch(WORKER_LIST_SUBS_URL, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
