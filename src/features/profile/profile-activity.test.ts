import { describe, expect, it } from "vitest"
import { MAX_ACTIVITY_EVENTS, buildActivity } from "./profile-activity"

const JOINED = "2026-08-25T10:00:00.000Z"
const REGISTRO = "2026-09-01T10:00:00.000Z"

const base = {
  guildJoinedAt: JOINED,
  registroAt: REGISTRO,
  verifiedAt: REGISTRO,
  medals: [
    { title: "Verificado", verified: true, at: REGISTRO },
    { title: "Staff", verified: false, at: JOINED },
  ],
}

describe("buildActivity", () => {
  it("builds relevant rows ordered recent-first", () => {
    const events = buildActivity(base)

    expect(events.map((e) => e.label)).toEqual([
      'Obtuvo la insignia "Verificado"',
      "Verificó su cuenta",
      "Creó su cuenta en Hunt Hispano",
      'Obtuvo la insignia "Staff"',
      "Se unió al Discord",
    ])
    expect(events[0]?.at).toBe(REGISTRO)
    expect(events[4]?.at).toBe(JOINED)
  })

  it("omits verification rows without dates and keeps the rest", () => {
    const events = buildActivity({
      guildJoinedAt: JOINED,
      registroAt: null,
      verifiedAt: null,
      medals: [],
    })

    expect(events.map((e) => e.label)).toEqual(["Se unió al Discord"])
  })

  it("returns an empty list without any data", () => {
    expect(
      buildActivity({
        guildJoinedAt: null,
        registroAt: null,
        verifiedAt: null,
        medals: [],
      }),
    ).toEqual([])
  })

  it("puts undated medal rows last", () => {
    const events = buildActivity({
      ...base,
      guildJoinedAt: null,
      medals: [
        { title: "Verificado", verified: true, at: REGISTRO },
        { title: "Staff", verified: false, at: null },
      ],
    })

    expect(events[events.length - 1]).toMatchObject({
      label: 'Obtuvo la insignia "Staff"',
      at: null,
    })
  })

  it(`keeps at most ${MAX_ACTIVITY_EVENTS} events, dropping the oldest`, () => {
    const medals = Array.from({ length: 7 }, (_, i) => ({
      title: `Medal${i}`,
      verified: false,
      at: `2026-08-${String(10 + i).padStart(2, "0")}T10:00:00.000Z`,
    }))
    const events = buildActivity({ ...base, medals })

    expect(MAX_ACTIVITY_EVENTS).toBe(6)
    expect(events).toHaveLength(6)
    expect(events[0]?.at).toBe(REGISTRO)
    expect(events.map((e) => e.label)).toContain("Se unió al Discord")
    expect(events.map((e) => e.label)).not.toContain('Obtuvo la insignia "Medal0"')
    expect(events.map((e) => e.label)).not.toContain('Obtuvo la insignia "Medal1"')
    expect(events.map((e) => e.label)).not.toContain('Obtuvo la insignia "Medal2"')
  })
})
