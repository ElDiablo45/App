import Image from "next/image"
import type { FeaturedMember } from "./types"
import { MOCK_FEATURED } from "./data"

export function HomeMiembroDestacado({ member = MOCK_FEATURED }: { member?: FeaturedMember }) {
  return (
    <div className="hunt-home-section">
      <h2 className="hunt-home-heading">Miembro destacado</h2>
      <div className="hunt-featured-card">
        <div className="hunt-featured-top">
          <div>
            <p className="hunt-featured-kicker">ESTA SEMANA CONOCEMOS A</p>
            <p className="hunt-featured-sub">{member.joinedLabel} · {member.logros}</p>
          </div>
          <a href="/perfil" className="hunt-featured-btn">
            Ver perfil
          </a>
        </div>
        <div className="hunt-featured-main">
          <Image src={member.avatarUrl} alt={member.name} width={72} height={72} className="hunt-featured-avatar" />
          <div>
            <p className="hunt-featured-name">{member.name}</p>
            <div className="hunt-featured-flags">
              {member.flags.map((f, i) => (
                <span key={i}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
