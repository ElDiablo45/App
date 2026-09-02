import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { LoginPanel } from "@/features/auth/login-panel"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HomePage } from "@/features/home/home-page"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { getRecentHuntMembers } from "@/features/home/discord-members"

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

  const recentMembers = await getRecentHuntMembers(20)

  return (
    <DashboardShell active="home" breadcrumb="Home">
      <HomePage profile={profile} recentMembers={recentMembers} />
    </DashboardShell>
  )
}
