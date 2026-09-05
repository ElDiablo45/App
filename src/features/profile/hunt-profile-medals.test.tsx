import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { HuntProfile } from "./hunt-profile"
import type { DiscordProfile } from "@/features/discord/discord-profile"

const profile: DiscordProfile = {
  id: "1266910991384576041",
  username: "joelernesto_50000",
  displayName: "joelernesto_50000",
  publicFlags: 0,
}

const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString()

describe("HuntProfile medals", () => {
  it("renders only mapped role medals without crashing", () => {
    const { container } = render(
      <HuntProfile
        profile={profile}
        discordRoles={[
          { id: "1352786195482017873", name: "Staff", color: "#ff0000" },
          { id: "999", name: "Whitelisted", color: "#3b82f6" },
        ]}
        huntMember={{ joinedAt: threeDaysAgo, nick: null }}
      />,
    )
    const medals = container.querySelectorAll(".hunt-medal")
    expect(medals).toHaveLength(1)
    expect(screen.getByRole("tooltip")).toHaveTextContent("Staff")
    expect(screen.getByRole("tooltip")).toHaveTextContent("hace 3 días")
    expect(screen.queryByText("Whitelisted", { selector: ".hunt-medal-tip strong" })).not.toBeInTheDocument()
  })

  it("shows an empty state when there are no mapped medals", () => {
    render(<HuntProfile profile={profile} discordRoles={[]} huntMember={null} />)
    expect(screen.getByText(/sin medallas todavía/i)).toBeInTheDocument()
  })

  it("shows the Verificado pill and dated medal with the verified role", () => {
    const { container } = render(
      <HuntProfile
        profile={profile}
        discordRoles={[
          { id: "1545800486215487599", name: "Verificado", color: "#999999" },
        ]}
        huntMember={{ joinedAt: threeDaysAgo, nick: null }}
        verifiedAt={threeDaysAgo}
      />,
    )
    expect(container.querySelector(".hunt-verified")).toHaveTextContent(
      "Verificado",
    )
    expect(screen.getByRole("tooltip")).toHaveTextContent("Verificado")
    expect(screen.getByRole("tooltip")).toHaveTextContent("hace 3 días")
  })

  it("hides the Verificado pill without the verified role", () => {
    const { container } = render(
      <HuntProfile
        profile={profile}
        discordRoles={[
          { id: "1352786195482017873", name: "Staff", color: "#0080FF" },
        ]}
        huntMember={{ joinedAt: threeDaysAgo, nick: null }}
      />,
    )
    expect(container.querySelector(".hunt-verified")).toBeNull()
  })
})

describe("HuntProfile info and activity", () => {
  const props = {
    profile,
    discordRoles: [
      { id: "1545800486215487599", name: "Verificado", color: "#999999" },
    ],
    huntMember: { joinedAt: tenDaysAgo, nick: null },
    verifiedAt: threeDaysAgo,
  }

  it("adds Verificado and Discord-join rows to INFO", () => {
    render(<HuntProfile {...props} />)
    expect(screen.getByText(/verificado hace 3 días/i)).toBeInTheDocument()
    expect(screen.getByText(/se unió al discord/i)).toBeInTheDocument()
  })

  it("opens Actividad with the real-dates timeline", async () => {
    const user = userEvent.setup()
    render(<HuntProfile {...props} />)

    await user.click(screen.getByRole("button", { name: /actividad/i }))

    expect(screen.getByText('Obtuvo la insignia "Verificado"')).toBeInTheDocument()
    expect(screen.getByText("Verificó su cuenta")).toBeInTheDocument()
    expect(screen.getByText("Se unió al Discord")).toBeInTheDocument()
    expect(screen.getByText("hace 10 días")).toBeInTheDocument()
  })

  it("prefers audit-log dates over join date in tooltip and activity", async () => {
    const user = userEvent.setup()
    render(
      <HuntProfile
        profile={profile}
        discordRoles={[
          { id: "1352786195482017873", name: "Staff", color: "#0080FF" },
        ]}
        huntMember={{ joinedAt: threeYearsAgo, nick: null }}
        medalDates={{ "1352786195482017873": oneDayAgo }}
      />,
    )

    expect(screen.getByRole("tooltip")).toHaveTextContent("ayer")

    await user.click(screen.getByRole("button", { name: /actividad/i }))

    expect(screen.getByText('Obtuvo la insignia "Staff"')).toBeInTheDocument()
    // "ayer" en el tooltip y en la fila de actividad (ambos usan la fecha del audit-log)
    expect(screen.getAllByText("ayer")).toHaveLength(2)
  })
})
