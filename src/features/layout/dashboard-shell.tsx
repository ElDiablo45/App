"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { GUEST_COOKIE } from "@/features/auth/guest-cookie"
import { RefreshButton } from "@/features/layout/refresh-button"
import { HunterCluster } from "@/features/layout/hunter-cluster"
import { PrestigeBadge } from "@/features/layout/prestige-badge"
import { version as appVersion } from "../../../package.json"

interface DashboardShellProps {
  children: ReactNode
  active?: "home" | "perfil" | "equipo"
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
          <PrestigeBadge />
        </div>
        <nav className="hunt-topnav-nav" aria-label="Navegación superior">
          <Link
            href="/"
            className={`hunt-topnav-item ${active === "home" ? "hunt-topnav-item--active" : ""}`}
            aria-current={active === "home" ? "page" : undefined}
          >
            HOME
          </Link>
          {isGuest ? (
            <span className="hunt-topnav-item hunt-topnav-item--locked" title="Bloqueado">
              <Lock size={12} aria-hidden="true" /> DOTACIONES
            </span>
          ) : (
            <Link
              href="/equipo"
              className={`hunt-topnav-item ${active === "equipo" ? "hunt-topnav-item--active" : ""}`}
              aria-current={active === "equipo" ? "page" : undefined}
            >
              DOTACIONES
            </Link>
          )}
          {isGuest ? (
            <span className="hunt-topnav-item hunt-topnav-item--locked" title="Bloqueado">
              <Lock size={12} aria-hidden="true" />CALENDARIO
            </span>
          ) : (
            <a
              className="hunt-topnav-item"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              CALENDARIO
            </a>
          )}
          {isGuest ? (
            <span className="hunt-topnav-item hunt-topnav-item--locked" title="Bloqueado">
              <Lock size={12} aria-hidden="true" /> CAZADOR
            </span>
          ) : (
            <Link
              href="/perfil"
              className={`hunt-topnav-item ${active === "perfil" ? "hunt-topnav-item--active" : ""}`}
              aria-current={active === "perfil" ? "page" : undefined}
            >
              CAZADOR
            </Link>
          )}
          {isGuest ? (
            <span className="hunt-topnav-item hunt-topnav-item--locked" title="Bloqueado">
              <Lock size={12} aria-hidden="true" />TICKETS
            </span>
          ) : (
            <a
              className="hunt-topnav-item"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              TICKETS
            </a>
          )}
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
            <a className="hunt-help-btn" href="#">
              ◎ Ayuda
            </a>
          </div>
        </header>
        <div className="hunt-content">
          {locked ? (
            <div className="hunt-locked-wrap">
              <div className="hunt-locked-blur" aria-hidden="true">
                {children}
              </div>
              <GuestLocked />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  )
}
