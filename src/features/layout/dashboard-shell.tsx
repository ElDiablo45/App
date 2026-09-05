"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { signOut } from "next-auth/react"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { useTheme } from "@/features/theme/theme-provider"
import { RefreshButton } from "@/features/layout/refresh-button"
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  ChevronsUpDown,
  Gamepad2,
  Globe,
  House,
  LogOut,
  Moon,
  Search,
  Shield,
  Sun,
  Ticket,
  User,
  X,
} from "lucide-react"

interface DashboardShellProps {
  children: ReactNode
  active?: "home" | "perfil" | "equipo"
  breadcrumb?: string
  profile?: DiscordProfile | null
}

export function DashboardShell({ children, active = "perfil", breadcrumb = "Mi Perfil", profile }: DashboardShellProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [themeSubmenuOpen, setThemeSubmenuOpen] = useState(false)
  const [supporterOpen, setSupporterOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  const displayName = profile?.displayName ?? profile?.username ?? ""
  const avatarUrl = profile?.avatarUrl
  const fallbackInitial = displayName.trim().charAt(0).toUpperCase() || "?"

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
        setThemeSubmenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [userMenuOpen])

  return (
    <div className="hunt-dashboard">
      <aside className="hunt-sidebar">
        <div className="hunt-sidebar-top">
          <div className="hunt-sidebar-brand">
            <Image src="/hunt/icon.svg" alt="Hunt Hispano" width={28} height={28} className="hunt-sidebar-logo" priority />
            <span>Hunt Hispano</span>
          </div>
          <div className="hunt-sidebar-search">
            <Search size={14} />
            <Bell size={14} />
          </div>
        </div>

        <nav className="hunt-nav" aria-label="Navegación">
          <div className="hunt-nav-section">
            <p className="hunt-nav-title">General</p>
            <Link href="/" className={`hunt-nav-item ${active === "home" ? "hunt-nav-item--active" : ""}`}>
              <House size={14} /> Home
            </Link>
            <Link href="/equipo" className={`hunt-nav-item ${active === "equipo" ? "hunt-nav-item--active" : ""}`}>
              <Shield size={14} /> Equipo
            </Link>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Calendar size={14} /> Calendario
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">Mi Cuenta</p>
            <Link href="/perfil" className={`hunt-nav-item ${active === "perfil" ? "hunt-nav-item--active" : ""}`}>
              <User size={14} /> Mi Perfil
            </Link>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Ticket size={14} /> Tickets
            </a>
          </div>
        </nav>

        <div className="hunt-sidebar-bottom">
          <div className="hunt-support-card">
            <div className="hunt-support-heart" aria-hidden />
            <p className="hunt-support-title">Ayúdanos a mejorar Hunt</p>
            <p className="hunt-support-text">Si te gusta Hunt, hemos creado el programa Supporter+ para...</p>
            <button className="hunt-support-btn" type="button" onClick={() => setSupporterOpen(true)}>
              Llévame
            </button>
          </div>

          <div className="hunt-user-wrap" ref={userMenuRef}>
            <button className="hunt-user-bar" type="button" onClick={() => setUserMenuOpen((v) => !v)} aria-expanded={userMenuOpen} aria-haspopup="menu">
              <span className="hunt-user-avatar">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName} width={28} height={28} className="hunt-user-img" />
                ) : (
                  <span className="hunt-user-fallback">{fallbackInitial}</span>
                )}
              </span>
              <span className="hunt-user-name">{displayName || "Usuario"}</span>
              <ChevronsUpDown size={14} className="hunt-user-chevron" />
            </button>

            {userMenuOpen ? (
              <div className="hunt-user-dropdown" role="menu">
                <div className="hunt-user-dropdown-head">
                  <span className="hunt-user-avatar hunt-user-avatar--sm">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName || "Usuario"} width={32} height={32} className="hunt-user-img" />
                    ) : (
                      <span className="hunt-user-fallback">{fallbackInitial}</span>
                    )}
                  </span>
                  <span className="hunt-user-dropdown-name">{displayName || "Usuario"}</span>
                </div>

                <div className="hunt-user-menu">
                  <Link href="/perfil" className="hunt-user-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    <User size={14} /> Mi perfil
                  </Link>
                  <Link href="/" className="hunt-user-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                    <Globe size={14} /> Pagina principal
                  </Link>
                  <div className="hunt-user-item-wrap">
                    <button
                      className="hunt-user-item"
                      role="menuitem"
                      type="button"
                      aria-expanded={themeSubmenuOpen}
                      onClick={() => setThemeSubmenuOpen((v) => !v)}
                    >
                      <Moon size={14} /> Tema <ChevronRight size={12} className={`hunt-user-arrow ${themeSubmenuOpen ? "hunt-user-arrow--open" : ""}`} />
                    </button>
                    {themeSubmenuOpen ? (
                      <div className="hunt-theme-submenu" role="menu">
                        <button
                          className={`hunt-theme-option ${theme === "light" ? "hunt-theme-option--active" : ""}`}
                          type="button"
                          onClick={() => {
                            setTheme("light")
                            setThemeSubmenuOpen(false)
                          }}
                        >
                          <Sun size={14} /> Blanco {theme === "light" ? <Check size={12} /> : null}
                        </button>
                        <button
                          className={`hunt-theme-option ${theme === "dark" ? "hunt-theme-option--active" : ""}`}
                          type="button"
                          onClick={() => {
                            setTheme("dark")
                            setThemeSubmenuOpen(false)
                          }}
                        >
                          <Moon size={14} /> Negro {theme === "dark" ? <Check size={12} /> : null}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <a
                    className="hunt-user-item"
                    role="menuitem"
                    href="https://discord.gg/hunt-hispano"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Gamepad2 size={14} /> Discord
                  </a>
                  <div className="hunt-user-sep" />
                  <button
                    className="hunt-user-item hunt-user-item--danger"
                    role="menuitem"
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut size={14} /> Cerrar sesion
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

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
        <div className="hunt-content">{children}</div>
      </div>

      {supporterOpen ? (
        <div className="hunt-modal-overlay" role="dialog" aria-modal="true" onClick={() => setSupporterOpen(false)}>
          <div className="hunt-modal" onClick={(e) => e.stopPropagation()}>
            <button className="hunt-modal-close" type="button" aria-label="Cerrar" onClick={() => setSupporterOpen(false)}>
              <X size={16} />
            </button>
            <div className="hunt-modal-heart" aria-hidden />
            <h3 className="hunt-modal-title">Supporter+ Hunt Hispano</h3>
            <p className="hunt-modal-text">
              Si te gusta Hunt Hispano, hemos creado el programa <strong>Supporter+</strong> para apoyar el proyecto y desbloquear ventajas exclusivas.
            </p>
            <ul className="hunt-modal-list">
              <li>🎖️ Rol exclusivo Supporter+ en Discord</li>
              <li>🎨 Acceso anticipado a novedades y eventos</li>
              <li>💬 Canal privado con el equipo</li>
              <li>🚀 Prioridad en whitelist y soporte</li>
            </ul>
            <div className="hunt-modal-actions">
              <a className="hunt-modal-primary" href="https://discord.gg/hunt-hispano" target="_blank" rel="noreferrer">
                Unirme en Discord
              </a>
              <button className="hunt-modal-secondary" type="button" onClick={() => setSupporterOpen(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
