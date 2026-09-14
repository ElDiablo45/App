import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { HomeStreamers } from "./home-streamers"

const MEMBERS = [
  { id: "111", name: "Alex", avatarUrl: "https://cdn.discordapp.com/avatars/111/a.png", sinceLabel: "2 días", flags: [] },
  { id: "222", name: "Momo", avatarUrl: "https://cdn.discordapp.com/avatars/222/b.png", sinceLabel: "hoy", flags: [] },
]

describe("HomeStreamers", () => {
  it("abre el popup in-app al clicar y cierra con Escape", async () => {
    const user = userEvent.setup()
    render(<HomeStreamers members={MEMBERS} />)

    expect(screen.getByRole("heading", { name: /streamers de la comunidad/i })).toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: /alex/i })[0])
    const dialog = screen.getByRole("dialog", { name: /perfil de alex/i })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveTextContent("2 días")
    expect(screen.getByRole("link", { name: /abrir en discord/i })).toHaveAttribute(
      "href",
      "https://discord.com/users/111",
    )

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("muestra vacío sin streamers", () => {
    render(<HomeStreamers members={[]} />)
    expect(screen.getByText(/aún no hay streamers/i)).toBeInTheDocument()
  })
})
