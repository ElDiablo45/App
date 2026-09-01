import type { DiscordProfile } from "@/features/discord/discord-profile"

export type AuthToken = Record<string, unknown> & {
  discordProfile?: DiscordProfile
  email?: string | null
}

export interface AuthUser {
  discordProfile?: DiscordProfile
  email?: string | null
}

export interface PublicSession {
  user?: Record<string, unknown> & {
    discordProfile?: DiscordProfile
    email?: string | null
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

  const emailPatch = user.email ? { email: user.email } : {}

  return { ...token, discordProfile: user.discordProfile, ...emailPatch }
}

export function exposeDiscordProfile<T extends PublicSession>(
  session: T,
  token: AuthToken,
): T {
  if (!token.discordProfile) {
    return session
  }

  const email = (token.email as string | undefined) ?? (session.user as { email?: string | null } | undefined)?.email
  const emailPatch = email ? { email } : {}

  return {
    ...session,
    user: {
      ...session.user,
      ...emailPatch,
      discordProfile: token.discordProfile,
    },
  }
}
