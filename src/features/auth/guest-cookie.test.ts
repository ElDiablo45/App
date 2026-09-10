import { describe, expect, it } from "vitest"
import { GUEST_COOKIE, isGuestCookie } from "./guest-cookie"

describe("guest-cookie", () => {
  it("exposes the guest cookie name", () => {
    expect(GUEST_COOKIE).toBe("hh_guest")
  })

  it("detects guest cookie in header string", () => {
    expect(isGuestCookie("hh_guest=1; otro=2")).toBe(true)
    expect(isGuestCookie("otro=2")).toBe(false)
    expect(isGuestCookie(null)).toBe(false)
    expect(isGuestCookie(undefined)).toBe(false)
  })
})
