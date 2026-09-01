import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { HuntProfile } from "@/features/profile/hunt-profile"
import { getHuntGuildRoles } from "@/features/profile/discord-roles"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile) {
    redirect("/")
  }

  const discordRoles = await getHuntGuildRoles(profile)

  return (
    <DashboardShell active="perfil" breadcrumb="Mi Perfil">
      <HuntProfile profile={profile} discordRoles={discordRoles} />
      <p className="profile-disclaimer" style={{ textAlign: "center", marginTop: "22px" }}>
        Esta información vive únicamente en tu sesión cifrada y desaparecerá cuando cierres sesión. Roles {discordRoles ? "en vivo desde Discord" : "placeholder — configura HUNT_GUILD_ID + DISCORD_BOT_TOKEN para ver roles reales"}.
      </p>
    </DashboardShell>
  )
}
