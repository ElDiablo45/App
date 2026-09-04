import { describe, expect, it, vi } from "vitest"
import { getLoadouts, mapRowToLoadout } from "./loadouts"
import { MOCK_LOADOUTS } from "./data"

const { getServiceSupabase } = vi.hoisted(() => ({ getServiceSupabase: vi.fn() }))
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase }))

describe("mapRowToLoadout", () => {
  it("maps a DB row to the UI type", () => {
    const l = mapRowToLoadout({
      id: "r1", owner_discord_id: "1", owner_name: "Solo", owner_avatar_url: null,
      title: "T", description: "D", topics: ["pvp"], cover_url: null, body: {},
      rating_avg: 4.5, rating_count: 10, views: 100,
      created_at: "2026-09-01T00:00:00.000Z", updated_at: "2026-09-01T00:00:00.000Z",
    })
    expect(l).toEqual({
      id: "r1", title: "T", description: "D", topics: ["pvp"],
      authorName: "Solo", authorAvatarUrl: undefined, coverUrl: undefined,
      ratingAvg: 4.5, ratingCount: 10, views: 100, createdAt: "2026-09-01T00:00:00.000Z",
    })
  })
})

describe("getLoadouts", () => {
  it("falls back to mocks when Supabase is not configured", async () => {
    getServiceSupabase.mockReturnValueOnce(null)
    await expect(getLoadouts()).resolves.toBe(MOCK_LOADOUTS)
  })

  it("falls back to mocks when the query throws", async () => {
    getServiceSupabase.mockReturnValueOnce({
      from: () => ({ select: () => ({ order: () => { throw new Error("db down") } }) }),
    })
    await expect(getLoadouts()).resolves.toBe(MOCK_LOADOUTS)
  })
})
