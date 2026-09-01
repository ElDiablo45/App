import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { LoginPanel } from "@/features/auth/login-panel"
import { getDiscordProfile } from "@/features/profile/profile-session"

interface HomeProps {
  searchParams: Promise<{ error?: string | string[] }>
}

export default async function Home({ searchParams }: HomeProps) {
  const [session, params] = await Promise.all([
    getServerSession(authOptions),
    searchParams,
  ])
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error

  return (
    <main className="eleven-page">
      <LoginPanel
        authenticated={Boolean(getDiscordProfile(session))}
        errorCode={errorCode}
      />
    </main>
  )
}
