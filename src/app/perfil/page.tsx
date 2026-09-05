import { cookies } from "next/headers"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
  parseRegistroCookie,
} from "@/features/registro/registro-store"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HuntProfile } from "@/features/profile/hunt-profile"
import { getHuntGuildMember, getMedalGrantedDates } from "@/features/profile/discord-roles"
import { getHuntUserMessages } from "@/features/profile/discord-messages"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile) {
    redirect("/")
  }

  const store = await cookies()
  const registroRaw = store.get(REGISTRO_COOKIE)?.value ?? null
  if (!isRegistroCompleteForDiscord(registroRaw, profile.id)) {
    redirect("/registro")
  }
  const verifiedAt = parseRegistroCookie(registroRaw)?.completedAt ?? null

  const [huntMember, huntMessagesResult] = await Promise.all([getHuntGuildMember(profile), getHuntUserMessages(profile)])

  const email = (session?.user?.email as string | null) ?? profile.email ?? null

  // Fechas reales de concesión de medallas (audit-log; {} si no hay bot/permisos).
  const medalDates = huntMember
    ? await getMedalGrantedDates(
        profile.id,
        huntMember.roles.map((r) => r.id),
      )
    : null

  return (
    <DashboardShell active="perfil" breadcrumb="Mi Perfil" profile={profile}>
      <HuntProfile
        profile={profile}
        email={email}
        discordRoles={huntMember?.roles}
        huntMember={huntMember ?? null}
        huntMessages={huntMessagesResult?.messages}
        verifiedAt={verifiedAt}
        medalDates={medalDates}
      />
      <p className="profile-disclaimer" style={{ textAlign: "center", marginTop: "22px" }}>
        Sesión cifrada 8h.{" "}
        {huntMember
          ? `Conectado a Hunt Discord · ${huntMember.roles.length} roles · unido ${huntMember.joinedAt ? new Date(huntMember.joinedAt).toLocaleDateString("es-ES") : ""}${huntMessagesResult ? ` · ${huntMessagesResult.totalRecent} mensajes recientes` : ""}`
          : "Sin conexión a Hunt Discord — añade HUNT_GUILD_ID + DISCORD_BOT_TOKEN en .env.local para datos reales (roles, fecha de entrada y mensajes)."}
      </p>
    </DashboardShell>
  )
}
