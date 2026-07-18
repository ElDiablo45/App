import { describe, expect, it } from "vitest"
import { normalizeDiscordProfile } from "./discord-profile"

describe("normalizeDiscordProfile", () => {
  it("maps the Discord identify response into safe display fields", () => {
    expect(
      normalizeDiscordProfile({
        id: "80351110224678912",
        username: "nelly",
        global_name: "Nelly",
        avatar: "a_avatarhash",
        banner: "bannerhash",
        accent_color: 5793266,
        locale: "es-ES",
        public_flags: 64,
        avatar_decoration_data: { asset: "decoration", sku_id: "1" },
        primary_guild: {
          identity_guild_id: "123",
          identity_enabled: true,
          tag: "DISC",
          badge: "badgehash",
        },
      }),
    ).toEqual({
      id: "80351110224678912",
      username: "nelly",
      displayName: "Nelly",
      avatarUrl:
        "https://cdn.discordapp.com/avatars/80351110224678912/a_avatarhash.gif?size=256",
      bannerUrl:
        "https://cdn.discordapp.com/banners/80351110224678912/bannerhash.png?size=600",
      accentColor: "#5865f2",
      locale: "es-ES",
      publicFlags: 64,
      avatarDecorationUrl:
        "https://cdn.discordapp.com/avatar-decoration-presets/decoration.png?size=96&passthrough=true",
      primaryGuild: {
        id: "123",
        tag: "DISC",
        badgeUrl:
          "https://cdn.discordapp.com/clan-badges/123/badgehash.png?size=64",
      },
    })
  })

  it("uses the username and omits optional fields for a minimal profile", () => {
    expect(normalizeDiscordProfile({ id: "1", username: "solo" })).toEqual({
      id: "1",
      username: "solo",
      displayName: "solo",
      publicFlags: 0,
    })
  })

  it("ignores a primary guild whose identity is disabled", () => {
    const result = normalizeDiscordProfile({
      id: "1",
      username: "solo",
      primary_guild: {
        identity_guild_id: "123",
        identity_enabled: false,
        tag: "OFF",
        badge: "badgehash",
      },
    })

    expect(result.primaryGuild).toBeUndefined()
  })
})
