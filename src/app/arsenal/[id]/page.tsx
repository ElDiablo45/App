import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"
import { GUEST_COOKIE } from "@/features/auth/guest-cookie"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { getArsenalItem, incrementView } from "@/features/arsenal/arsenal"
import { toggleArsenalLike } from "@/features/arsenal/arsenal-actions"
import { ArsenalDetail } from "@/features/arsenal/arsenal-detail"

export default async function ArsenalDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  const { id } = await params
  const found = await getArsenalItem(id, profile.id)
  if (!found) notFound()

  // No bloquea el pintado: el contador nunca rompe la página.
  void incrementView(id)

  return (
    <DashboardShell active="arsenal" breadcrumb="Arsenal" profile={profile}>
      <ArsenalDetail
        item={found.item}
        initialLiked={found.likedByMe}
        onToggleLike={toggleArsenalLike}
      />
    </DashboardShell>
  )
}
