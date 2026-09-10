import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HelpMenu } from "./help-menu"

describe("HelpMenu", () => {
  it("opens the support dropdown with feedback items only", () => {
    render(<HelpMenu />)

    expect(screen.queryByRole("menu", { name: /ayuda y soporte/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /ayuda/i }))

    const menu = screen.getByRole("menu", { name: /ayuda y soporte/i })
    expect(menu).toBeInTheDocument()
    expect(screen.getByText("Cuéntanos")).toBeInTheDocument()
    for (const name of ["Reportar bug", "Enviar sugerencia"]) {
      expect(screen.getByRole("menuitem", { name })).toBeInTheDocument()
    }
    for (const name of [
      "Nuevo ticket",
      "Reparte amor",
      "Normativa básica",
      "Notion Eleven",
    ]) {
      expect(screen.queryByRole("menuitem", { name })).not.toBeInTheDocument()
    }
    expect(screen.queryByText("Soporte")).not.toBeInTheDocument()
    expect(screen.queryByText("Documentación")).not.toBeInTheDocument()
  })

  it("closes with Escape", () => {
    render(<HelpMenu />)

    fireEvent.click(screen.getByRole("button", { name: /ayuda/i }))
    expect(screen.getByRole("menu", { name: /ayuda y soporte/i })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("menu", { name: /ayuda y soporte/i })).not.toBeInTheDocument()
  })
})
