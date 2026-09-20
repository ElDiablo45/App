import { describe, expect, it, vi } from "vitest"
import {
  filterArsenalItems,
  getArsenalItem,
  getArsenalItems,
  getLikedIds,
  incrementView,
  mapRowToArsenalItem,
  sortArsenalItems,
  toggleLike,
} from "./arsenal"
import { MOCK_LOADOUTS } from "../equipo/data"

const { getServiceSupabase } = vi.hoisted(() => ({ getServiceSupabase: vi.fn() }))
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase }))

const BASE_ROW = {
  id: "r1",
  owner_discord_id: "1",
  owner_name: "Solo",
  owner_avatar_url: null,
  title: "Patrulla del pantano",
  description: "Mención a winfield en la descripción",
  topics: ["pvp"],
  cover_url: null,
  body: {},
  rating_avg: 4.5,
  rating_count: 10,
  views: 100,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
  like_count: 7,
  armas_slugs: ["Weapons/Winfield M1873"],
}

describe("mapRowToArsenalItem", () => {
  it("maps like_count and armas_slugs", () => {
    const item = mapRowToArsenalItem(BASE_ROW)
    expect(item.likeCount).toBe(7)
    expect(item.armasSlugs).toEqual(["Weapons/Winfield M1873"])
    expect(item.title).toBe("Patrulla del pantano")
  })

  it("defaults pre-migration rows to rating_count and empty armas", () => {
    const { id, owner_discord_id, owner_name, owner_avatar_url, title, description, topics, cover_url, body, rating_avg, rating_count, views, created_at, updated_at } = BASE_ROW
    const legacy = { id, owner_discord_id, owner_name, owner_avatar_url, title, description, topics, cover_url, body, rating_avg, rating_count, views, created_at, updated_at }
    const item = mapRowToArsenalItem(legacy)
    expect(item.likeCount).toBe(10)
    expect(item.armasSlugs).toEqual([])
  })
})

describe("getArsenalItems", () => {
  it("falls back to mocks mapped with likeCount when Supabase is missing", async () => {
    getServiceSupabase.mockReturnValueOnce(null)
    const items = await getArsenalItems("popular")
    expect(items).toHaveLength(MOCK_LOADOUTS.length)
    expect(items[0]).toMatchObject({
      likeCount: MOCK_LOADOUTS[0].ratingCount,
      armasSlugs: [],
    })
  })

  it("orders popular by like_count desc", async () => {
    const order = vi.fn(async () => ({ data: [BASE_ROW], error: null }))
    getServiceSupabase.mockReturnValueOnce({
      from: () => ({ select: () => ({ order }) }),
    })
    await getArsenalItems("popular")
    expect(order).toHaveBeenCalledWith("like_count", { ascending: false })
  })

  it("orders latest by created_at desc", async () => {
    const order = vi.fn(async () => ({ data: [BASE_ROW], error: null }))
    getServiceSupabase.mockReturnValueOnce({
      from: () => ({ select: () => ({ order }) }),
    })
    await getArsenalItems("latest")
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false })
  })
})

describe("filterArsenalItems", () => {
  it("searches title only, not description", () => {
    const items = [mapRowToArsenalItem(BASE_ROW)]
    expect(filterArsenalItems(items, "pantano", "")).toHaveLength(1)
    expect(filterArsenalItems(items, "winfield", "")).toHaveLength(0)
  })

  it("filters by arma slug", () => {
    const items = [mapRowToArsenalItem(BASE_ROW)]
    expect(
      filterArsenalItems(items, "", "Weapons/Winfield M1873"),
    ).toHaveLength(1)
    expect(filterArsenalItems(items, "", "Weapons/Sparks")).toHaveLength(0)
  })
})

describe("sortArsenalItems", () => {
  it("sorts latest by createdAt desc", () => {
    const a = mapRowToArsenalItem({ ...BASE_ROW, id: "a" })
    const b = mapRowToArsenalItem({
      ...BASE_ROW,
      id: "b",
      created_at: "2026-09-10T00:00:00.000Z",
    })
    expect(sortArsenalItems([a, b], "latest").map((i) => i.id)).toEqual([
      "b",
      "a",
    ])
  })

  it("sorts popular by likeCount desc", () => {
    const a = mapRowToArsenalItem({ ...BASE_ROW, id: "a", like_count: 3 })
    const b = mapRowToArsenalItem({ ...BASE_ROW, id: "b", like_count: 9 })
    expect(sortArsenalItems([a, b], "popular").map((i) => i.id)).toEqual([
      "b",
      "a",
    ])
  })
})

function likesClient(opts: { existing: unknown; likeCount: number; calls: string[] }) {
  const chain: Record<string, unknown> = {}
  chain.eq = () => chain
  chain.maybeSingle = async () => ({ data: opts.existing, error: null })
  chain.single = async () => ({ data: { like_count: opts.likeCount }, error: null })
  return {
    from: (table: string) => {
      if (table === "loadout_likes") {
        return {
          select: () => chain,
          insert: async (row: unknown) => {
            opts.calls.push(`insert:${JSON.stringify(row)}`)
            return { error: null }
          },
          delete: () => ({
            eq: () => ({
              eq: async () => {
                opts.calls.push("delete")
                return { error: null }
              },
            }),
          }),
        }
      }
      return { select: () => chain }
    },
  }
}

describe("toggleLike", () => {
  it("inserts a like when none exists", async () => {
    const calls: string[] = []
    getServiceSupabase.mockReturnValueOnce(
      likesClient({ existing: null, likeCount: 8, calls }),
    )
    await expect(toggleLike("r1", "user-1")).resolves.toEqual({
      liked: true,
      likeCount: 8,
    })
    expect(calls.some((c) => c.startsWith("insert:"))).toBe(true)
  })

  it("deletes the like when it already exists", async () => {
    const calls: string[] = []
    getServiceSupabase.mockReturnValueOnce(
      likesClient({ existing: { loadout_id: "r1" }, likeCount: 6, calls }),
    )
    await expect(toggleLike("r1", "user-1")).resolves.toEqual({
      liked: false,
      likeCount: 6,
    })
    expect(calls).toContain("delete")
  })

  it("throws when Supabase is not configured", async () => {
    getServiceSupabase.mockReturnValueOnce(null)
    await expect(toggleLike("r1", "user-1")).rejects.toThrow()
  })
})

describe("incrementView", () => {
  it("resolves silently without Supabase", async () => {
    getServiceSupabase.mockReturnValueOnce(null)
    await expect(incrementView("r1")).resolves.toBeUndefined()
  })
})

describe("getArsenalItem", () => {
  it("returns the mapped item with likedByMe", async () => {
    const single = vi.fn(async () => ({ data: BASE_ROW, error: null }))
    const maybeSingle = vi.fn(async () => ({
      data: { loadout_id: "r1" },
      error: null,
    }))
    const eqChain: Record<string, unknown> = {}
    eqChain.eq = () => eqChain
    eqChain.single = single
    eqChain.maybeSingle = maybeSingle
    getServiceSupabase.mockReturnValueOnce({
      from: (table: string) =>
        table === "loadouts"
          ? { select: () => ({ eq: () => eqChain }) }
          : { select: () => eqChain },
    })
    const result = await getArsenalItem("r1", "user-1")
    expect(result?.item.id).toBe("r1")
    expect(result?.likedByMe).toBe(true)
  })

  it("returns null when the row is missing", async () => {
    getServiceSupabase.mockReturnValueOnce({
      from: () => ({ select: () => ({ eq: async () => ({ data: null, error: null }) }) }),
    })
    await expect(getArsenalItem("missing")).resolves.toBeNull()
  })
})

describe("getLikedIds", () => {
  it("returns the set of liked loadout ids", async () => {
    getServiceSupabase.mockReturnValueOnce({
      from: () => ({
        select: () => ({
          eq: async () => ({
            data: [{ loadout_id: "a" }, { loadout_id: "b" }],
            error: null,
          }),
        }),
      }),
    })
    await expect(getLikedIds("user-1")).resolves.toEqual(new Set(["a", "b"]))
  })

  it("returns an empty set without Supabase", async () => {
    getServiceSupabase.mockReturnValueOnce(null)
    await expect(getLikedIds("user-1")).resolves.toEqual(new Set())
  })
})
