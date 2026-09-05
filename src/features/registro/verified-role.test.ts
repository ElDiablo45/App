import { afterEach, describe, expect, it, vi } from "vitest"
import { VERIFIED_ROLE_ID } from "@/features/profile/role-medals"
import { grantVerifiedRole } from "./verified-role"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("grantVerifiedRole", () => {
  it("PUTs the verified role for the member and returns true", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true })
    vi.stubGlobal("fetch", fetchMock)

    await expect(grantVerifiedRole("user-1")).resolves.toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      `https://discord.com/api/v10/guilds/guild-1/members/user-1/roles/${VERIFIED_ROLE_ID}`,
      {
        method: "PUT",
        headers: { Authorization: "Bot bot-token" },
      },
    )
  })

  it("returns false when Discord rejects without throwing", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false, status: 403 }))

    await expect(grantVerifiedRole("user-1")).resolves.toBe(false)
  })

  it("returns false when the network fails", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("down")))

    await expect(grantVerifiedRole("user-1")).resolves.toBe(false)
  })

  it("skips silently when the bot is not configured", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "")
    vi.stubEnv("DISCORD_BOT_TOKEN", "")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(grantVerifiedRole("user-1")).resolves.toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
