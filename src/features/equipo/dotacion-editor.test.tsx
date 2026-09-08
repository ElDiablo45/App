import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DotacionEditor } from "./dotacion-editor"

describe("DotacionEditor", () => {
  it("renders back link, order label and empty filter message", () => {
    render(<DotacionEditor title="Dotación 7" />)
    expect(screen.getByRole("link", { name: /atrás/i })).toHaveAttribute("href", "/equipo")
    expect(screen.getByRole("heading", { name: /dotación 7/i })).toBeInTheDocument()
    expect(screen.getByText(/orden: nombre/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
    expect(screen.getByText(/lista vacía debido a los filtros activos actuales/i)).toBeInTheDocument()
  })
})
