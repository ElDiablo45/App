import { describe, expect, it } from "vitest"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { exposeDiscordProfile, persistDiscordProfile } from "./session"

const profile: DiscordProfile = {
  id: "1",
  username: "solo",
  displayName: "Solo",
  publicFlags: 0,
}

describe("Auth session callbacks", () => {
  it("stores the normalized profile in the encrypted JWT", () => {
    expect(
      persistDiscordProfile(
        { accessToken: "server-only" },
        { discordProfile: profile },
      ),
    ).toEqual({
      accessToken: "server-only",
      discordProfile: profile,
    })
  })

  it("leaves an existing JWT unchanged when no user signs in", () => {
    const token = { discordProfile: profile, sub: "1" }

    expect(persistDiscordProfile(token)).toBe(token)
  })

  it("exposes the normalized profile without OAuth tokens", () => {
    expect(
      exposeDiscordProfile(
        { user: { name: "Solo" }, expires: "2099-01-01" },
        {
          discordProfile: profile,
          accessToken: "must-not-leak",
          refreshToken: "must-not-leak",
        },
      ),
    ).toEqual({
      user: { name: "Solo", discordProfile: profile },
      expires: "2099-01-01",
    })
  })

  it("does not invent a profile when the token has none", () => {
    expect(
      exposeDiscordProfile(
        { user: { name: "Solo" }, expires: "2099-01-01" },
        {},
      ),
    ).toEqual({ user: { name: "Solo" }, expires: "2099-01-01" })
  })
})
