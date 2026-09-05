import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RegistroForm } from "./registro-form"

const { completarRegistro, push, refresh } = vi.hoisted(() => ({
  completarRegistro: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}))

vi.mock("./registro-actions", () => ({ completarRegistro }))
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}))

describe("RegistroForm", () => {
  beforeEach(() => {
    completarRegistro.mockReset()
    push.mockReset()
    refresh.mockReset()
  })

  it("renders Eleven fields without any Steam input", () => {
    render(
      <RegistroForm
        username="joelernesto_50000"
        discordId="1266910991384576041"
        initialEmail="agenciadakrox@proton.me"
      />,
    )

    expect(
      screen.getByRole("heading", { name: /completa tu registro/i }),
    ).toBeInTheDocument()
    expect(screen.getByText("joelernesto_50000")).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toHaveValue(
      "agenciadakrox@proton.me",
    )
    expect(screen.getByLabelText(/fecha de nacimiento/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nacionalidad/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/steam/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/steamcommunity/i)).not.toBeInTheDocument()
  })

  it("keeps submit disabled until email and birth date are filled", async () => {
    const user = userEvent.setup()
    render(
      <RegistroForm username="joelernesto_50000" discordId="1" initialEmail="" />,
    )

    const submit = screen.getByRole("button", { name: /completar registro/i })
    expect(submit).toBeDisabled()

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    expect(submit).toBeDisabled()

    await user.type(
      screen.getByLabelText(/fecha de nacimiento/i),
      "2000-01-15",
    )
    expect(submit).toBeEnabled()
  })

  it("saves and goes home on valid submit", async () => {
    const user = userEvent.setup()
    completarRegistro.mockResolvedValueOnce({ ok: true })
    render(
      <RegistroForm
        username="joelernesto_50000"
        discordId="1266910991384576041"
        initialEmail="agenciadakrox@proton.me"
      />,
    )

    await user.type(
      screen.getByLabelText(/fecha de nacimiento/i),
      "2000-01-15",
    )
    await user.click(screen.getByRole("button", { name: /completar registro/i }))

    expect(completarRegistro).toHaveBeenCalledWith({
      email: "agenciadakrox@proton.me",
      birthDate: "2000-01-15",
      nationality: "",
      discordId: "1266910991384576041",
    })
    expect(push).toHaveBeenCalledWith("/")
  })
})
