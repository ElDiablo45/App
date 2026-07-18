import type { Session } from "next-auth"

export function getDiscordProfile(session: Session | null) {
  return session?.user?.discordProfile
}
