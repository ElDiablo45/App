import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LoadoutCard } from "./loadout-card"
import { EquipoHeader } from "./equipo-header"
import { MOCK_LOADOUTS } from "./data"

describe("LoadoutCard", () => {
  it("renders author, title, topics, rating and relative date", () => {
    render(<LoadoutCard item={MOCK_LOADOUTS[0]!} />)
    expect(screen.getByText("drpenguin")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: /farmeo xp/i })).toBeInTheDocument()
    expect(screen.getByText("4.6")).toBeInTheDocument()
  })
})

describe("EquipoHeader", () => {
  it("disables create with a hint when registro is incomplete", () => {
    render(<EquipoHeader registroComplete={false} />)
    const btn = screen.getByRole("button", { name: /crear equipo/i })
    expect(btn).toBeDisabled()
    expect(screen.getByText(/próximamente/i)).toBeInTheDocument()
  })

  it("enables a placeholder create action when registro is complete", () => {
    render(<EquipoHeader registroComplete />)
    expect(screen.getByRole("link", { name: /crear equipo/i })).toHaveAttribute("href", "#")
  })
})
