import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, it, vi } from "vitest"
import { SignOutButton } from "./sign-out-button"

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }))

vi.mock("next-auth/react", () => ({ signOut }))

it("clears the session and returns to the login page", async () => {
  const user = userEvent.setup()
  render(<SignOutButton />)

  await user.click(screen.getByRole("button", { name: /cerrar sesión/i }))

  expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" })
})
