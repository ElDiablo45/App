import { afterEach, describe, expect, it, vi } from "vitest"
import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import { VERIFIED_ROLE_ID } from "@/features/profile/role-medals"
import { completarRegistro } from "./registro-actions"

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }))
vi.mock("next/headers", () => ({ cookies: vi.fn() }))

const sessionMock = vi.mocked(getServerSession)
const cookiesMock = vi.mocked(cookies)

const session = {
  expires: "2099-01-01",
  user: {
    discordProfile: { id: "user-1", username: "u", displayName: "U", publicFlags: 0 },
    email: "a@b.com",
  },
}

const validInput = {
  email: "a@b.com",
  birthDate: "2000-01-15",
  nationality: "España",
  discordId: "user-1",
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function mockCookies() {
  const set = vi.fn()
  cookiesMock.mockResolvedValue({ set } as unknown as Awaited<ReturnType<typeof cookies>>)
  return set
}

describe("completarRegistro verified role", () => {
  it("grants the verified role and completes the registro", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    sessionMock.mockResolvedValue(session as never)
    const set = mockCookies()
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true })
    vi.stubGlobal("fetch", fetchMock)

    const result = await completarRegistro(validInput)

    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/members/user-1/roles/${VERIFIED_ROLE_ID}`),
      expect.objectContaining({ method: "PUT" }),
    )
    expect(set).toHaveBeenCalled()
  })

  it("still completes the registro when Discord role grant fails", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    sessionMock.mockResolvedValue(session as never)
    const set = mockCookies()
    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("down")))

    const result = await completarRegistro(validInput)

    expect(result).toEqual({ ok: true })
    expect(set).toHaveBeenCalled()
  })
})
