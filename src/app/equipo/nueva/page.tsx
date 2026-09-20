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
import { getArsenalItem } from "@/features/arsenal/arsenal"
import { DashboardShell } from "@/features/layout/dashboard-shell"

const SLOTS: SlotKind[] = ["principal", "secundaria", "herramientas"]

function parseSlot(value: string | string[] | undefined): SlotKind {
  const raw = Array.isArray(value) ? value[0] : value
  return SLOTS.includes(raw as SlotKind) ? (raw as SlotKind) : "principal"
}

function parseCopiar(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  return raw && raw.trim() ? raw.trim() : null
}

export default async function NuevaDotacionPage({
  searchParams,
}: {
  searchParams: Promise<{ ranura?: string | string[]; copiar?: string | string[] }>
}) {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  const store = await cookies()
  const params = await searchParams
  const copiarId = parseCopiar(params.copiar)
  const copia = copiarId ? await getArsenalItem(copiarId) : null
  const title = copia ? `${copia.item.title} (copia)` : "Nueva dotación"
  const initialArmaSlugs = copia ? copia.item.armasSlugs : []
  if (!profile) {
    if (store.get(GUEST_COOKIE)?.value === "1") {
      const guestProfile = { id: "guest", username: "invitado", displayName: "Invitado", publicFlags: 0 }
      return (
        <DashboardShell active="equipo" breadcrumb="Equipo" profile={guestProfile} isGuest>
          <DotacionEditor title={title} initialSlot={parseSlot(params.ranura)} initialArmaSlugs={initialArmaSlugs} />
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
      <DotacionEditor title={title} initialSlot={parseSlot(params.ranura)} initialArmaSlugs={initialArmaSlugs} />
    </DashboardShell>
  )
}
