export type LoadoutSort = "popular" | "top" | "views" | "latest"

export interface Loadout {
  id: string
  title: string
  description: string
  topics: string[]
  authorName: string
  authorAvatarUrl?: string
  coverUrl?: string
  ratingAvg: number
  ratingCount: number
  views: number
  createdAt: string
}
