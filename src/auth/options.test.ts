import { describe, expect, it } from "vitest"
import { authOptions, toAuthUser } from "./options"

describe("Discord auth options", () => {
  it("requests only identify and uses an eight-hour JWT session", () => {
    const provider = authOptions.providers[0]

    expect(provider.id).toBe("discord")
    expect(provider.options?.authorization).toEqual({
      params: { scope: "identify" },
    })
    expect(authOptions.session).toEqual({ strategy: "jwt", maxAge: 28_800 })
  })

  it("maps the provider response without an email or OAuth token", () => {
    expect(
      toAuthUser({
        id: "1",
        username: "solo",
        global_name: "Solo",
        avatar: null,
      }),
    ).toEqual({
      id: "1",
      name: "Solo",
      email: null,
      image: null,
      discordProfile: {
        id: "1",
        username: "solo",
        displayName: "Solo",
        publicFlags: 0,
      },
    })
  })
})
