"use client"

import Link from "next/link"
import type { ArsenalItem } from "./types"

export function ArsenalCard({
  item,
  liked,
  likeCount,
  onLike,
}: {
  item: ArsenalItem
  liked: boolean
  likeCount: number
  onLike: (id: string) => void
}) {
  return (
    <article className="eq-card">
      <div className="eq-card-author">
        <span className="eq-card-author-name">{item.authorName}</span>
      </div>

      <h3 className="eq-card-title">{item.title}</h3>

      <div className="eq-card-actions">
        <button
          type="button"
          className="eq-like"
          aria-pressed={liked}
          aria-label={`${likeCount} me gusta`}
          onClick={() => onLike(item.id)}
        >
          ♥ {likeCount}
        </button>
        <span className="eq-card-views">👁 {item.views}</span>
      </div>

      <footer className="eq-card-foot">
        <Link href={`/arsenal/${item.id}`}>Ver dotación</Link>
        <Link href={`/equipo/nueva?copiar=${item.id}`}>Copiar a dotaciones</Link>
      </footer>
    </article>
  )
}
