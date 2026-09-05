import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import Image from "next/image"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { RegistroForm } from "@/features/registro/registro-form"
import {
  REGISTRO_COOKIE,
  isRegistroCompleteForDiscord,
} from "@/features/registro/registro-store"

export default async function RegistroPage() {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)

  if (!profile) {
    redirect("/")
  }

  const store = await cookies()
  const raw = store.get(REGISTRO_COOKIE)?.value ?? null
  if (isRegistroCompleteForDiscord(raw, profile.id)) {
    redirect("/")
  }

  const email =
    (session?.user?.email as string | null) ?? profile.email ?? null

  return (
    <main className="eleven-registro-shell">
      <div className="eleven-registro-left">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div className="eleven-brand" aria-hidden="true">
            <Image
              src="/hunt/mark.svg"
              alt="Hunt Hispano"
              width={42}
              height={22}
              priority
              style={{ width: "42px", height: "22px", objectFit: "contain" }}
              unoptimized
            />
            <span className="eleven-brand-text">
              <strong>HUNT</strong>
              <span>HISPANO</span>
            </span>
          </div>
          <RegistroForm
            username={profile.username}
            discordId={profile.id}
            avatarUrl={profile.avatarUrl}
            initialEmail={email}
          />
        </div>
      </div>

      <div className="eleven-registro-right" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=1200&fit=crop&auto=format"
          alt=""
          className="eleven-registro-img"
          loading="eager"
        />
        <div className="eleven-registro-overlay" />
      </div>
    </main>
  )
}
