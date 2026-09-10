import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { DotacionEditor } from "./dotacion-editor"

describe("DotacionEditor", () => {
  it("renders ESC link, title, order label, filter chips and empty filter message", () => {
    render(<DotacionEditor title="Dotación 7" />)
    expect(screen.getByRole("link", { name: /esc/i })).toHaveAttribute("href", "/equipo")
    expect(screen.getByRole("heading", { name: /dotación 7/i })).toBeInTheDocument()
    expect(screen.getByText(/orden: nombre/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/buscar/i)).not.toBeInTheDocument()
    for (const name of ["Explosivos", "Curación", "Fuego", "Veneno", "Precisión"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument()
    }
    expect(screen.getByText(/lista vacía debido a los filtros activos actuales/i)).toBeInTheDocument()
  })

  it("renders the left column sections", () => {
    render(<DotacionEditor title="Dotación 7" />)
    expect(screen.getByText(/capacidad de armas \(0\/5\)/i)).toBeInTheDocument()
    expect(screen.getByText(/ranura principal/i)).toBeInTheDocument()
    expect(screen.getByText(/ranura secundaria/i)).toBeInTheDocument()
    expect(screen.getByText(/herramientas y consumibles/i)).toBeInTheDocument()
    expect(screen.getByText(/atributos \(0\/15\)/i)).toBeInTheDocument()
  })

  it("marks the clicked slot as active", async () => {
    const user = userEvent.setup()
    render(<DotacionEditor title="Dotación 7" />)

    const secundaria = screen.getByRole("button", { name: /ranura secundaria/i })
    expect(secundaria).toHaveAttribute("aria-pressed", "false")

    await user.click(secundaria)
    expect(secundaria).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /ranura principal/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
  })

  it("preselects the slot given by initialSlot", () => {
    render(<DotacionEditor title="Dotación 7" initialSlot="secundaria" />)
    expect(screen.getByRole("button", { name: /ranura secundaria/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  it("toggles size filters", async () => {
    const user = userEvent.setup()
    render(<DotacionEditor title="Dotación 7" />)

    const filter = screen.getByRole("button", { name: /tamaño 1/i })
    expect(filter).toHaveAttribute("aria-pressed", "false")
    await user.click(filter)
    expect(filter).toHaveAttribute("aria-pressed", "true")
  })

  it("toggles the search input from the magnifier chip", async () => {
    const user = userEvent.setup()
    render(<DotacionEditor title="Dotación 7" />)

    const search = screen.getByRole("button", { name: /buscar/i })
    expect(search).toHaveAttribute("aria-expanded", "false")

    await user.click(search)
    expect(search).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()

    await user.click(search)
    expect(screen.queryByPlaceholderText(/buscar/i)).not.toBeInTheDocument()
  })

  it("accepts search text", async () => {
    const user = userEvent.setup()
    render(<DotacionEditor title="Dotación 7" />)

    await user.click(screen.getByRole("button", { name: /buscar/i }))
    await user.type(screen.getByPlaceholderText(/buscar/i), "winchester")
    expect(screen.getByPlaceholderText(/buscar/i)).toHaveValue("winchester")
  })
})
