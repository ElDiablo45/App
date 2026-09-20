import type { Loadout } from "../equipo/types"

export type ArsenalSort = "popular" | "top" | "latest"

export interface ArsenalItem extends Loadout {
  likeCount: number
  armasSlugs: string[]
  likedByMe?: boolean
}
