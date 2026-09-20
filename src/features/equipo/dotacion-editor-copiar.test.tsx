import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DotacionEditor } from "./dotacion-editor"

const ARMAS = [
  { slug: "Weapons/Centennial", nombre: "Centennial", imagenUrl: "https://huntshowdown.wiki.gg/images/a.png", tamano: 4, precio: 157, municion: "Medium" },
  { slug: "Weapons/Bornheim No. 3", nombre: "Bornheim", imagenUrl: "https://huntshowdown.wiki.gg/images/b.png", tamano: 1, precio: 40, municion: "Compact" },
]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("DotacionEditor con copia del Arsenal", () => {
  it("precarga título y ranuras desde initialArmaSlugs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ARMAS }) as Response),
    )
    render(
      <DotacionEditor
        title="Patrulla del pantano (copia)"
        initialArmaSlugs={["Weapons/Centennial", "Weapons/Bornheim No. 3"]}
      />,
    )

    expect(screen.getByRole("heading", { name: /patrulla del pantano \(copia\)/i })).toBeInTheDocument()
    expect(
      await screen.findByRole("button", { name: /ranura principal: centennial/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /ranura secundaria: bornheim/i }),
    ).toBeInTheDocument()
  })
})
