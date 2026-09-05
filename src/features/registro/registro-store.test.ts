import { describe, expect, it } from "vitest"
import {
  REGISTRO_COOKIE,
  buildRegistroCookie,
  isRegistroCompleteForDiscord,
  parseRegistroCookie,
} from "./registro-store"

const BASE = {
  email: "agenciadakrox@proton.me",
  birthDate: "2000-01-15",
  nationality: "España",
  completedAt: "2026-09-04T00:00:00.000Z",
  discordId: "1266910991384576041",
}

describe("registro-store", () => {
  it("exposes the stable cookie name", () => {
    expect(REGISTRO_COOKIE).toBe("hh_registro")
  })

  it("round-trips valid registro data through the cookie value", () => {
    const raw = buildRegistroCookie(BASE)
    expect(parseRegistroCookie(raw)).toEqual(BASE)
  })

  it("rejects missing, corrupt or incomplete cookie values", () => {
    expect(parseRegistroCookie(null)).toBeNull()
    expect(parseRegistroCookie(undefined)).toBeNull()
    expect(parseRegistroCookie("")).toBeNull()
    expect(parseRegistroCookie("no-json")).toBeNull()
    expect(
      parseRegistroCookie(JSON.stringify({ ...BASE, email: "mal" })),
    ).toBeNull()
    expect(
      parseRegistroCookie(JSON.stringify({ ...BASE, birthDate: "2015-01-01" })),
    ).toBeNull()
    expect(
      parseRegistroCookie(JSON.stringify({ ...BASE, discordId: "" })),
    ).toBeNull()
  })

  it("gates access per discord user", () => {
    const raw = buildRegistroCookie(BASE)
    expect(isRegistroCompleteForDiscord(raw, BASE.discordId)).toBe(true)
    expect(isRegistroCompleteForDiscord(raw, "otro-id")).toBe(false)
    expect(isRegistroCompleteForDiscord(null, BASE.discordId)).toBe(false)
  })
})
