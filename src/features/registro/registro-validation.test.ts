import { describe, expect, it } from "vitest"
import {
  COUNTRIES,
  validateRegistro,
} from "./registro-validation"

const ADULT_BIRTH = "2000-01-15"

describe("validateRegistro", () => {
  it("accepts a valid email, adult birth date and optional nationality", () => {
    expect(
      validateRegistro(
        { email: "agenciadakrox@proton.me", birthDate: ADULT_BIRTH, nationality: "España" },
        new Date("2026-09-04"),
      ),
    ).toEqual({})
  })

  it("accepts an empty nationality because it is optional", () => {
    expect(
      validateRegistro(
        { email: "user@example.com", birthDate: ADULT_BIRTH, nationality: "" },
        new Date("2026-09-04"),
      ),
    ).toEqual({})
  })

  it("rejects an empty or invalid email", () => {
    expect(
      validateRegistro(
        { email: "", birthDate: ADULT_BIRTH },
        new Date("2026-09-04"),
      ).email,
    ).toBe("Introduce un email válido.")

    expect(
      validateRegistro(
        { email: "no-es-email", birthDate: ADULT_BIRTH },
        new Date("2026-09-04"),
      ).email,
    ).toBe("Introduce un email válido.")
  })

  it("rejects a missing birth date", () => {
    expect(
      validateRegistro(
        { email: "user@example.com", birthDate: "" },
        new Date("2026-09-04"),
      ).birthDate,
    ).toBe("Selecciona tu fecha de nacimiento.")
  })

  it("rejects under-18 birth dates", () => {
    expect(
      validateRegistro(
        { email: "user@example.com", birthDate: "2010-05-01" },
        new Date("2026-09-04"),
      ).birthDate,
    ).toBe("Debes tener al menos 18 años.")
  })

  it("rejects future or impossible birth dates", () => {
    expect(
      validateRegistro(
        { email: "user@example.com", birthDate: "2030-01-01" },
        new Date("2026-09-04"),
      ).birthDate,
    ).toBe("Debes tener al menos 18 años.")

    expect(
      validateRegistro(
        { email: "user@example.com", birthDate: "no-fecha" },
        new Date("2026-09-04"),
      ).birthDate,
    ).toBe("Selecciona tu fecha de nacimiento.")
  })

  it("rejects a nationality outside the country list", () => {
    expect(
      validateRegistro(
        { email: "user@example.com", birthDate: ADULT_BIRTH, nationality: "Atlantis" },
        new Date("2026-09-04"),
      ).nationality,
    ).toBe("Selecciona un país válido.")
  })

  it("exposes a Spanish country list for the select", () => {
    expect(COUNTRIES).toContain("España")
    expect(COUNTRIES).toContain("México")
    expect(COUNTRIES.length).toBeGreaterThan(20)
  })
})
