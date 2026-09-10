import { describe, expect, it } from "vitest"
import { authOptions, toAuthUser } from "./options"

describe("Discord auth options", () => {
  it("requests identify and email and uses a thirty-day JWT session", () => {
    const provider = authOptions.providers[0]

    expect(provider.id).toBe("discord")
    expect(provider.options?.authorization).toEqual({
      params: { scope: "identify email" },
    })
    expect(authOptions.session).toEqual({
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
    })
  })

  it("wires a stable secret from NEXTAUTH_SECRET or AUTH_SECRET", () => {
    expect("secret" in authOptions).toBe(true)
    expect(authOptions.secret).toBe(
      process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    )
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
