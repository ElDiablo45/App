import { describe, expect, it } from "vitest"
import { banderaParaPais } from "./paises"

describe("banderaParaPais", () => {
  it("España → 🇪🇸", () => {
    expect(banderaParaPais("España")).toBe("🇪🇸")
  })
  it("México → 🇲🇽", () => {
    expect(banderaParaPais("México")).toBe("🇲🇽")
  })
  it("Otro → null", () => {
    expect(banderaParaPais("Otro")).toBeNull()
  })
  it("vacío → null", () => {
    expect(banderaParaPais("")).toBeNull()
  })
})
