import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ArsenalBrowser } from "./arsenal-browser"
import type { ArmaOption, ArsenalItem } from "./types"

const ARMAS: ArmaOption[] = [
  { slug: "Weapons/Winfield M1873", nombre: "Winfield M1873", imagenUrl: "https://example.test/w.png" },
  { slug: "Weapons/Sparks LRR", nombre: "Sparks LRR", imagenUrl: "https://example.test/s.png" },
]

function item(over: Partial<ArsenalItem> & { id: string }): ArsenalItem {
  return {
    title: `Dotación ${over.id}`,
    description: "desc",
    topics: [],
    authorName: "autor",
    ratingAvg: 4,
    ratingCount: 1,
    views: 10,
    createdAt: "2026-09-01T00:00:00.000Z",
    likeCount: 0,
    armasSlugs: [],
    ...over,
  }
}

const ITEMS = [
  item({
    id: "a",
    title: "Patrulla del pantano",
    topics: ["pvp"],
    views: 50000,
    likeCount: 3,
    ratingAvg: 4.8,
    armasSlugs: ["Weapons/Winfield M1873"],
  }),
  item({
    id: "b",
    title: "Caza mayor",
    topics: ["pve"],
    views: 100,
    likeCount: 9,
    ratingAvg: 4.6,
    createdAt: "2026-09-10T00:00:00.000Z",
    armasSlugs: ["Weapons/Sparks LRR"],
  }),
]

describe("ArsenalBrowser", () => {
  it("renders the header with create link", () => {
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    expect(screen.getByRole("heading", { name: /^arsenal$/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /crear dotación/i })).toHaveAttribute(
      "href",
      "/equipo/nueva",
    )
  })

  it("filters by title search only", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    expect(screen.getAllByRole("article")).toHaveLength(2)
    await user.type(screen.getByPlaceholderText(/buscar/i), "pantano")
    expect(screen.getAllByRole("article")).toHaveLength(1)
  })

  it("toggles the estilo de juego pill", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    await user.click(screen.getByRole("button", { name: "pvp" }))
    expect(screen.getAllByRole("article")).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "pvp" }))
    expect(screen.getAllByRole("article")).toHaveLength(2)
  })

  it("filters by weapon tile and shows an empty state", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    await user.click(screen.getByRole("button", { name: /sparks lrr/i }))
    const cards = screen.getAllByRole("article")
    expect(cards).toHaveLength(1)
    expect(within(cards[0]!).getByRole("heading", { name: /caza mayor/i })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /sparks lrr/i }))
    expect(screen.getAllByRole("article")).toHaveLength(2)
    await user.type(screen.getByPlaceholderText(/buscar/i), "zzz-sin-nada")
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })

  it("orders with the four sort tabs", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    const firstTitle = () =>
      within(screen.getAllByRole("article")[0]!).getByRole("heading").textContent
    expect(firstTitle()).toMatch(/caza mayor/i)
    await user.click(screen.getByRole("button", { name: /más vistas/i }))
    expect(firstTitle()).toMatch(/pantano/i)
    await user.click(screen.getByRole("button", { name: /recientes/i }))
    expect(firstTitle()).toMatch(/caza mayor/i)
  })

  it("calls onToggleLike and updates the count", async () => {
    const user = userEvent.setup()
    const onToggleLike = vi.fn(async () => ({ liked: true, likeCount: 4 }))
    render(
      <ArsenalBrowser
        items={ITEMS}
        armas={ARMAS}
        likedIds={new Set()}
        onToggleLike={onToggleLike}
      />,
    )
    await user.click(screen.getByRole("button", { name: /3 me gusta/i }))
    expect(onToggleLike).toHaveBeenCalledWith("a")
    expect(
      await screen.findByRole("button", { name: /4 me gusta/i }),
    ).toBeInTheDocument()
  })
})
