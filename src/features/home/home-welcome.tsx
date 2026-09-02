import Image from "next/image"
import type { DiscordProfile } from "@/features/discord/discord-profile"

interface HomeWelcomeProps {
  profile: DiscordProfile
}

export function HomeWelcome({ profile }: HomeWelcomeProps) {
  return (
    <div className="hunt-home-welcome">
      <div className="hunt-welcome-avatar">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt={`Avatar de ${profile.displayName}`} width={48} height={48} className="hunt-welcome-img" priority />
        ) : (
          <div className="hunt-welcome-fallback">{profile.displayName.trim().charAt(0).toUpperCase() || "?"}</div>
        )}
      </div>
      <div>
        <h1 className="hunt-welcome-title">Bienvenido, {profile.displayName}</h1>
        <p className="hunt-welcome-subtitle">Esto es lo que pasa en Hunt Hispano</p>
      </div>
    </div>
  )
}
