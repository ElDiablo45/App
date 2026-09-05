import { beforeEach, describe, expect, it, vi } from "vitest"
import { revalidateCurrentPage, syncRoles } from "./refresh-action"

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock("next/cache", () => ({ revalidatePath }))

const { getServerSession } = vi.hoisted(() => ({ getServerSession: vi.fn() }))
vi.mock("next-auth", () => ({ getServerSession }))

const { cookies } = vi.hoisted(() => ({ cookies: vi.fn() }))
vi.mock("next/headers", () => ({ cookies }))

const { getFreshRoleIds } = vi.hoisted(() => ({ getFreshRoleIds: vi.fn() }))
vi.mock("@/features/profile/discord-roles", () => ({ getFreshRoleIds }))

const sessionMock = vi.mocked(getServerSession)
const cookiesMock = vi.mocked(cookies)
const freshMock = vi.mocked(getFreshRoleIds)

const session = {
  expires: "2099-01-01",
  user: {
    discordProfile: { id: "user-1", username: "u", displayName: "U", publicFlags: 0 },
  },
}

function mockCookieStore(raw?: string) {
  const set = vi.fn()
  const get = vi.fn().mockReturnValue(raw ? { value: raw } : undefined)
  cookiesMock.mockResolvedValue({ get, set } as unknown as Awaited<ReturnType<typeof cookies>>)
  return set
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("revalidateCurrentPage", () => {
  it("revalidates the given internal path", async () => {
    await expect(revalidateCurrentPage("/perfil")).resolves.toEqual({ ok: true })
    expect(revalidatePath).toHaveBeenCalledWith("/perfil")
  })

  it("rejects external or malformed paths", async () => {
    await expect(revalidateCurrentPage("https://evil.com")).resolves.toEqual({
      ok: false,
    })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe("syncRoles", () => {
  const baseline = (ids: string[]) =>
    JSON.stringify({ discordId: "user-1", ids })

  it("reports no change when roles match the baseline", async () => {
    sessionMock.mockResolvedValue(session as never)
    const set = mockCookieStore(baseline(["a", "b"]))
    freshMock.mockResolvedValueOnce(["b", "a"])

    await expect(syncRoles("/perfil")).resolves.toEqual({ ok: true, changed: false })
    expect(revalidatePath).toHaveBeenCalledWith("/perfil")
    expect(set).toHaveBeenCalled()
  })

  it("reports a change when roles differ and rewrites the baseline", async () => {
    sessionMock.mockResolvedValue(session as never)
    const set = mockCookieStore(baseline(["a"]))
    freshMock.mockResolvedValueOnce(["a", "c"])

    await expect(syncRoles("/perfil")).resolves.toEqual({ ok: true, changed: true })
    expect(set).toHaveBeenCalledWith(
      "hh_roles",
      baseline(["a", "c"]),
      expect.objectContaining({ httpOnly: true, path: "/" }),
    )
  })

  it("establishes the baseline silently on first sync", async () => {
    sessionMock.mockResolvedValue(session as never)
    mockCookieStore(undefined)
    freshMock.mockResolvedValueOnce(["a"])

    await expect(syncRoles("/perfil")).resolves.toEqual({ ok: true, changed: false })
  })

  it("fails closed without session, fresh roles or valid path", async () => {
    sessionMock.mockResolvedValueOnce(null)
    mockCookieStore(baseline(["a"]))
    await expect(syncRoles("/perfil")).resolves.toEqual({ ok: false })
    expect(revalidatePath).not.toHaveBeenCalled()

    sessionMock.mockResolvedValue(session as never)
    freshMock.mockResolvedValueOnce(null)
    await expect(syncRoles("/perfil")).resolves.toEqual({ ok: false })

    freshMock.mockResolvedValueOnce(["a"])
    await expect(syncRoles("https://evil.com")).resolves.toEqual({ ok: false })
  })
})
