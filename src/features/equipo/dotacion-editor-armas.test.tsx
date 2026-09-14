import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DotacionEditor } from "./dotacion-editor"

const ARMAS = [
  { slug: "Weapons/Centennial", nombre: "Centennial", imagenUrl: "https://huntshowdown.wiki.gg/images/a.png", tamano: 4, precio: 157, municion: "Medium" },
  { slug: "Weapons/Bornheim No. 3", nombre: "Bornheim", imagenUrl: "https://huntshowdown.wiki.gg/images/b.png", tamano: 1, precio: 40, municion: "Compact" },
]

function mockFetchOk(): void {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ARMAS }) as Response))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("DotacionEditor con armas live", () => {
  it("carga el selector desde /api/armas y asigna a la ranura activa", async () => {
    mockFetchOk()
    const user = userEvent.setup()
    render(<DotacionEditor title="Nueva dotación" />)

    await waitFor(() => expect(screen.getByText("Centennial")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /centennial/i }))
    expect(await screen.findByText(/capacidad de armas \(4\/5\)/i)).toBeInTheDocument()
    expect(screen.getByText(/coste.*157/i)).toBeInTheDocument()
  })

  it("filtra el selector con la búsqueda existente", async () => {
    mockFetchOk()
    const user = userEvent.setup()
    render(<DotacionEditor title="Nueva dotación" />)
    await waitFor(() => expect(screen.getByText("Centennial")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: /buscar/i }))
    await user.type(screen.getByPlaceholderText(/buscar/i), "bornheim")
    expect(screen.queryByText("Centennial")).not.toBeInTheDocument()
    expect(screen.getByText("Bornheim")).toBeInTheDocument()
  })

  it("rellena los pips de capacidad al asignar armas", async () => {
    mockFetchOk()
    const user = userEvent.setup()
    const { container } = render(<DotacionEditor title="Nueva dotación" />)
    await waitFor(() => expect(screen.getByText("Centennial")).toBeInTheDocument())
    expect(container.querySelectorAll(".dz-pips .dz-pip--on")).toHaveLength(0)

    await user.click(screen.getByRole("button", { name: /centennial/i }))
    expect(await screen.findByText(/capacidad de armas \(4\/5\)/i)).toBeInTheDocument()
    expect(container.querySelectorAll(".dz-pips .dz-pip--on")).toHaveLength(4)
  })

  it("la ranura muestra tooltip con nombre y precio, tamaño en cuadraditos y sin nombre visible", async () => {
    mockFetchOk()
    const user = userEvent.setup()
    const { container } = render(<DotacionEditor title="Nueva dotación" />)
    await waitFor(() => expect(screen.getByText("Centennial")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /centennial/i }))

    const tip = await screen.findByRole("tooltip", { name: /centennial.*157/i })
    expect(tip).toBeInTheDocument()
    const ranura = screen.getByRole("button", { name: /ranura principal: centennial/i })
    expect(ranura).toBeInTheDocument()
    expect(container.querySelectorAll(".dz-weapon-card .dz-pip--on")).toHaveLength(4)
  })

  it("click derecho en la ranura abre menú Quitar que desasigna el arma", async () => {
    mockFetchOk()
    const user = userEvent.setup()
    const { container } = render(<DotacionEditor title="Nueva dotación" />)
    await waitFor(() => expect(screen.getByText("Centennial")).toBeInTheDocument())
    await user.click(screen.getByRole("button", { name: /centennial, ◉ 157/i }))

    const ranura = screen.getByRole("button", { name: /ranura principal: centennial/i })
    await user.pointer({ keys: "[MouseRight]", target: ranura })
    expect(await screen.findByRole("menuitem", { name: /quitar/i })).toBeInTheDocument()

    await user.click(screen.getByRole("menuitem", { name: /quitar/i }))
    expect(screen.queryByRole("menuitem", { name: /quitar/i })).not.toBeInTheDocument()
    expect(await screen.findByText(/capacidad de armas \(0\/5\)/i)).toBeInTheDocument()
    expect(container.querySelectorAll(".dz-pips .dz-pip--on")).toHaveLength(0)
  })

  it("click derecho en ranura vacía no abre menú y Escape lo cierra", async () => {
    mockFetchOk()
    const user = userEvent.setup()
    render(<DotacionEditor title="Nueva dotación" />)
    await waitFor(() => expect(screen.getByText("Centennial")).toBeInTheDocument())

    await user.pointer({ keys: "[MouseRight]", target: screen.getByRole("button", { name: "Ranura principal" }) })
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /centennial, ◉ 157/i }))
    const ranura = screen.getByRole("button", { name: /ranura principal: centennial/i })
    await user.pointer({ keys: "[MouseRight]", target: ranura })
    expect(await screen.findByRole("menu")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })
})
