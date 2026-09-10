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
import { DotacionEditor, type SlotKind } from "@/features/equipo/dotacion-editor"
import { DashboardShell } from "@/features/layout/dashboard-shell"

const SLOTS: SlotKind[] = ["principal", "secundaria", "herramientas"]

function parseSlot(value: string | string[] | undefined): SlotKind {
  const raw = Array.isArray(value) ? value[0] : value
  return SLOTS.includes(raw as SlotKind) ? (raw as SlotKind) : "principal"
}

export default async function NuevaDotacionPage({
  searchParams,
}: {
  searchParams: Promise<{ ranura?: string | string[] }>
}) {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  const store = await cookies()
  if (!profile) {
    if (store.get(GUEST_COOKIE)?.value === "1") {
      const guestProfile = { id: "guest", username: "invitado", displayName: "Invitado", publicFlags: 0 }
      const params = await searchParams
      return (
        <DashboardShell active="equipo" breadcrumb="Equipo" profile={guestProfile} isGuest>
          <DotacionEditor title="Nueva dotación" initialSlot={parseSlot(params.ranura)} />
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

  const params = await searchParams
  return (
    <DashboardShell active="equipo" breadcrumb="Equipo" profile={profile}>
      <DotacionEditor title="Nueva dotación" initialSlot={parseSlot(params.ranura)} />
    </DashboardShell>
  )
}
