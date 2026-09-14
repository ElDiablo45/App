import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ArmaGrid } from "./arma-grid"

const armas = [
  { slug: "Weapons/Centennial", nombre: "Centennial", imagenUrl: "https://huntshowdown.wiki.gg/images/a.png", tamano: 4, precio: 157 },
  { slug: "Weapons/Bornheim No. 3", nombre: "Bornheim", imagenUrl: "https://huntshowdown.wiki.gg/images/b.png", tamano: 1, precio: 40 },
]

describe("ArmaGrid", () => {
  it("muestra las armas y filtra por texto y tamaño", async () => {
    render(<ArmaGrid armas={armas} query="cent" tamanos={[]} capacidadRestante={5} />)
    expect(screen.getByText("Centennial")).toBeInTheDocument()
    expect(screen.queryByText("Bornheim")).not.toBeInTheDocument()
  })

  it("filtra por tamaño y bloquea lo que no cabe", () => {
    render(<ArmaGrid armas={armas} query="" tamanos={[1]} capacidadRestante={5} />)
    expect(screen.queryByText("Centennial")).not.toBeInTheDocument()
    expect(screen.getByText("Bornheim")).toBeInTheDocument()
  })

  it("llama onSelect con el arma pulsada", async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<ArmaGrid armas={armas} query="" tamanos={[]} capacidadRestante={5} onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: /centennial/i }))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Centennial" }))
  })

  it("muestra mensaje vacío cuando nada coincide", () => {
    render(<ArmaGrid armas={armas} query="zzz" tamanos={[]} capacidadRestante={5} />)
    expect(screen.getByText(/lista vacía debido a los filtros activos actuales/i)).toBeInTheDocument()
  })

  it("la lista vive en un cajón con scroll propio", () => {
    const { container } = render(<ArmaGrid armas={armas} query="" tamanos={[]} capacidadRestante={5} />)
    expect(container.querySelector(".dz-arma-scroll")).toBeInTheDocument()
  })

  it("filtra por temas cuando hay alguno activo", () => {
    const items = [
      { ...armas[0], tipo: "consumibles" as const, temas: ["explosivos"] },
      { ...armas[1], tipo: "herramientas" as const, temas: [] },
    ]
    render(<ArmaGrid armas={items} query="" tamanos={[]} temas={["explosivos"]} capacidadRestante={5} />)
    expect(screen.getByText("Centennial")).toBeInTheDocument()
    expect(screen.queryByText("Bornheim")).not.toBeInTheDocument()
  })
})
