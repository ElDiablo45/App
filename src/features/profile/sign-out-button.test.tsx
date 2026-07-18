import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, expect, it, vi } from "vitest"
import { SignOutButton } from "./sign-out-button"

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }))

vi.mock("next-auth/react", () => ({ signOut }))

beforeEach(() => {
  signOut.mockReset()
})

it("clears the session and returns to the login page", async () => {
  const user = userEvent.setup()
  render(<SignOutButton />)

  await user.click(screen.getByRole("button", { name: /cerrar sesión/i }))

  expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" })
})

it("recovers and explains when the session cannot be closed", async () => {
  signOut.mockRejectedValueOnce(new Error("network detail"))
  const user = userEvent.setup()
  render(<SignOutButton />)

  await user.click(screen.getByRole("button", { name: /cerrar sesión/i }))

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "No se pudo cerrar la sesión. Inténtalo de nuevo.",
  )
  expect(
    screen.getByRole("button", { name: /cerrar sesión/i }),
  ).toBeEnabled()
})
