import { describe, expect, it } from "vitest"
import { Award, BadgeCheck, Video, Wrench } from "lucide-react"
import { ROLE_MEDALS, VERIFIED_ROLE_ID, medalsForRoles } from "./role-medals"

describe("medalsForRoles", () => {
  it("maps the staff role id to the Wrench medal in #0080FF", () => {
    const medals = medalsForRoles([
      { id: "1352786195482017873", name: "Staff", color: "#ff0000" },
    ])
    expect(medals).toHaveLength(1)
    expect(medals[0]).toEqual({
      roleId: "1352786195482017873",
      roleName: "Staff",
      icon: Wrench,
      color: "#0080FF",
      title: "Staff",
      description: "Miembro del staff de Hunt Hispano.",
      automatic: false,
    })
  })

  it("exposes the staff mapping in ROLE_MEDALS", () => {
    expect(ROLE_MEDALS["1352786195482017873"]?.icon).toBe(Wrench)
    expect(ROLE_MEDALS["1352786195482017873"]?.color).toBe("#0080FF")
  })

  it("maps the streamer role to a pastel-purple Video medal", () => {
    const medals = medalsForRoles([
      { id: "1352786191593767022", name: "Streamer", color: "#999999" },
    ])
    expect(medals).toHaveLength(1)
    expect(medals[0]).toMatchObject({
      roleId: "1352786191593767022",
      icon: Video,
      color: "#c4b5fd",
      title: "Streamer",
      automatic: false,
    })
  })

  it("maps the prestigio 100 role to a golden Award medal", () => {
    const medals = medalsForRoles([
      { id: "1518581618296492052", name: "Prestigio", color: "#999999" },
    ])
    expect(medals).toHaveLength(1)
    expect(medals[0]).toMatchObject({
      roleId: "1518581618296492052",
      icon: Award,
      color: "#d8960e",
      title: "Prestigio 100",
      automatic: false,
    })
  })

  it("maps the verified role id to the BadgeCheck medal", () => {
    expect(VERIFIED_ROLE_ID).toBe("1545800486215487599")
    const medals = medalsForRoles([
      { id: "1545800486215487599", name: "Verificado", color: "#999999" },
    ])
    expect(medals).toHaveLength(1)
    expect(medals[0]).toEqual({
      roleId: "1545800486215487599",
      roleName: "Verificado",
      icon: BadgeCheck,
      color: "#22c55e",
      title: "Verificado",
      description: "Aceptaste los términos y condiciones de Hunt Hispano.",
      automatic: false,
    })
    expect(ROLE_MEDALS["1545800486215487599"]?.icon).toBe(BadgeCheck)
  })

  it("ignores unmapped roles (only mapped medals are shown)", () => {
    const medals = medalsForRoles([
      { id: "999", name: "Whitelisted", color: "#3b82f6" },
    ])
    expect(medals).toEqual([])
  })

  it("returns an empty list when there are no roles", () => {
    expect(medalsForRoles([])).toEqual([])
  })
})
