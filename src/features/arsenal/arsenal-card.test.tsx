import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ArsenalCard } from "./arsenal-card"
import type { ArmaOption, ArsenalItem } from "./types"

const ARMAS: ArmaOption[] = [
  { slug: "Weapons/Winfield M1873", nombre: "Winfield M1873", imagenUrl: "https://example.test/w.png" },
]

const ITEM: ArsenalItem = {
  id: "a",
  title: "Patrulla del pantano",
  description: "desc",
  topics: ["pvp", "solo"],
  authorName: "Villegas",
  ratingAvg: 4.8,
  ratingCount: 12,
  views: 12100,
  createdAt: "2026-09-01T00:00:00.000Z",
  likeCount: 3,
  armasSlugs: ["Weapons/Winfield M1873"],
}

function renderCard(over: Partial<Parameters<typeof ArsenalCard>[0]> = {}) {
  return render(
    <ArsenalCard
      item={ITEM}
      armas={ARMAS}
      liked={false}
      likeCount={3}
      onLike={() => {}}
      {...over}
    />,
  )
}

describe("ArsenalCard", () => {
  it("renders author, title, topics, weapon thumb and big rating", () => {
    renderCard()
    expect(screen.getByRole("heading", { name: /pantano/i })).toBeInTheDocument()
    expect(screen.getByText("Villegas")).toBeInTheDocument()
    expect(screen.getByText("pvp")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: /winfield m1873/i })).toHaveAttribute(
      "src",
      "https://example.test/w.png",
    )
    expect(screen.getByText("4.8")).toBeInTheDocument()
  })

  it("calls onLike when the like button is clicked", async () => {
    const user = userEvent.setup()
    const onLike = vi.fn()
    renderCard({ onLike })
    await user.click(screen.getByRole("button", { name: /me gusta/i }))
    expect(onLike).toHaveBeenCalledWith("a")
  })

  it("marks the button pressed when liked", () => {
    renderCard({ liked: true, likeCount: 4 })
    expect(screen.getByRole("button", { name: /4 me gusta/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  it("links to detail and to copiar", () => {
    renderCard()
    expect(screen.getByRole("link", { name: /ver dotación/i })).toHaveAttribute(
      "href",
      "/arsenal/a",
    )
    expect(screen.getByRole("link", { name: /copiar/i })).toHaveAttribute(
      "href",
      "/equipo/nueva?copiar=a",
    )
  })
})
