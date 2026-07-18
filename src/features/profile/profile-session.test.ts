import { describe, expect, it } from "vitest"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { getDiscordProfile } from "./profile-session"

const profile: DiscordProfile = {
  id: "1",
  username: "solo",
  displayName: "Solo",
  publicFlags: 0,
}

describe("getDiscordProfile", () => {
  it("returns the normalized profile from an authenticated session", () => {
    expect(
      getDiscordProfile({
        expires: "2099-01-01",
        user: { discordProfile: profile },
      }),
    ).toBe(profile)
  })

  it("returns undefined for an unauthenticated or incomplete session", () => {
    expect(getDiscordProfile(null)).toBeUndefined()
    expect(
      getDiscordProfile({ expires: "2099-01-01", user: { name: "Solo" } }),
    ).toBeUndefined()
  })
})
