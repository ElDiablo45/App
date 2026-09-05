import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { getLoadouts } from "@/features/equipo/loadouts"
import { EquipoHeader } from "@/features/equipo/equipo-header"
import { EquipoBrowser } from "@/features/equipo/equipo-browser"
import { DashboardShell } from "@/features/layout/dashboard-shell"

export default async function EquipoPage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) redirect("/")

  const store = await cookies()
  const registroComplete = isRegistroCompleteForDiscord(
    store.get(REGISTRO_COOKIE)?.value ?? null,
    profile.id,
  )
  if (!registroComplete) redirect("/registro")

  const loadouts = await getLoadouts()

  return (
    <DashboardShell active="equipo" breadcrumb="Equipo" profile={profile}>
      <EquipoHeader registroComplete={registroComplete} />
      <EquipoBrowser items={loadouts} />
    </DashboardShell>
  )
}
