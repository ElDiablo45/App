import { describe, expect, it, vi } from "vitest"
import { GET } from "./route"

vi.mock("@/features/equipo/hunt-api", () => ({
  getCatalogo: vi.fn(async (kind: string) => [
    {
      slug: "Tools/Choke Bombs",
      nombre: "Choke Bombs",
      imagenUrl: "https://huntshowdown.wiki.gg/images/thumb/choke.png",
      tamano: null,
      precio: 25,
      tipo: kind,
      temas: [],
    },
  ]),
}))

describe("GET /api/catalogo", () => {
  it("devuelve herramientas live de la wiki", async () => {
    const res = await GET(new Request("http://localhost/api/catalogo?tipo=herramientas"))
    expect(res.status).toBe(200)
    const json = (await res.json()) as Array<{ nombre: string; tipo: string }>
    expect(json).toHaveLength(1)
    expect(json[0].nombre).toBe("Choke Bombs")
    expect(json[0].tipo).toBe("herramientas")
  })

  it("rechaza tipos desconocidos", async () => {
    const res = await GET(new Request("http://localhost/api/catalogo?tipo=naves"))
    expect(res.status).toBe(400)
  })
})
