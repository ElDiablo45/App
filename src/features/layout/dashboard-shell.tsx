"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { GUEST_COOKIE } from "@/features/auth/guest-cookie"
import { RefreshButton } from "@/features/layout/refresh-button"
import { HelpMenu } from "@/features/layout/help-menu"
import { HunterCluster } from "@/features/layout/hunter-cluster"
import { PrestigeBadge } from "@/features/layout/prestige-badge"
import { SiteFooter } from "@/features/layout/site-footer"
import { version as appVersion } from "../../../package.json"

interface DashboardShellProps {
  children: ReactNode
  active?: "home" | "perfil" | "equipo" | "arsenal"
  breadcrumb?: string
  profile?: DiscordProfile | null
  isGuest?: boolean
}

export function GuestLocked({ title = "Bloqueado" }: { title?: string }) {
  const router = useRouter()
  function goLogin() {
    document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; SameSite=Lax`
    router.push("/")
    router.refresh()
  }
  return (
    <div className="hunt-locked-overlay" role="dialog" aria-label={title}>
      <span className="hunt-locked-icon" aria-hidden="true">
        <Lock size={20} />
      </span>
      <strong className="hunt-locked-title">{title}</strong>
      <p className="hunt-locked-text">
        Para acceder a este apartado necesitas iniciar sesión con Discord.
      </p>
      <button className="hunt-locked-btn" type="button" onClick={goLogin}>
        Iniciar sesión con Discord
      </button>
    </div>
  )
}

export function DashboardShell({ children, active = "perfil", breadcrumb = "Mi Perfil", profile, isGuest = false }: DashboardShellProps) {
  const locked = isGuest && active !== "home"
  return (
    <div className="hunt-dashboard hunt-dashboard--topnav">
      <header className="hunt-topnav">
        <div className="hunt-topnav-left">
          <PrestigeBadge disabled={isGuest} />
        </div>
        <nav className="hunt-topnav-nav" aria-label="Navegación superior">
          <Link
            href="/"
            className={`hunt-topnav-item ${active === "home" ? "hunt-topnav-item--active" : ""}`}
            aria-current={active === "home" ? "page" : undefined}
          >
            HOME
          </Link>
          <Link
            href="/equipo"
            className={`hunt-topnav-item ${active === "equipo" ? "hunt-topnav-item--active" : ""} ${isGuest ? "hunt-topnav-item--locked" : ""}`}
            aria-current={active === "equipo" ? "page" : undefined}
            title={isGuest ? "Bloqueado" : undefined}
          >
            {isGuest ? <Lock size={12} aria-hidden="true" /> : null}DOTACIONES
          </Link>
          <Link
            href="/arsenal"
            className={`hunt-topnav-item ${active === "arsenal" ? "hunt-topnav-item--active" : ""} ${isGuest ? "hunt-topnav-item--locked" : ""}`}
            aria-current={active === "arsenal" ? "page" : undefined}
            title={isGuest ? "Bloqueado" : undefined}
          >
            {isGuest ? <Lock size={12} aria-hidden="true" /> : null}ARSENAL
          </Link>
          <Link
            href="/perfil"
            className={`hunt-topnav-item ${active === "perfil" ? "hunt-topnav-item--active" : ""} ${isGuest ? "hunt-topnav-item--locked" : ""}`}
            aria-current={active === "perfil" ? "page" : undefined}
            title={isGuest ? "Bloqueado" : undefined}
          >
            {isGuest ? <Lock size={12} aria-hidden="true" /> : null}CAZADOR
          </Link>
          <a
            className={`hunt-topnav-item ${isGuest ? "hunt-topnav-item--locked" : ""}`}
            href="#"
            onClick={(e) => e.preventDefault()}
            title={isGuest ? "Bloqueado" : undefined}
          >
            {isGuest ? <Lock size={12} aria-hidden="true" /> : null}TICKETS
          </a>
        </nav>
        <div className="hunt-topnav-right">
          <HunterCluster avatarUrl={profile?.avatarUrl} displayName={profile?.displayName} />
          <span className="hunt-version">v{appVersion}</span>
        </div>
      </header>

      <div className="hunt-main">
        <header className="hunt-topbar">
          <div className="hunt-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>{breadcrumb}</span>
          </div>
          <div className="hunt-topbar-actions">
            <RefreshButton />
            <HelpMenu />
          </div>
        </header>
        <div className="hunt-content">
          {locked ? (
            <div className="hunt-locked-full">
              <GuestLocked />
            </div>
          ) : (
            children
          )}
        </div>
        <SiteFooter />
      </div>
    </div>
  )
}
