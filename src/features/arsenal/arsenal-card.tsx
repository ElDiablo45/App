"use client"

import Image from "next/image"
import Link from "next/link"
import { formatViews, relativeDateEs } from "../equipo/loadout-format"
import type { ArmaOption, ArsenalItem } from "./types"

function shortSlug(slug: string): string {
  return slug.split("/").pop() ?? slug
}

export function ArsenalCard({
  item,
  armas,
  liked,
  likeCount,
  onLike,
}: {
  item: ArsenalItem
  armas: ArmaOption[]
  liked: boolean
  likeCount: number
  onLike: (id: string) => void
}) {
  const fallbackInitial = item.authorName.trim().charAt(0).toUpperCase() || "?"
  const filled = Math.round(item.ratingAvg)
  const thumbs = item.armasSlugs.slice(0, 2).map((slug) => ({
    slug,
    found: armas.find((a) => a.slug === slug),
  }))

  return (
    <article className="ar-card">
      <div className="ar-card-main">
        <div className="ar-card-author">
          {item.authorAvatarUrl ? (
            <Image
              src={item.authorAvatarUrl}
              alt={item.authorName}
              width={24}
              height={24}
              className="ar-card-avatar"
              unoptimized
            />
          ) : (
            <span className="ar-card-avatar-fallback" aria-hidden="true">
              {fallbackInitial}
            </span>
          )}
          <span className="ar-card-author-name">{item.authorName}</span>
        </div>

        <h3 className="ar-card-title">{item.title}</h3>

        {item.topics.length > 0 ? (
          <div className="ar-card-topics">
            {item.topics.map((t) => (
              <span key={t} className="ar-card-topic">
                {t}
              </span>
            ))}
          </div>
        ) : null}

        {thumbs.length > 0 ? (
          <div className="ar-card-weapons" aria-label="Armas de la dotación">
            {thumbs.map(({ slug, found }) =>
              found ? (
                <span key={slug} className="ar-weapon">
                  <Image
                    src={found.imagenUrl}
                    alt={found.nombre}
                    width={220}
                    height={90}
                    className="ar-weapon-img"
                    unoptimized
                  />
                  <span className="ar-weapon-name">{found.nombre}</span>
                </span>
              ) : (
                <span key={slug} className="ar-weapon ar-weapon--empty">
                  <span className="ar-weapon-name">{shortSlug(slug)}</span>
                </span>
              ),
            )}
          </div>
        ) : null}
      </div>

      <div className="ar-card-side">
        <span className="ar-rating-num">{item.ratingAvg.toFixed(1)}</span>
        <span className="ar-stars" aria-label={`${item.ratingAvg.toFixed(1)} de 5`}>
          {"★".repeat(filled)}
          {"☆".repeat(Math.max(0, 5 - filled))}
        </span>
        <button
          type="button"
          className="ar-like"
          aria-pressed={liked}
          aria-label={`${likeCount} me gusta`}
          onClick={() => onLike(item.id)}
        >
          ♥ {likeCount}
        </button>
      </div>

      <footer className="ar-card-foot">
        <span>☆ {item.ratingAvg.toFixed(1)}</span>
        <span>👁 {formatViews(item.views)}</span>
        <span>📅 {relativeDateEs(item.createdAt)}</span>
        <span className="ar-card-links">
          <Link href={`/arsenal/${item.id}`}>Ver dotación</Link>
          <Link href={`/equipo/nueva?copiar=${item.id}`}>Copiar</Link>
        </span>
      </footer>
    </article>
  )
}
