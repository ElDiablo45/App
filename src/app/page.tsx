import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { LoginPanel } from "@/features/auth/login-panel"
import { GUEST_COOKIE } from "@/features/auth/guest-cookie"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { SiteFooter } from "@/features/layout/site-footer"
import { HomePage } from "@/features/home/home-page"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { getUserByDiscordId } from "@/features/registro/users-repo"

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
      return (
        <DashboardShell active="home" breadcrumb="Home" profile={guestProfile} isGuest>
          <HomePage profile={guestProfile} />
        </DashboardShell>
      )
    }
    return (
      <main className="eleven-page">
        <LoginPanel authenticated={false} errorCode={errorCode} />
        <SiteFooter />
      </main>
    )
  }

  // La cookie es la prueba de registro: si es válida no tocamos Supabase
  // (cada roundtrip cuesta 0.5-1.8s desde aquí). Solo consultamos la DB
  // cuando no hay cookie, para no redirigir a un usuario ya registrado.
  const registroRaw = store.get(REGISTRO_COOKIE)?.value ?? null
  if (!isRegistroCompleteForDiscord(registroRaw, profile.id)) {
    const dbUser = await getUserByDiscordId(profile.id).catch(() => null)
    if (!dbUser) {
      redirect("/registro")
    }
  }

  // Los datos pesados (Steam/Discord/Twitch) se cargan dentro de
  // HomePage con Suspense: el shell pinta sin esperarlos.
  return (
    <DashboardShell active="home" breadcrumb="Home" profile={profile}>
      <HomePage profile={profile} />
    </DashboardShell>
  )
}
