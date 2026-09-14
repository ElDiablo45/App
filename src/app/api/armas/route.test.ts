import { describe, expect, it, vi } from "vitest"
import { GET } from "./route"

vi.mock("@/features/equipo/hunt-api", () => ({
  getWeaponsCatalog: vi.fn(async () => [
    {
      slug: "Weapons/Centennial",
      nombre: "Centennial",
      imagen: "Weapon X.png",
      tamano: 4,
      precio: 157,
      municion: "Medium",
      stats: {},
      imagenUrl: "https://huntshowdown.wiki.gg/images/Weapons%2FCentennial.png",
      imagenThumbUrl: "https://huntshowdown.wiki.gg/images/thumb/Weapons%2FCentennial.png",
    },
    {
      slug: "Weapons/Bornheim No. 3",
      nombre: "Bornheim No. 3",
      imagen: "Weapon Y.png",
      tamano: 1,
      precio: 40,
      municion: "Medium",
      stats: {},
      imagenUrl: "https://huntshowdown.wiki.gg/images/Weapons%2FBornheim.png",
      imagenThumbUrl: "https://huntshowdown.wiki.gg/images/thumb/Weapons%2FBornheim.png",
    },
  ]),
}))

describe("GET /api/armas", () => {
  it("devuelve armas live de la wiki sin guardar nada", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const json = (await res.json()) as Array<{ nombre: string; imagenUrl: string; tamano: number; precio: number }>
    expect(json).toHaveLength(2)
    expect(json[0].nombre).toBe("Centennial")
    expect(json[0].imagenUrl).toContain("huntshowdown.wiki.gg")
  })
})
