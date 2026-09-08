import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DotacionesGuardadas } from "./dotaciones-guardadas"

describe("DotacionesGuardadas", () => {
  it("renders back link, serif title and fixed rows", () => {
    render(<DotacionesGuardadas />)
    expect(screen.getByRole("link", { name: /atrás/i })).toHaveAttribute("href", "/")
    expect(screen.getByRole("heading", { name: /dotaciones guardadas/i })).toBeInTheDocument()
    for (const name of ["Dotación 1", "Dotación 2", "La Original", "Dotación 4", "Lebel", "Dotación 6", "Dotación 7"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
  })

  it("renders unlock row and zeroed right panel", () => {
    render(<DotacionesGuardadas />)
    expect(screen.getByText(/desbloquear ranura/i)).toBeInTheDocument()
    expect(screen.getByText(/capacidad de armas/i)).toBeInTheDocument()
    expect(screen.getByText("0/5")).toBeInTheDocument()
    expect(screen.getByText(/ranura principal/i)).toBeInTheDocument()
    expect(screen.getByText(/ranura secundaria/i)).toBeInTheDocument()
    expect(screen.getByText(/herramientas y consumibles/i)).toBeInTheDocument()
    expect(screen.getByText("0/15")).toBeInTheDocument()
  })
})
