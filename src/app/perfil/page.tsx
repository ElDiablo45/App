import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/auth/options"
import { ProfileCard } from "@/features/profile/profile-card"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { SignOutButton } from "@/features/profile/sign-out-button"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile) {
    redirect("/")
  }

  return (
    <main className="profile-shell">
      <div className="profile-page-heading">
        <div>
          <p className="eyebrow">Hunt Hispano</p>
          <p className="page-kicker">Información disponible con identify</p>
        </div>
        <SignOutButton />
      </div>
      <ProfileCard profile={profile} />
      <p className="profile-disclaimer">
        Esta información vive únicamente en tu sesión cifrada y desaparecerá
        cuando cierres sesión.
      </p>
    </main>
  )
}
