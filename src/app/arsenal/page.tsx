import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { GUEST_COOKIE } from "@/features/auth/guest-cookie"
import { DashboardShell } from "@/features/layout/dashboard-shell"

export default async function ArsenalPage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  const store = await cookies()
  if (!profile) {
    if (store.get(GUEST_COOKIE)?.value === "1") {
      const guestProfile = { id: "guest", username: "invitado", displayName: "Invitado", publicFlags: 0 }
      return (
        <DashboardShell active="arsenal" breadcrumb="Arsenal" profile={guestProfile} isGuest>
          <div />
        </DashboardShell>
      )
    }
    redirect("/")
  }
  const registroComplete = isRegistroCompleteForDiscord(
    store.get(REGISTRO_COOKIE)?.value ?? null,
    profile.id,
  )
  if (!registroComplete) redirect("/registro")

  return (
    <DashboardShell active="arsenal" breadcrumb="Arsenal" profile={profile}>
      <section aria-label="Arsenal">
        <h1 className="hunt-home-heading">ARSENAL</h1>
        <p className="hunt-support-text">Dotaciones publicadas por la comunidad.</p>
      </section>
    </DashboardShell>
  )
}
