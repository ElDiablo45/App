import Image from "next/image"
import type { NewMember } from "./types"
import { MOCK_NEW } from "./data"

export function HomeNuevasIncorporaciones({ members }: { members?: NewMember[] }) {
  const list = members ?? MOCK_NEW
  return (
    <div className="hunt-home-section">
      <h2 className="hunt-home-heading">Nuevas incorporaciones</h2>
      {list.length === 0 ? (
        <p className="hunt-acc-empty">Aún no hay incorporaciones recientes.</p>
      ) : (
        <div className="hunt-new-grid">
          {list.map((m) => (
            <div key={m.id} className="hunt-new-card">
              <Image src={m.avatarUrl} alt={m.name} width={56} height={56} className="hunt-new-avatar" unoptimized />
              <p className="hunt-new-name" title={m.name}>
                {m.name}
              </p>
            </div>
          ))}
        </div>
      )}
      {!members && <p style={{ marginTop: "6px", color: "#6f7589", fontSize: "10px" }}>Mostrando datos de ejemplo — configura HUNT_GUILD_ID + DISCORD_BOT_TOKEN para ver los 20 últimos en vivo.</p>}
    </div>
  )
}
