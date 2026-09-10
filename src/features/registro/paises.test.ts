import { describe, expect, it } from "vitest"
import { banderaImgUrl, banderaParaPais, isoDePais } from "./paises"

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

describe("isoDePais", () => {
  it("México → MX", () => {
    expect(isoDePais("México")).toBe("MX")
  })
  it("Otro → null", () => {
    expect(isoDePais("Otro")).toBeNull()
  })
})

describe("banderaImgUrl", () => {
  it("devuelve imagen flagcdn para México", () => {
    expect(banderaImgUrl("México")).toBe("https://flagcdn.com/w80/mx.png")
  })
  it("Otro → null", () => {
    expect(banderaImgUrl("Otro")).toBeNull()
  })
})
