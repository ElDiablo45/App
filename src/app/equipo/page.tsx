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
import { DotacionesGuardadas } from "@/features/equipo/dotaciones-guardadas"
import { DashboardShell } from "@/features/layout/dashboard-shell"

export default async function EquipoPage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  const store = await cookies()
  if (!profile) {
    if (store.get(GUEST_COOKIE)?.value === "1") {
      const guestProfile = { id: "guest", username: "invitado", displayName: "Invitado", publicFlags: 0 }
      return (
        <DashboardShell active="equipo" breadcrumb="Equipo" profile={guestProfile} isGuest>
          <DotacionesGuardadas />
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
    <DashboardShell active="equipo" breadcrumb="Equipo" profile={profile}>
      <DotacionesGuardadas />
    </DashboardShell>
  )
}
