import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { ProfileCard } from "./profile-card"

const completeProfile: DiscordProfile = {
  id: "80351110224678912",
  username: "nelly",
  displayName: "Nelly",
  avatarUrl:
    "https://cdn.discordapp.com/avatars/80351110224678912/avatar.png?size=256",
  bannerUrl:
    "https://cdn.discordapp.com/banners/80351110224678912/banner.png?size=600",
  accentColor: "#5865f2",
  locale: "es-ES",
  publicFlags: 64,
  avatarDecorationUrl:
    "https://cdn.discordapp.com/avatar-decoration-presets/decoration.png?size=96&passthrough=true",
  primaryGuild: {
    id: "123",
    tag: "DISC",
    badgeUrl: "https://cdn.discordapp.com/clan-badges/123/badge.png?size=64",
  },
}

describe("ProfileCard", () => {
  it("shows every available normalized profile field", () => {
    const { container } = render(<ProfileCard profile={completeProfile} />)

    expect(screen.getByRole("heading", { name: "Nelly" })).toBeInTheDocument()
    expect(screen.getByText("@nelly")).toBeInTheDocument()
    expect(screen.getByText("80351110224678912")).toBeInTheDocument()
    expect(screen.getByText("es-ES")).toBeInTheDocument()
    expect(screen.getByText("64")).toBeInTheDocument()
    expect(screen.getByText("DISC")).toBeInTheDocument()
    expect(screen.getByAltText("Avatar de Nelly")).toBeInTheDocument()
    expect(container.querySelector(".profile-banner")).toBeInTheDocument()
    expect(container.querySelector(".avatar-decoration")).toBeInTheDocument()
  })

  it("uses initials and omits absent optional details", () => {
    render(
      <ProfileCard
        profile={{
          id: "1",
          username: "solo",
          displayName: "Solo",
          publicFlags: 0,
        }}
      />,
    )

    expect(screen.getByText("S")).toBeInTheDocument()
    expect(screen.queryByAltText("Avatar de Solo")).not.toBeInTheDocument()
    expect(screen.queryByText("Idioma")).not.toBeInTheDocument()
    expect(screen.queryByText("Guild principal")).not.toBeInTheDocument()
    expect(screen.getByText("Sin insignias públicas")).toBeInTheDocument()
  })
})
