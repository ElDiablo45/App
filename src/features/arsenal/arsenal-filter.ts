import type { ArsenalItem, ArsenalSort } from "./types"

export function filterArsenalItems(
  items: ArsenalItem[],
  query: string,
  armaSlug: string,
  topic = "",
): ArsenalItem[] {
  const q = query.trim().toLowerCase()
  return items.filter((item) => {
    if (topic && !item.topics.includes(topic)) return false
    if (armaSlug && !item.armasSlugs.includes(armaSlug)) return false
    if (!q) return true
    return item.title.toLowerCase().includes(q)
  })
}

export function sortArsenalItems(
  items: ArsenalItem[],
  sort: ArsenalSort,
): ArsenalItem[] {
  const copy = [...items]
  switch (sort) {
    case "latest":
      return copy.sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      )
    case "top":
      return copy.sort(
        (a, b) => b.likeCount - a.likeCount || b.ratingAvg - a.ratingAvg,
      )
    case "popular":
      return copy.sort(
        (a, b) => b.likeCount - a.likeCount || b.views - a.views,
      )
    case "views":
      return copy.sort((a, b) => b.views - a.views)
  }
}
