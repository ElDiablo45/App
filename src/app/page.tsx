import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { LoginPanel } from "@/features/auth/login-panel"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HomePage } from "@/features/home/home-page"
import { getDiscordProfile } from "@/features/profile/profile-session"
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

  if (!profile) {
    return (
      <main className="eleven-page">
        <LoginPanel authenticated={false} errorCode={errorCode} />
      </main>
    )
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
