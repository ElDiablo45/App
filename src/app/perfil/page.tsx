import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HuntProfile } from "@/features/profile/hunt-profile"
import { getHuntGuildMember } from "@/features/profile/discord-roles"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile) {
    redirect("/")
  }

  const huntMember = await getHuntGuildMember(profile)
  const email = (session?.user?.email as string | null) ?? profile.email ?? null

  return (
    <DashboardShell active="perfil" breadcrumb="Mi Perfil">
      <HuntProfile profile={profile} email={email} discordRoles={huntMember?.roles} huntMember={huntMember ?? null} />
      <p className="profile-disclaimer" style={{ textAlign: "center", marginTop: "22px" }}>
        Sesión cifrada 8h. {huntMember ? `Conectado a Hunt Discord · ${huntMember.roles.length} roles · unido ${huntMember.joinedAt ? new Date(huntMember.joinedAt).toLocaleDateString("es-ES") : ""}` : "Sin conexión a Hunt Discord — añade HUNT_GUILD_ID + DISCORD_BOT_TOKEN en .env.local para datos reales (roles y fecha de entrada). Personajes/Tiempo/Balance vienen de tu base Hunt, no de Discord."}
      </p>
    </DashboardShell>
  )
}
