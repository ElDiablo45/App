import { afterEach, describe, expect, it, vi } from "vitest"
import { auditEntryDate, getFreshRoleIds, getMedalGrantedDates } from "./discord-roles"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("getFreshRoleIds", () => {
  it("fetches member roles bypassing the cache", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ roles: ["a", "b"], joined_at: "2026-01-01", nick: null }),
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(getFreshRoleIds("user-1")).resolves.toEqual(["a", "b"])
    expect(fetchMock).toHaveBeenCalledWith(
      "https://discord.com/api/v10/guilds/guild-1/members/user-1",
      expect.objectContaining({
        headers: { Authorization: "Bot bot-token" },
        cache: "no-store",
      }),
    )
  })

  it("returns null without bot config, on Discord error or network failure", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "")
    vi.stubEnv("DISCORD_BOT_TOKEN", "")
    vi.stubGlobal("fetch", vi.fn())
    await expect(getFreshRoleIds("user-1")).resolves.toBeNull()

    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }))
    await expect(getFreshRoleIds("user-1")).resolves.toBeNull()

    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("down")))
    await expect(getFreshRoleIds("user-1")).resolves.toBeNull()
  })
})

const T1 = "2026-09-01T00:00:00.000Z"
const T2 = "2026-09-03T10:00:00.000Z"
const snowflakeFor = (iso: string) =>
  ((BigInt(Date.parse(iso)) - BigInt(1420070400000)) << BigInt(22)).toString()

const auditPage = (entries: unknown[]) => ({
  ok: true,
  json: async () => ({ audit_log_entries: entries }),
})

const addEntry = (id: string, target: string, roleIds: string[]) => ({
  id,
  target_id: target,
  action_type: 25,
  changes: [{ key: "$add", new_value: roleIds.map((r) => ({ id: r })) }],
})

describe("auditEntryDate", () => {
  it("converts an audit entry snowflake to ISO", () => {
    expect(auditEntryDate(snowflakeFor(T1))).toBe(T1)
  })
})

describe("getMedalGrantedDates", () => {
  it("returns the newest $add date per requested role", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    const fetchMock = vi.fn().mockResolvedValueOnce(
      auditPage([
        addEntry(snowflakeFor(T2), "user-1", ["role-a"]),
        addEntry(snowflakeFor(T1), "user-1", ["role-a", "role-b"]),
      ]),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(getMedalGrantedDates("user-1", ["role-a", "role-b"])).resolves.toEqual({
      "role-a": T2,
      "role-b": T1,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/audit-logs?action_type=25"),
      expect.objectContaining({ headers: { Authorization: "Bot bot-token" } }),
    )
  })

  it("ignores $remove entries and other users", async () => {    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        auditPage([
          {
            id: snowflakeFor(T2),
            target_id: "user-1",
            action_type: 25,
            changes: [{ key: "$remove", new_value: [{ id: "role-a" }] }],
          },
          addEntry(snowflakeFor(T1), "other-user", ["role-a"]),
        ]),
      ),
    )

    await expect(getMedalGrantedDates("user-1", ["role-a"])).resolves.toEqual({})
  })

  it("returns {} without config, on Discord error or network failure", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "")
    vi.stubEnv("DISCORD_BOT_TOKEN", "")
    vi.stubGlobal("fetch", vi.fn())
    await expect(getMedalGrantedDates("user-1", ["role-a"])).resolves.toEqual({})

    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }))
    await expect(getMedalGrantedDates("user-1", ["role-a"])).resolves.toEqual({})

    vi.stubGlobal("fetch", vi.fn().mockRejectedValueOnce(new Error("down")))
    await expect(getMedalGrantedDates("user-1", ["role-a"])).resolves.toEqual({})
  })

  it("follows pagination until every role is found", async () => {
    vi.stubEnv("HUNT_GUILD_ID", "guild-1")
    vi.stubEnv("DISCORD_BOT_TOKEN", "bot-token")
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        auditPage([addEntry(snowflakeFor(T2), "other-user", ["role-a"])]),
      )
      .mockResolvedValueOnce(
        auditPage([addEntry(snowflakeFor(T1), "user-1", ["role-a"])]),
      )
    vi.stubGlobal("fetch", fetchMock)

    await expect(getMedalGrantedDates("user-1", ["role-a"])).resolves.toEqual({
      "role-a": T1,
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]?.[0]).toContain("&before=")
  })
})
