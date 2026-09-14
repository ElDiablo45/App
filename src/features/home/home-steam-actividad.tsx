import Image from "next/image"
import Link from "next/link"
import type { SteamNewsItem } from "@/features/steam/steam-news"
import { groupSteamNewsByDate } from "@/features/steam/steam-news"

interface HomeSteamActividadProps {
  news: SteamNewsItem[]
}

export function HomeSteamActividad({ news }: HomeSteamActividadProps) {
  if (news.length === 0) {
    return (
      <div className="hunt-home-section">
        <h2 className="hunt-home-heading">Actividad</h2>
        <p className="hunt-acc-empty">No hay noticias de Hunt: Showdown 1896 en este momento. Las novedades de Steam aparecerán aquí automáticamente.</p>
        <a href="https://store.steampowered.com/app/594650/Hunt_Showdown_1896/" target="_blank" rel="noreferrer" className="hunt-steam-link">
          Ver en Steam →
        </a>
      </div>
    )
  }

  const groups = groupSteamNewsByDate(news)

  return (
    <div className="hunt-home-section hunt-steam-actividad">
      <div className="hunt-steam-header">
        <h2 className="hunt-home-heading">Actividad</h2>
        <a href="https://store.steampowered.com/app/594650/Hunt_Showdown_1896/" target="_blank" rel="noreferrer" className="hunt-steam-external">
          Steam →
        </a>
      </div>

      <div className="hunt-steam-input" aria-hidden="true">
        Diles algo sobre este juego a tus amigos…
      </div>

      {groups.map((group, groupIdx) => (
        <div key={group.header} className="hunt-steam-group">
          <div className="hunt-steam-date">{group.header}</div>
          <div className="hunt-steam-list">
            {group.items.map((item, itemIdx) => (
              <Link
                key={item.id}
                href={`/noticia/${item.id}`}
                className={`hunt-steam-card${groupIdx === 0 && itemIdx === 0 ? " hunt-steam-card--latest" : ""}`}
              >
                <div className="hunt-steam-thumb">
                  <Image
                    src={item.imageUrl!}
                    alt=""
                    width={280}
                    height={158}
                    className="hunt-steam-img"
                    unoptimized
                    priority={groupIdx === 0 && itemIdx === 0}
                    loading={groupIdx === 0 && itemIdx === 0 ? "eager" : "lazy"}
                  />
                </div>
                <div className="hunt-steam-content">
                  <p className="hunt-steam-kicker">
                    {item.feedLabel}
                    {groupIdx === 0 && itemIdx === 0 ? (
                      <span className="hunt-verified hunt-verified--latest">Última noticia</span>
                    ) : null}
                  </p>
                  <h3 className="hunt-steam-title">{item.title}</h3>
                  <p className="hunt-steam-excerpt">{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
