import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ArsenalDetail } from "./arsenal-detail"
import type { ArsenalItem } from "./types"

const ITEM: ArsenalItem = {
  id: "a",
  title: "Patrulla del pantano",
  description: "Roles y equipo mínimo.",
  topics: [],
  authorName: "Villegas",
  ratingAvg: 4,
  ratingCount: 1,
  views: 10,
  createdAt: "2026-09-01T00:00:00.000Z",
  likeCount: 3,
  armasSlugs: ["Weapons/Winfield M1873"],
}

describe("ArsenalDetail", () => {
  it("renders full info and toggles like", async () => {
    const user = userEvent.setup()
    const onToggleLike = vi.fn(async () => ({ liked: true, likeCount: 4 }))
    render(
      <ArsenalDetail item={ITEM} initialLiked={false} onToggleLike={onToggleLike} />,
    )
    expect(screen.getByRole("heading", { name: /pantano/i })).toBeInTheDocument()
    expect(screen.getByText(/roles y equipo mínimo/i)).toBeInTheDocument()
    expect(screen.getByText("Weapons/Winfield M1873")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /3 me gusta/i }))
    expect(onToggleLike).toHaveBeenCalledWith("a")
    expect(
      await screen.findByRole("button", { name: /4 me gusta/i }),
    ).toBeInTheDocument()
  })

  it("links copiar to the editor with copiar param", () => {
    render(
      <ArsenalDetail item={ITEM} initialLiked={false} onToggleLike={async () => ({ liked: true, likeCount: 4 })} />,
    )
    expect(screen.getByRole("link", { name: /copiar/i })).toHaveAttribute(
      "href",
      "/equipo/nueva?copiar=a",
    )
  })
})
