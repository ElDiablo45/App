import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LoginPanel } from "./login-panel"

const { signIn } = vi.hoisted(() => ({ signIn: vi.fn() }))

vi.mock("next-auth/react", () => ({ signIn }))

describe("LoginPanel", () => {
  beforeEach(() => {
    signIn.mockReset()
  })

  it("requires the data notice before starting Discord OAuth", async () => {
    const user = userEvent.setup()
    render(<LoginPanel authenticated={false} />)

    expect(
      screen.getByText(
        "Autorizo a Discord Panel a leer y mostrar temporalmente la información básica de mi perfil de Discord.",
      ),
    ).toBeInTheDocument()

    const button = screen.getByRole("button", {
      name: /continuar con discord/i,
    })
    expect(button).toBeDisabled()

    await user.click(screen.getByRole("checkbox"))
    expect(button).toBeEnabled()

    await user.click(button)
    expect(signIn).toHaveBeenCalledWith("discord", {
      callbackUrl: "/perfil",
    })
  })

  it("renders a safe user-facing OAuth error", () => {
    render(<LoginPanel authenticated={false} errorCode="OAuthCallback" />)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Discord no pudo completar el inicio de sesión. Inténtalo de nuevo.",
    )
  })

  it("offers the profile instead of another consent form when authenticated", () => {
    render(<LoginPanel authenticated />)

    expect(
      screen.getByRole("link", { name: /ver mi perfil/i }),
    ).toHaveAttribute("href", "/perfil")
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
  })
})
