import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { ArsenalBrowser } from "./arsenal-browser"
import type { ArsenalItem } from "./types"

const ARMAS = [
  { slug: "Weapons/Winfield M1873", nombre: "Winfield M1873" },
  { slug: "Weapons/Sparks LRR", nombre: "Sparks LRR" },
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
  item({ id: "a", title: "Patrulla del pantano", likeCount: 3, armasSlugs: ["Weapons/Winfield M1873"] }),
  item({ id: "b", title: "Caza mayor", likeCount: 9, createdAt: "2026-09-10T00:00:00.000Z", armasSlugs: ["Weapons/Sparks LRR"] }),
]

describe("ArsenalBrowser", () => {
  it("renders items and filters by title search", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    expect(screen.getAllByRole("article")).toHaveLength(2)
    await user.type(screen.getByPlaceholderText(/buscar dotaciones/i), "pantano")
    expect(screen.getAllByRole("article")).toHaveLength(1)
    expect(screen.getByRole("heading", { name: /pantano/i })).toBeInTheDocument()
  })

  it("filters by arma and shows an empty state", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    await user.selectOptions(screen.getByLabelText(/arma/i), ["Weapons/Sparks LRR"])
    const cards = screen.getAllByRole("article")
    expect(cards).toHaveLength(1)
    expect(within(cards[0]!).getByRole("heading", { name: /caza mayor/i })).toBeInTheDocument()
    await user.type(screen.getByPlaceholderText(/buscar dotaciones/i), "zzz-sin-nada")
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })

  it("switches order with sort tabs", async () => {
    const user = userEvent.setup()
    render(<ArsenalBrowser items={ITEMS} armas={ARMAS} />)
    await user.click(screen.getByRole("button", { name: /recientes/i }))
    const headings = screen.getAllByRole("heading")
    expect(headings[0]).toHaveTextContent(/caza mayor/i)
  })
})
