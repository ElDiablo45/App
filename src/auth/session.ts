import type { DiscordProfile } from "@/features/discord/discord-profile"

export type AuthToken = Record<string, unknown> & {
  discordProfile?: DiscordProfile
}

export interface AuthUser {
  discordProfile?: DiscordProfile
}

export interface PublicSession {
  user?: Record<string, unknown> & {
    discordProfile?: DiscordProfile
  }
  expires: string
}

export function persistDiscordProfile<T extends AuthToken>(
  token: T,
  user?: AuthUser,
): T {
  if (!user?.discordProfile) {
    return token
  }

  return { ...token, discordProfile: user.discordProfile }
}

export function exposeDiscordProfile<T extends PublicSession>(
  session: T,
  token: AuthToken,
): T {
  if (!token.discordProfile) {
    return session
  }

  return {
    ...session,
    user: {
      ...session.user,
      discordProfile: token.discordProfile,
    },
  }
}
