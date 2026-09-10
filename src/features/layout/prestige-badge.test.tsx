import { render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { __resetPrestigeCache, PrestigeBadge } from "./prestige-badge"

const { getMyPrestige } = vi.hoisted(() => ({ getMyPrestige: vi.fn() }))

vi.mock("./hunter-hud-action", () => ({ getMyPrestige }))

describe("PrestigeBadge", () => {
  beforeEach(() => {
    getMyPrestige.mockClear()
    getMyPrestige.mockResolvedValue({ ok: true, level: 20 })
    __resetPrestigeCache()
  })

  it("does not fetch prestige for guests", () => {
    render(<PrestigeBadge disabled />)

    expect(getMyPrestige).not.toHaveBeenCalled()
  })

  it("reuses cached prestige across remounts (navegación sin POST extra)", async () => {
    const first = render(<PrestigeBadge />)
    await waitFor(() => expect(getMyPrestige).toHaveBeenCalledTimes(1))
    first.unmount()

    const second = render(<PrestigeBadge />)
    await waitFor(() =>
      expect(second.getByLabelText("Prestigio 20")).toBeInTheDocument(),
    )

    // Segundo montaje (cambio de página) no debe disparar otro POST
    expect(getMyPrestige).toHaveBeenCalledTimes(1)
    second.unmount()
  })
})
