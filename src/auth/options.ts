import type { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import type {
  DiscordApiProfile,
  DiscordProfile,
} from "@/features/discord/discord-profile"
import { normalizeDiscordProfile } from "@/features/discord/discord-profile"
import { exposeDiscordProfile, persistDiscordProfile } from "./session"

interface DiscordAuthUser {
  id: string
  name: string
  email: string | null
  image: string | null
  discordProfile: DiscordProfile
}

export function toAuthUser(profile: DiscordApiProfile): DiscordAuthUser {
  const discordProfile = normalizeDiscordProfile(profile)

  return {
    id: discordProfile.id,
    name: discordProfile.displayName,
    email: profile.email ?? discordProfile.email ?? null,
    image: discordProfile.avatarUrl ?? null,
    discordProfile,
  }
}

export const authOptions: NextAuthOptions = {
  // next-auth v4 solo lee NEXTAUTH_SECRET (o `secret` explícito). En este
  // repo la env documentada es AUTH_SECRET, así que la aceptamos también
  // como fallback. Sin secret estable, cada reinicio/despliegue genera
  // uno aleatorio e invalida todas las sesiones JWT (el usuario tiene
  // que volver a autorizar en Discord aunque no hayan pasado los 30 días).
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID ?? "",
      clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
      authorization: { params: { scope: "identify email" } },
      profile(profile) {
        return toAuthUser(profile as DiscordApiProfile)
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    jwt({ token, user }) {
      return persistDiscordProfile(token, user)
    },
    session({ session, token }) {
      return exposeDiscordProfile(session, token)
    },
  },
}
