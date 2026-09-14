import { describe, expect, it, vi, beforeEach } from "vitest"
vi.mock("server-only", () => ({}))
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase: vi.fn(() => null) }))
import { getServiceSupabase } from "@/lib/supabase/server"
import { getStreamerMembers } from "./discord-members"

const ROW = (id: string, display_name: string | null) => ({
  discord_id: id,
  community_members: {
    display_name,
    avatar_url: `https://cdn.discordapp.com/avatars/${id}/abc.png?size=256`,
    joined_at: "2026-09-01T10:00:00.000Z",
  },
  community_roles: { key: "streamer" },
})

function mockRows(rows: unknown[]) {
  vi.mocked(getServiceSupabase).mockReturnValueOnce({
    from: () => ({ select: () => ({ eq: async () => ({ data: rows, error: null }) }) }),
  } as never)
}

describe("getStreamerMembers (desde Supabase)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getServiceSupabase).mockReturnValue(null)
  })

  it("mapea las filas de DB a StreamerMember", async () => {
    mockRows([ROW("1", "StreamerUno"), ROW("2", "StreamerDos")])
    const streamers = await getStreamerMembers()
    expect(streamers?.map((s) => s.id).sort()).toEqual(["1", "2"])
    expect(streamers?.[0]).toMatchObject({ name: "StreamerUno" })
    expect(typeof streamers?.[0]?.sinceLabel).toBe("string")
  })

  it("filtra filas sin display_name", async () => {
    mockRows([ROW("1", "ConNombre"), ROW("9", null)])
    expect(await getStreamerMembers()).toMatchObject([{ id: "1" }])
  })

  it("devuelve undefined sin Supabase o sin filas", async () => {
    expect(await getStreamerMembers()).toBeUndefined()
    mockRows([])
    expect(await getStreamerMembers()).toBeUndefined()
  })
})
