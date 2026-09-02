import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HuntProfile } from "@/features/profile/hunt-profile"
import { getHuntGuildMember } from "@/features/profile/discord-roles"
import { getHuntUserMessages } from "@/features/profile/discord-messages"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile) {
    redirect("/")
  }

  const [huntMember, huntMessagesResult] = await Promise.all([getHuntGuildMember(profile), getHuntUserMessages(profile)])

  const email = (session?.user?.email as string | null) ?? profile.email ?? null

  return (
    <DashboardShell active="perfil" breadcrumb="Mi Perfil">
      <HuntProfile
        profile={profile}
        email={email}
        discordRoles={huntMember?.roles}
        huntMember={huntMember ?? null}
        huntMessages={huntMessagesResult?.messages}
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
