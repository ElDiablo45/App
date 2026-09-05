import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UserShield } from "lucide-react"
import { RoleMedalBadge } from "./role-medal"
import type { RoleMedal } from "./role-medals"

const STAFF_MEDAL: RoleMedal = {
  roleId: "1352786195482017873",
  roleName: "Staff",
  icon: UserShield,
  color: "#0080FF",
  title: "Staff",
  description: "Miembro del staff de Hunt Hispano.",
  automatic: false,
}

describe("RoleMedalBadge", () => {
  it("renders the icon tinted with its color and an Eleven-style tooltip", () => {
    const { container } = render(
      <RoleMedalBadge medal={STAFF_MEDAL} dateLabel="hace 3 días" />,
    )
    expect(container.querySelector("svg")).not.toBeNull()
    expect(
      container.querySelector(".hunt-medal")?.getAttribute("style"),
    ).toContain("rgb(0, 128, 255)")
    expect(screen.getByRole("tooltip")).toHaveTextContent("Staff")
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Miembro del staff de Hunt Hispano.",
    )
    expect(screen.getByRole("tooltip")).toHaveTextContent("hace 3 días")
  })

  it("renders an automatic dot medal with title only", () => {
    const { container } = render(
      <RoleMedalBadge
        medal={{
          roleId: "999",
          roleName: "Whitelisted",
          icon: undefined,
          color: "#3b82f6",
          title: "Whitelisted",
          description: "",
          automatic: true,
        }}
      />,
    )
    expect(container.querySelector("svg")).toBeNull()
    expect(screen.getByRole("tooltip")).toHaveTextContent("Whitelisted")
    expect(screen.queryByRole("tooltip")).not.toHaveTextContent("hace")
  })
})
