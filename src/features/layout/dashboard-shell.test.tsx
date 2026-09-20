import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { DashboardShell } from "./dashboard-shell"

vi.mock("next-auth/react", () => ({ signOut: vi.fn() }))

vi.mock("@/features/theme/theme-provider", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn(), toggle: vi.fn() }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => "/",
}))

describe("DashboardShell topnav", () => {
  it("renders centered topnav with the 5 renamed links and no sidebar", () => {
    const { container } = render(
      <DashboardShell active="home">
        <div>contenido</div>
      </DashboardShell>,
    )

    // No sidebar lateral
    expect(container.querySelector(".hunt-sidebar")).not.toBeInTheDocument()

    // Nueva barra superior
    const nav = container.querySelector(".hunt-topnav")
    expect(nav).toBeInTheDocument()

    expect(screen.getByRole("navigation", { name: /navegación superior/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("href", "/")
    expect(screen.getByRole("link", { name: "DOTACIONES" })).toHaveAttribute("href", "/equipo")
    expect(screen.getByRole("link", { name: "ARSENAL" })).toHaveAttribute("href", "/arsenal")
    expect(screen.getByRole("link", { name: "CAZADOR" })).toHaveAttribute("href", "/perfil")
    expect(screen.getByRole("link", { name: "TICKETS" })).toBeInTheDocument()
  })

  it("marks DOTACIONES as active when active=equipo", () => {
    render(
      <DashboardShell active="equipo">
        <div>contenido</div>
      </DashboardShell>,
    )

    expect(screen.getByRole("link", { name: "DOTACIONES" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })

  it("keeps nav clickable for guests and shows the locked overlay", () => {
    render(
      <DashboardShell active="equipo" isGuest>
        <div>contenido invitado</div>
      </DashboardShell>,
    )

    expect(screen.getByRole("link", { name: /DOTACIONES/i })).toHaveAttribute("href", "/equipo")
    expect(screen.getByRole("link", { name: /CAZADOR/i })).toHaveAttribute("href", "/perfil")
    expect(screen.getByRole("dialog", { name: /bloqueado/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /iniciar sesión con discord/i })).toBeInTheDocument()
    expect(screen.queryByText("contenido invitado")).not.toBeInTheDocument()
  })

  it("marks ARSENAL as active when active=arsenal", () => {
    render(
      <DashboardShell active="arsenal">
        <div>contenido</div>
      </DashboardShell>,
    )

    expect(screen.getByRole("link", { name: "ARSENAL" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })

  it("marks CAZADOR as active when active=perfil", () => {
    render(
      <DashboardShell active="perfil">
        <div>contenido</div>
      </DashboardShell>,
    )

    expect(screen.getByRole("link", { name: "CAZADOR" })).toHaveAttribute(
      "aria-current",
      "page",
    )
  })
})
