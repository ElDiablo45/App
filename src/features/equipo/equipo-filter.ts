import type { Loadout, LoadoutSort } from "./types"

export function filterLoadouts(items: Loadout[], query: string, topic: string): Loadout[] {
  const q = query.trim().toLowerCase()
  return items.filter((l) => {
    const topicOk = !topic || l.topics.includes(topic)
    if (!topicOk) return false
    if (!q) return true
    const hay = `${l.title} ${l.description} ${l.authorName} ${l.topics.join(" ")}`.toLowerCase()
    return hay.includes(q)
  })
}

export function sortLoadouts(items: Loadout[], sort: LoadoutSort): Loadout[] {
  const copy = [...items]
  switch (sort) {
    case "views":
      return copy.sort((a, b) => b.views - a.views)
    case "latest":
      return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    case "popular":
    case "top":
      return copy.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount)
  }
}
