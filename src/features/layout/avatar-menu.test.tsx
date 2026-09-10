import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AvatarMenu } from "./avatar-menu"

const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }))
vi.mock("next-auth/react", () => ({ signOut: signOutMock }))

describe("AvatarMenu", () => {
  it("shows fallback initial and opens menu with perfil + sign out", async () => {
    const user = userEvent.setup()
    render(<AvatarMenu displayName="Kati" />)

    expect(screen.getByText("K")).toBeInTheDocument()
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /menú de cazador/i }))
    expect(screen.getByRole("menu", { name: /menú de cazador/i })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: /mi perfil/i })).toHaveAttribute("href", "/perfil")

    await user.click(screen.getByRole("menuitem", { name: /cerrar sesión/i }))
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" })
  })

  it("clears the guest cookie when closing a guest session", async () => {
    document.cookie = "hh_guest=1; path=/"
    const user = userEvent.setup()
    render(<AvatarMenu displayName="Invitado" />)

    await user.click(screen.getByRole("button", { name: /menú de cazador/i }))
    await user.click(screen.getByRole("menuitem", { name: /cerrar sesión/i }))

    expect(document.cookie).not.toContain("hh_guest=1")
    expect(signOutMock).toHaveBeenCalledWith({ callbackUrl: "/" })
  })

  it("closes the menu with Escape", async () => {
    const user = userEvent.setup()
    render(<AvatarMenu displayName="Kati" />)
    await user.click(screen.getByRole("button", { name: /menú de cazador/i }))
    expect(screen.getByRole("menu")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })
})
