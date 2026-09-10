import { describe, expect, it } from "vitest"
import { PRESTIGE_LEVELS, prestigeForRoles } from "./prestige"

describe("prestigeForRoles", () => {
  it("returns undefined without prestige roles", () => {
    expect(prestigeForRoles([])).toBeUndefined()
    expect(prestigeForRoles([{ id: "999" }])).toBeUndefined()
  })

  it("maps each known role to its level", () => {
    expect(prestigeForRoles([{ id: "1518579400667303956" }])).toBe(1)
    expect(prestigeForRoles([{ id: "1518581618296492052" }])).toBe(100)
    expect(Object.keys(PRESTIGE_LEVELS)).toHaveLength(13)
  })

  it("keeps the highest level when several match", () => {
    expect(
      prestigeForRoles([
        { id: "1518579399132450877" },
        { id: "1518579380417335417" },
        { id: "1518579397454725223" },
      ]),
    ).toBe(80)
  })
})
