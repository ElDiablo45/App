export interface DiscordApiProfile {
  id: string
  username: string
  global_name?: string | null
  avatar?: string | null
  banner?: string | null
  accent_color?: number | null
  locale?: string | null
  public_flags?: number | null
  email?: string | null
  verified?: boolean | null
  avatar_decoration_data?: {
    asset?: string | null
    sku_id?: string | null
  } | null
  primary_guild?: {
    identity_guild_id?: string | null
    identity_enabled?: boolean | null
    tag?: string | null
    badge?: string | null
  } | null
}

export interface PrimaryGuild {
  id: string
  tag: string
  badgeUrl?: string
}

export interface DiscordProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  bannerUrl?: string
  accentColor?: string
  locale?: string
  publicFlags: number
  email?: string | null
  avatarDecorationUrl?: string
  primaryGuild?: PrimaryGuild
}

function discordAssetExtension(hash: string) {
  return hash.startsWith("a_") ? "gif" : "png"
}

function optionalPrimaryGuild(
  guild: DiscordApiProfile["primary_guild"],
): PrimaryGuild | undefined {
  if (!guild?.identity_enabled || !guild.identity_guild_id || !guild.tag) {
    return undefined
  }

  return {
    id: guild.identity_guild_id,
    tag: guild.tag,
    ...(guild.badge
      ? {
          badgeUrl: `https://cdn.discordapp.com/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=64`,
        }
      : {}),
  }
}

export function normalizeDiscordProfile(
  raw: DiscordApiProfile,
): DiscordProfile {
  const primaryGuild = optionalPrimaryGuild(raw.primary_guild)

  return {
    id: raw.id,
    username: raw.username,
    displayName: raw.global_name || raw.username,
    ...(raw.avatar
      ? {
          avatarUrl: `https://cdn.discordapp.com/avatars/${raw.id}/${raw.avatar}.${discordAssetExtension(raw.avatar)}?size=256`,
        }
      : {}),
    ...(raw.banner
      ? {
          bannerUrl: `https://cdn.discordapp.com/banners/${raw.id}/${raw.banner}.${discordAssetExtension(raw.banner)}?size=600`,
        }
      : {}),
    ...(typeof raw.accent_color === "number"
      ? {
          accentColor: `#${raw.accent_color.toString(16).padStart(6, "0")}`,
        }
      : {}),
    ...(raw.locale ? { locale: raw.locale } : {}),
    publicFlags: raw.public_flags ?? 0,
    ...(raw.email ? { email: raw.email } : {}),
    ...(raw.avatar_decoration_data?.asset
      ? {
          avatarDecorationUrl: `https://cdn.discordapp.com/avatar-decoration-presets/${raw.avatar_decoration_data.asset}.png?size=96&passthrough=true`,
        }
      : {}),
    ...(primaryGuild ? { primaryGuild } : {}),
  }
}
