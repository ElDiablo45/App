import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { LoadoutCard } from "./loadout-card"
import { EquipoBrowser } from "./equipo-browser"
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

describe("EquipoBrowser", () => {
  it("filters by search and topic and shows an empty state", async () => {
    const user = userEvent.setup()
    render(<EquipoBrowser items={MOCK_LOADOUTS} />)
    expect(screen.getAllByRole("article").length).toBe(4)
    await user.type(screen.getByPlaceholderText(/buscar/i), "escudos")
    expect(screen.getAllByRole("article").length).toBe(1)
    await user.clear(screen.getByPlaceholderText(/buscar/i))
    await user.click(screen.getByRole("button", { name: "pvp" }))
    expect(screen.getAllByRole("article").length).toBe(1)
    await user.type(screen.getByPlaceholderText(/buscar/i), "zzz-sin-nada")
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument()
  })
})
