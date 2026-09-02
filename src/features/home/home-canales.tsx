import Image from "next/image"
import type { LiveChannel } from "./types"
import { MOCK_LIVE } from "./data"

export function HomeCanales({ channels = MOCK_LIVE }: { channels?: LiveChannel[] }) {
  return (
    <div className="hunt-home-section">
      <h2 className="hunt-home-heading">Canales en directo</h2>
      <div className="hunt-live-grid">
        {channels.map((c, idx) => (
          <div key={c.id} className="hunt-live-card">
            <div className="hunt-live-thumb">
              <Image
                src={c.thumbUrl}
                alt={c.username}
                fill
                sizes="(max-width: 768px) 50vw, 220px"
                className="hunt-live-img"
                priority={idx === 0}
                loading={idx === 0 ? "eager" : "lazy"}
              />
              {c.offline ? <span className="hunt-live-offline">OFFLINE</span> : <span className="hunt-live-live">EN DIRECTO</span>}
            </div>
            <p className="hunt-live-name">{c.username}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
