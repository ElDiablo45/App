import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { DotacionesGuardadas } from "./dotaciones-guardadas"

describe("DotacionesGuardadas", () => {
  it("renders esc back, serif title, one empty dotacion and create button", () => {
    render(<DotacionesGuardadas />)
    expect(screen.getByRole("link", { name: /esc/i })).toHaveAttribute("href", "/")
    expect(screen.getByRole("heading", { name: /dotaciones guardadas/i })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: /dotación 1/i })).toBeInTheDocument()
    expect(screen.getByText(/capacidad de armas \(0\/5\)/i)).toBeInTheDocument()
  })

  it("creates empty dotaciones with plus buttons up to 4, then shows unlock", async () => {
    const user = userEvent.setup()
    render(<DotacionesGuardadas />)
    const list = screen.getByRole("listbox", { name: /dotaciones/i })

    // 1 dotación + 3 huecos con +
    expect(within(list).getAllByRole("option")).toHaveLength(1)
    expect(screen.getAllByRole("button", { name: /crear dotación/i })).toHaveLength(3)
    expect(screen.queryByText(/desbloquear ranura/i)).not.toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: /crear dotación/i })[0])
    expect(screen.getByRole("option", { name: /dotación 2/i })).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: /crear dotación/i })[0])
    await user.click(screen.getAllByRole("button", { name: /crear dotación/i })[0])

    expect(screen.getByRole("option", { name: /dotación 4/i })).toBeInTheDocument()
    expect(screen.getByText(/desbloquear ranura/i)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /crear dotación/i })).not.toBeInTheDocument()
  })

  it("selects a dotacion on click", async () => {
    const user = userEvent.setup()
    render(<DotacionesGuardadas />)
    await user.click(screen.getAllByRole("button", { name: /crear dotación/i })[0])
    await user.click(screen.getByRole("option", { name: /dotación 1/i }))
    expect(screen.getByRole("option", { name: /dotación 1/i })).toHaveAttribute("aria-selected", "true")
  })

  it("links each slot to the editor with its ranura param", () => {
    render(<DotacionesGuardadas />)
    expect(screen.getByRole("link", { name: /editar ranura principal/i })).toHaveAttribute(
      "href",
      "/equipo/nueva?ranura=principal",
    )
    expect(screen.getByRole("link", { name: /editar ranura secundaria/i })).toHaveAttribute(
      "href",
      "/equipo/nueva?ranura=secundaria",
    )
    expect(screen.getByRole("link", { name: /herramienta 1/i })).toHaveAttribute(
      "href",
      "/equipo/nueva?ranura=herramientas",
    )
  })
})
