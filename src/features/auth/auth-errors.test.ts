import { describe, expect, it } from "vitest"
import { getAuthErrorMessage } from "./auth-errors"

describe("getAuthErrorMessage", () => {
  it("does not render an error without an error code", () => {
    expect(getAuthErrorMessage()).toBeUndefined()
  })

  it("explains a cancelled or rejected authorization", () => {
    expect(getAuthErrorMessage("AccessDenied")).toBe(
      "Has cancelado o rechazado el acceso con Discord.",
    )
  })

  it("explains an OAuth callback failure", () => {
    expect(getAuthErrorMessage("OAuthCallback")).toBe(
      "Discord no pudo completar el inicio de sesión. Inténtalo de nuevo.",
    )
  })

  it("uses a safe message for unknown provider errors", () => {
    expect(getAuthErrorMessage("secret-provider-detail")).toBe(
      "No se pudo iniciar sesión con Discord. Inténtalo de nuevo.",
    )
  })
})
