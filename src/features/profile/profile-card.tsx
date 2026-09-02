import Image from "next/image"
import type { CSSProperties } from "react"
import type { DiscordProfile } from "@/features/discord/discord-profile"

interface ProfileCardProps {
  profile: DiscordProfile
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const initials = profile.displayName.trim().charAt(0).toUpperCase() || "?"
  const cardStyle = {
    "--profile-accent": profile.accentColor ?? "#5865f2",
  } as CSSProperties

  return (
    <article className="profile-card" style={cardStyle}>
      <div className="profile-banner" aria-hidden="true">
        {profile.bannerUrl ? (
          <Image
            alt=""
            className="banner-image"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 680px"
            src={profile.bannerUrl}
          />
        ) : null}
      </div>

      <div className="profile-content">
        <div className="avatar-shell">
          {profile.avatarUrl ? (
            <Image
              alt={`Avatar de ${profile.displayName}`}
              className="profile-avatar"
              height={112}
              priority
              src={profile.avatarUrl}
              width={112}
            />
          ) : (
            <span className="avatar-fallback" aria-label="Avatar sin imagen">
              {initials}
            </span>
          )}
        </div>

        <header className="profile-heading">
          <p className="eyebrow">Perfil conectado</p>
          <h1>{profile.displayName}</h1>
          <p className="profile-username">@{profile.username}</p>
        </header>

        <dl className="profile-details">
          <div className="detail-item">
            <dt>ID de Discord</dt>
            <dd>{profile.id}</dd>
          </div>
          {profile.locale ? (
            <div className="detail-item">
              <dt>Idioma</dt>
              <dd>{profile.locale}</dd>
            </div>
          ) : null}
          <div className="detail-item">
            <dt>Flags públicas</dt>
            <dd>
              {profile.publicFlags > 0
                ? profile.publicFlags
                : "Sin insignias públicas"}
            </dd>
          </div>
          {profile.primaryGuild ? (
            <div className="detail-item guild-detail">
              <dt>Guild principal</dt>
              <dd>
                {profile.primaryGuild.badgeUrl ? (
                  <Image
                    alt=""
                    aria-hidden="true"
                    height={24}
                    src={profile.primaryGuild.badgeUrl}
                    width={24}
                  />
                ) : null}
                <span>{profile.primaryGuild.tag}</span>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  )
}
