import { describe, expect, it, vi } from "vitest"
vi.mock("server-only", () => ({}))
vi.mock("@/lib/supabase/server", () => ({ getServiceSupabase: vi.fn(() => null) }))
import { getServiceSupabase } from "@/lib/supabase/server"
import { getUserByDiscordId, upsertUser } from "./users-repo"

describe("users-repo", () => {
  it("returns null without supabase configured", async () => {
    await expect(getUserByDiscordId("123")).resolves.toBeNull()
  })

  it("reports unconfigured supabase on upsert", async () => {
    await expect(
      upsertUser({
        discord_id: "1",
        email: "a@b.com",
        birth_date: "2000-01-15",
      }),
    ).resolves.toEqual({ ok: false, error: "Supabase no configurado" })
  })

  it("upserts only minimal columns with verified_at", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(getServiceSupabase).mockReturnValueOnce({
      from: () => ({ upsert }),
    } as never)

    const result = await upsertUser({
      discord_id: "user-1",
      email: "a@b.com",
      birth_date: "2000-01-15",
      nationality: "España",
      verified_at: "2026-09-10T00:00:00.000Z",
    })

    expect(result).toEqual({ ok: true })
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        discord_id: "user-1",
        email: "a@b.com",
        birth_date: "2000-01-15",
        nationality: "España",
        verified_at: "2026-09-10T00:00:00.000Z",
      }),
      { onConflict: "discord_id" },
    )
    const payload = upsert.mock.calls[0][0] as Record<string, unknown>
    expect(payload).not.toHaveProperty("display_name")
    expect(payload).not.toHaveProperty("avatar_url")
  })
})
