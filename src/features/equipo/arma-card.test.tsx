import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ArmaCard } from "./arma-card"

const arma = {
  slug: "Weapons/Centennial",
  nombre: "Centennial",
  imagenUrl: "https://huntshowdown.wiki.gg/images/Weapon_Centennial.png?2a33c1",
  tamano: 4,
  precio: 157,
  municion: "Medium",
}

describe("ArmaCard", () => {
  it("muestra nombre arriba, imagen en medio y coste abajo a la derecha", () => {
    render(<ArmaCard arma={arma} />)
    expect(screen.getByText("Centennial")).toBeInTheDocument()
    const img = screen.getByRole("img", { name: /centennial/i })
    expect(img).toHaveAttribute("src", expect.stringContaining("huntshowdown.wiki.gg/images/"))
    expect(screen.getByText(/157/)).toBeInTheDocument()
  })

  it("marca seleccionada con aria-pressed y llama onSelect al pulsar", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<ArmaCard arma={arma} seleccionada onSelect={onSelect} />)
    const btn = screen.getByRole("button", { name: /centennial/i })
    expect(btn).toHaveAttribute("aria-pressed", "true")
    await user.click(btn)
    expect(onSelect).toHaveBeenCalledWith(arma)
  })

  it("marca bloqueada cuando no cabe en capacidad", () => {
    render(<ArmaCard arma={arma} bloqueada />)
    expect(screen.getByRole("button", { name: /centennial/i })).toHaveAttribute("aria-disabled", "true")
  })

  it("muestra con cuadraditos cuántos espacios ocupa", () => {
    const { container } = render(<ArmaCard arma={arma} />)
    expect(screen.getByRole("button", { name: /tamaño 4 de 5/i })).toBeInTheDocument()
    expect(container.querySelectorAll(".dz-arma-size .dz-pip--on")).toHaveLength(4)
    expect(container.querySelectorAll(".dz-arma-size span")).toHaveLength(5)
  })

  it("un item sin tamaño no muestra pips pero sí su tipo", () => {
    const { container } = render(
      <ArmaCard arma={{ slug: "Tools/Choke Bombs", nombre: "Choke Bombs", imagenUrl: "https://x/y.png", tamano: null, precio: 25, tipo: "herramientas" }} />,
    )
    expect(container.querySelector(".dz-arma-size")).not.toBeInTheDocument()
    expect(screen.getByText("Herramienta")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /choke bombs, ◉ 25/i })).toBeInTheDocument()
  })
})
