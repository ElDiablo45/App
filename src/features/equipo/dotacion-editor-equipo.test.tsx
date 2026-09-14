import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DotacionEditor } from "./dotacion-editor"

const TOOLS = [
  { slug: "Tools/Choke Bombs", nombre: "Choke Bombs", imagenUrl: "https://x/c.png", tamano: null, precio: 25, tipo: "herramientas", temas: [] },
]
const CONS = [
  { slug: "Consumables/Dynamite Stick", nombre: "Dynamite Stick", imagenUrl: "https://x/d.png", tamano: null, precio: 18, tipo: "consumibles", temas: ["explosivos"] },
]

function mockFetchEquipo(): void {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.includes("tipo=herramientas")) return { ok: true, json: async () => TOOLS } as Response
    if (url.includes("tipo=consumibles")) return { ok: true, json: async () => CONS } as Response
    return { ok: true, json: async () => [] } as Response
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("DotacionEditor con herramientas", () => {
  it("carga herramientas y consumibles al entrar al slot", async () => {
    mockFetchEquipo()
    render(<DotacionEditor title="Nueva dotación" initialSlot="herramientas" />)
    await waitFor(() => expect(screen.getByText("Choke Bombs")).toBeInTheDocument())
    expect(screen.getByText("Dynamite Stick")).toBeInTheDocument()
    expect(screen.getByText("Herramienta")).toBeInTheDocument()
    expect(screen.getByText("Consumible")).toBeInTheDocument()
  })

  it("el filtro Explosivos deja la dinamita y oculta lo demás", async () => {
    mockFetchEquipo()
    const user = userEvent.setup()
    render(<DotacionEditor title="Nueva dotación" initialSlot="herramientas" />)
    await waitFor(() => expect(screen.getByText("Choke Bombs")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: "Explosivos" }))
    expect(screen.getByText("Dynamite Stick")).toBeInTheDocument()
    expect(screen.queryByText("Choke Bombs")).not.toBeInTheDocument()
  })

  it("asigna el item al slot herramienta elegido y suma el coste", async () => {
    mockFetchEquipo()
    const user = userEvent.setup()
    render(<DotacionEditor title="Nueva dotación" initialSlot="herramientas" />)
    await waitFor(() => expect(screen.getByText("Dynamite Stick")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: "Herramienta 1" }))
    await user.click(screen.getByRole("button", { name: /dynamite stick, ◉ 18/i }))
    expect(screen.getByRole("button", { name: /herramienta 1: dynamite stick/i })).toBeInTheDocument()
    expect(screen.getByText(/coste ◉ 18/i)).toBeInTheDocument()
  })

  it("Quitar vacía el slot herramienta con click derecho", async () => {
    mockFetchEquipo()
    const user = userEvent.setup()
    render(<DotacionEditor title="Nueva dotación" initialSlot="herramientas" />)
    await waitFor(() => expect(screen.getByText("Dynamite Stick")).toBeInTheDocument())

    await user.click(screen.getByRole("button", { name: "Herramienta 1" }))
    await user.click(screen.getByRole("button", { name: /dynamite stick, ◉ 18/i }))
    const slotBtn = screen.getByRole("button", { name: /herramienta 1: dynamite stick/i })
    await user.pointer({ keys: "[MouseRight]", target: slotBtn })
    await user.click(await screen.findByRole("menuitem", { name: /quitar/i }))
    expect(screen.getByRole("button", { name: "Herramienta 1" })).toBeInTheDocument()
    expect(screen.getByText(/coste ◉ 0/i)).toBeInTheDocument()
  })
})
