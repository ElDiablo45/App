import type { Loadout } from "../equipo/types"

export type ArsenalSort = "popular" | "top" | "views" | "latest"

export interface ArsenalItem extends Loadout {
  likeCount: number
  armasSlugs: string[]
  likedByMe?: boolean
}

export interface ArmaOption {
  slug: string
  nombre: string
  imagenUrl: string
}
