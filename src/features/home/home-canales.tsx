import Image from "next/image"
import Link from "next/link"
import type { LiveChannel } from "./types"
import type { LiveChannelEnriched } from "@/features/twitch/twitch-live"
import { MOCK_LIVE } from "./data"

type AnyChannel = LiveChannel | LiveChannelEnriched

function isEnriched(c: AnyChannel): c is LiveChannelEnriched {
  return "isLive" in c
}

export function HomeCanales({ channels = MOCK_LIVE }: { channels?: AnyChannel[] }) {
  const hasReal = channels.some((c) => isEnriched(c) && (c as LiveChannelEnriched).isLive)
  return (
    <div className="hunt-home-section">
      <div className="hunt-steam-header">
        <h2 className="hunt-home-heading">Canales en directo</h2>
        <span style={{ color: "#6f7589", fontSize: 11 }}>{channels.length} streamers comunidad {hasReal ? `· ${channels.filter((c) => isEnriched(c) && (c as LiveChannelEnriched).isLive).length} en Hunt` : ""}</span>
      </div>
      <div className="hunt-live-grid">
        {channels.map((c, idx) => {
          const enriched = isEnriched(c) ? (c as LiveChannelEnriched) : null
          const isLive = enriched ? enriched.isLive : !c.offline
          const href = `https://twitch.tv/${c.username}`
          const thumb = c.thumbUrl
          const title = enriched?.title
          const viewers = enriched?.viewerCount
          return (
            <Link key={c.id} href={href} target="_blank" rel="noreferrer" className="hunt-live-card" style={{ textDecoration: "none" }}>
              <div className="hunt-live-thumb">
                <Image
                  src={thumb}
                  alt={c.username}
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="hunt-live-img"
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                  unoptimized={thumb.includes("jtvnw.net")}
                />
                {isLive ? (
                  <span className="hunt-live-live">● EN DIRECTO{typeof viewers === "number" ? ` · ${viewers}` : ""}</span>
                ) : (
                  <span className="hunt-live-offline">OFFLINE</span>
                )}
                {isLive && title ? <span className="hunt-live-title-overlay">{title}</span> : null}
              </div>
              <p className="hunt-live-name">{enriched?.displayName ?? c.username}</p>
              {isLive && enriched?.gameName ? <p style={{ margin: 0, color: "#6f7589", fontSize: 10 }}>{enriched.gameName}</p> : null}
            </Link>
          )
        })}
      </div>
      {!channels.some((c) => isEnriched(c as AnyChannel)) && (
        <p style={{ marginTop: 8, color: "#6f7589", fontSize: 11, lineHeight: 1.4 }}>
          Datos de ejemplo — añade <code>TWITCH_CLIENT_ID</code> + <code>TWITCH_CLIENT_SECRET</code> en <code>.env.local</code> para estado en directo real (usa tu Worker <code>list-subs</code> + <code>streamers</code>). El Worker ya filtra solo Hunt (`game.includes("hunt")`) para notificar Discord; aquí se refleja igual.
        </p>
      )}
    </div>
  )
}
