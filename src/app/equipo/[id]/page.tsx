import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { DotacionEditor } from "@/features/equipo/dotacion-editor"
import { DashboardShell } from "@/features/layout/dashboard-shell"

export default async function DotacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) redirect("/")

  const store = await cookies()
  const registroComplete = isRegistroCompleteForDiscord(
    store.get(REGISTRO_COOKIE)?.value ?? null,
    profile.id,
  )
  if (!registroComplete) redirect("/registro")

  const { id } = await params

  return (
    <DashboardShell active="equipo" breadcrumb="Equipo" profile={profile}>
      <DotacionEditor title={`Dotación ${id}`} />
    </DashboardShell>
  )
}
