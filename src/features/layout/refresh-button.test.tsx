import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RefreshButton } from "./refresh-button"
import { syncRoles } from "./refresh-action"

const { refresh, usePathname } = vi.hoisted(() => ({
  refresh: vi.fn(),
  usePathname: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
  usePathname,
}))

vi.mock("./refresh-action", () => ({ syncRoles: vi.fn() }))

const syncMock = vi.mocked(syncRoles)

beforeEach(() => {
  vi.clearAllMocks()
  usePathname.mockReturnValue("/perfil")
})

describe("RefreshButton", () => {
  it("syncs roles, toasts no-change and refreshes the router", async () => {
    const user = userEvent.setup()
    syncMock.mockResolvedValueOnce({ ok: true, changed: false })
    render(<RefreshButton />)

    await user.click(screen.getByRole("button", { name: /refrescar/i }))

    expect(syncMock).toHaveBeenCalledWith("/perfil")
    expect(
      screen.getByText("No hay rangos pendientes de sincronizar."),
    ).toBeInTheDocument()
    expect(refresh).toHaveBeenCalled()
  })

  it("toasts when roles changed", async () => {
    const user = userEvent.setup()
    syncMock.mockResolvedValueOnce({ ok: true, changed: true })
    render(<RefreshButton />)

    await user.click(screen.getByRole("button", { name: /refrescar/i }))

    expect(
      screen.getByText("Rangos sincronizados correctamente."),
    ).toBeInTheDocument()
    expect(refresh).toHaveBeenCalled()
  })

  it("refreshes silently when sync fails", async () => {
    const user = userEvent.setup()
    syncMock.mockResolvedValueOnce({ ok: false })
    render(<RefreshButton />)

    await user.click(screen.getByRole("button", { name: /refrescar/i }))

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(refresh).toHaveBeenCalled()
    expect(
      screen.getByRole("button", { name: /refrescar/i }),
    ).toBeEnabled()
  })
})
