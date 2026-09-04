import { describe, expect, it } from "vitest"
import { MOCK_LOADOUTS } from "./data"
import { filterLoadouts, sortLoadouts } from "./equipo-filter"

describe("filterLoadouts", () => {
  it("filters by title, topic and author", () => {
    expect(filterLoadouts(MOCK_LOADOUTS, "escudos", "").length).toBe(1)
    expect(filterLoadouts(MOCK_LOADOUTS, "", "pvp").length).toBe(1)
    expect(filterLoadouts(MOCK_LOADOUTS, "bazeso", "").length).toBe(2)
  })

  it("returns all on empty query and topic", () => {
    expect(filterLoadouts(MOCK_LOADOUTS, "  ", "")).toEqual(MOCK_LOADOUTS)
  })
})

describe("sortLoadouts", () => {
  it("sorts by latest, views and rating without mutating input", () => {
    const input = [...MOCK_LOADOUTS]
    const byViews = sortLoadouts(input, "views")
    expect(byViews[0]!.views).toBeGreaterThanOrEqual(byViews[1]!.views)
    const latest = sortLoadouts(input, "latest")
    expect(new Date(latest[0]!.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(latest[1]!.createdAt).getTime(),
    )
    expect(input.map((l) => l.id)).toEqual(MOCK_LOADOUTS.map((l) => l.id))
  })
})
