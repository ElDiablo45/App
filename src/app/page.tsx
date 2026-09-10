import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { LoginPanel } from "@/features/auth/login-panel"
import { GUEST_COOKIE } from "@/features/auth/guest-cookie"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HomePage } from "@/features/home/home-page"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { getUserByDiscordId } from "@/features/registro/users-repo"
import { getRecentHuntMembers } from "@/features/home/discord-members"
import { getHuntSteamNews } from "@/features/steam/steam-news"
import { getLiveCommunityChannels } from "@/features/twitch/twitch-live"

interface HomeProps {
  searchParams: Promise<{ error?: string | string[] }>
}

export default async function Home({ searchParams }: HomeProps) {
  const [session, params] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ])
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error
  const profile = getDiscordProfile(session)
  const store = await cookies()
  const isGuest = store.get(GUEST_COOKIE)?.value === "1"

  if (!profile) {
    if (isGuest) {
      const guestProfile = { id: "guest", username: "invitado", displayName: "Invitado", publicFlags: 0 }
      const [recentMembers, steamNews, liveChannels] = await Promise.all([
        getRecentHuntMembers(20),
        getHuntSteamNews(4),
        getLiveCommunityChannels(),
      ])
      return (
        <DashboardShell active="home" breadcrumb="Home" profile={guestProfile} isGuest>
          <HomePage profile={guestProfile} recentMembers={recentMembers} steamNews={steamNews} liveChannels={liveChannels.length ? liveChannels : undefined} />
        </DashboardShell>
      )
    }
    return (
      <main className="eleven-page">
        <LoginPanel authenticated={false} errorCode={errorCode} />
      </main>
    )
  }

  const dbUser = await getUserByDiscordId(profile.id).catch(() => null)
  if (
    !dbUser &&
    !isRegistroCompleteForDiscord(
      store.get(REGISTRO_COOKIE)?.value ?? null,
      profile.id,
    )
  ) {
    redirect("/registro")
  }

  const [recentMembers, steamNews, liveChannels] = await Promise.all([
    getRecentHuntMembers(20),
    getHuntSteamNews(4),
    getLiveCommunityChannels(),
  ])

  return (
    <DashboardShell active="home" breadcrumb="Home" profile={profile}>
      <HomePage profile={profile} recentMembers={recentMembers} steamNews={steamNews} liveChannels={liveChannels.length ? liveChannels : undefined} />
    </DashboardShell>
  )
}
