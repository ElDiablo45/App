import Image from "next/image"
import type { Loadout } from "./types"

function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return `${views}`
}

function relativeDateEs(iso: string): string {
  const diffDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)),
  )
  if (diffDays <= 0) return "hoy"
  if (diffDays === 1) return "ayer"
  if (diffDays < 30) return `hace ${diffDays} días`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return months === 1 ? "hace 1 mes" : `hace ${months} meses`
  const years = Math.floor(months / 12)
  return years === 1 ? "hace 1 año" : `hace ${years} años`
}

export function LoadoutCard({ item }: { item: Loadout }) {
  const fallbackInitial = item.authorName.trim().charAt(0).toUpperCase() || "?"
  const filled = Math.round(item.ratingAvg)

  return (
    <article className="eq-card">
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

      <footer className="eq-card-foot">
        <span>☆ {item.ratingAvg.toFixed(1)}</span>
        <span>👁 {formatViews(item.views)}</span>
        <span>💬 0</span>
        <span className="eq-card-date">📅 {relativeDateEs(item.createdAt)}</span>
      </footer>
    </article>
  )
}
