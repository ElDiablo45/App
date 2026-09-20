import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ArsenalCard } from "./arsenal-card"
import type { ArsenalItem } from "./types"

const ITEM: ArsenalItem = {
  id: "a",
  title: "Patrulla del pantano",
  description: "desc",
  topics: [],
  authorName: "Villegas",
  ratingAvg: 4,
  ratingCount: 1,
  views: 10,
  createdAt: "2026-09-01T00:00:00.000Z",
  likeCount: 3,
  armasSlugs: [],
}

describe("ArsenalCard", () => {
  it("renders title, author and like count", () => {
    render(<ArsenalCard item={ITEM} liked={false} likeCount={3} onLike={() => {}} />)
    expect(screen.getByRole("heading", { name: /pantano/i })).toBeInTheDocument()
    expect(screen.getByText("Villegas")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /3 me gusta/i })).toBeInTheDocument()
  })

  it("calls onLike when the like button is clicked", async () => {
    const user = userEvent.setup()
    const onLike = vi.fn()
    render(<ArsenalCard item={ITEM} liked={false} likeCount={3} onLike={onLike} />)
    await user.click(screen.getByRole("button", { name: /me gusta/i }))
    expect(onLike).toHaveBeenCalledWith("a")
  })

  it("marks the button pressed when liked", () => {
    render(<ArsenalCard item={ITEM} liked likeCount={4} onLike={() => {}} />)
    expect(screen.getByRole("button", { name: /me gusta/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
  })

  it("links to detail and to copiar", () => {
    render(<ArsenalCard item={ITEM} liked={false} likeCount={3} onLike={() => {}} />)
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
