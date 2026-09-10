import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { HunterCluster } from "./hunter-cluster"

const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }))
vi.mock("next-auth/react", () => ({ signOut: signOutMock }))

describe("HunterCluster", () => {
  it("renders hunter slots, system icons and version hook", async () => {
    const user = userEvent.setup()
    render(<HunterCluster displayName="Kati" />)

    expect(screen.getByRole("button", { name: /menú de cazador/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ajustes/i })).toHaveAttribute("href", "/perfil")

    await user.click(screen.getByRole("button", { name: /salir/i }))
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" })
  })

  it("clears the guest cookie when exiting a guest session", async () => {
    document.cookie = "hh_guest=1; path=/"
    const user = userEvent.setup()
    render(<HunterCluster displayName="Invitado" />)

    await user.click(screen.getByRole("button", { name: /salir/i }))

    expect(document.cookie).not.toContain("hh_guest=1")
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" })
  })
})
