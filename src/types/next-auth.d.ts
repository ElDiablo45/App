import type { DefaultSession } from "next-auth"
import type { DiscordProfile } from "@/features/discord/discord-profile"

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      discordProfile?: DiscordProfile
    }
  }

  interface User {
    discordProfile?: DiscordProfile
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordProfile?: DiscordProfile
  }
}
