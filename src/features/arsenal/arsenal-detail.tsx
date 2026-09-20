"use client"

import Link from "next/link"
import { useState } from "react"
import type { ArsenalItem } from "./types"

export function ArsenalDetail({
  item,
  initialLiked,
  onToggleLike,
}: {
  item: ArsenalItem
  initialLiked: boolean
  onToggleLike: (
    id: string,
  ) => Promise<
    { liked: boolean; likeCount: number } | { ok: false; error: string }
  >
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(item.likeCount)

  async function handleLike() {
    const result = await onToggleLike(item.id)
    if (!("liked" in result)) return
    setLiked(result.liked)
    setLikeCount(result.likeCount)
  }

  return (
    <article aria-label={`Dotación ${item.title}`}>
      <p>{item.authorName}</p>
      <h1 className="hunt-home-heading">{item.title}</h1>
      <p className="hunt-support-text">{item.description}</p>

      {item.armasSlugs.length > 0 ? (
        <ul aria-label="Armas de la dotación">
          {item.armasSlugs.map((slug) => (
            <li key={slug}>{slug}</li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        aria-pressed={liked}
        aria-label={`${likeCount} me gusta`}
        onClick={handleLike}
      >
        ♥ {likeCount}
      </button>
      <span>👁 {item.views}</span>

      <Link href={`/equipo/nueva?copiar=${item.id}`}>
        Copiar a mis dotaciones
      </Link>
    </article>
  )
}
