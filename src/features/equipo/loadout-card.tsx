import Image from "next/image"
import { formatViews, relativeDateEs } from "./loadout-format"
import type { Loadout } from "./types"

export function LoadoutCard({ item }: { item: Loadout }) {
  const fallbackInitial = item.authorName.trim().charAt(0).toUpperCase() || "?"
  const filled = Math.round(item.ratingAvg)

  return (
    <article className="eq-card">
      <div className="eq-card-body">
        <div className="eq-card-main">
        <div className="eq-card-author">
          {item.authorAvatarUrl ? (
            <Image
              src={item.authorAvatarUrl}
              alt={item.authorName}
              width={24}
              height={24}
              className="eq-card-avatar"
              unoptimized
            />
          ) : (
            <span className="eq-card-avatar-fallback">{fallbackInitial}</span>
          )}
          <span className="eq-card-author-name">{item.authorName}</span>
        </div>

        <h3 className="eq-card-title">{item.title}</h3>

        <div className="eq-card-topics">
          {item.topics.map((t) => (
            <span key={t} className="eq-card-topic">
              {t}
            </span>
          ))}
        </div>

        <div className="eq-card-rating">
          <span className="eq-card-rating-num">{item.ratingAvg.toFixed(1)}</span>
          <span className="eq-card-stars" aria-label={`${item.ratingAvg.toFixed(1)} de 5`}>
            {"★".repeat(filled)}
            {"☆".repeat(Math.max(0, 5 - filled))}
          </span>
        </div>
      </div>

      {item.coverUrl ? (
        <div className="eq-card-cover">
          <Image
            src={item.coverUrl}
            alt=""
            width={480}
            height={270}
            className="eq-card-cover-img"
            unoptimized
          />
        </div>
        ) : null}
      </div>

      <footer className="eq-card-foot">
        <span>☆ {item.ratingAvg.toFixed(1)}</span>
        <span>👁 {formatViews(item.views)}</span>
        <span>💬 0</span>
        <span className="eq-card-date">📅 {relativeDateEs(item.createdAt)}</span>
      </footer>
    </article>
  )
}
