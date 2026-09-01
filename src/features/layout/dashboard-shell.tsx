import type { ReactNode } from "react"
import Link from "next/link"
import { SignOutButton } from "@/features/profile/sign-out-button"

interface DashboardShellProps {
  children: ReactNode
  active?: "home" | "perfil"
  breadcrumb?: string
}

export function DashboardShell({ children, active = "perfil", breadcrumb = "Mi Perfil" }: DashboardShellProps) {
  return (
    <div className="hunt-dashboard">
      <aside className="hunt-sidebar">
        <div className="hunt-sidebar-top">
          <div className="hunt-sidebar-brand">
            <span className="hunt-sidebar-brand-icon">🦌</span>
            <span>Hunt Hispano</span>
          </div>
          <div className="hunt-sidebar-search">
            <span>⌕</span>
            <span>🔔</span>
          </div>
        </div>

        <nav className="hunt-nav" aria-label="Navegación">
          <div className="hunt-nav-section">
            <p className="hunt-nav-title">General</p>
            <Link href="/" className={`hunt-nav-item ${active === "home" ? "hunt-nav-item--active" : ""}`}>
              <span>⌂</span> Home
            </Link>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>🛡</span> Equipo
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>♛</span> Dynasty 8
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>📅</span> Calendario
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>🏪</span> Comercios
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>⚖</span> Postulaciones ilegales
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>⚖</span> Justicia
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">Espacio de trabajo</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>📄</span> Documentos
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>📝</span> Formularios
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">Mi Cuenta</p>
            <Link href="/perfil" className={`hunt-nav-item ${active === "perfil" ? "hunt-nav-item--active" : ""}`}>
              <span>👤</span> Mi Perfil
            </Link>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>📖</span> Historias personaje
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>🎫</span> Tickets
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">LSPD</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>🎓</span> Academia
            </a>
          </div>
          <div className="hunt-nav-section">
            <p className="hunt-nav-title">LSSD</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>🎓</span> Academia
            </a>
          </div>
          <div className="hunt-nav-section">
            <p className="hunt-nav-title">SAHP</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <span>🎓</span> Academia
            </a>
          </div>
        </nav>

        <div className="hunt-sidebar-bottom">
          <div className="hunt-support-card">
            <p className="hunt-support-title">Ayúdanos a mejorar Hunt Hispano</p>
            <p className="hunt-support-text">Si te gusta Hunt, hemos creado el programa Supporter+ para...</p>
            <a className="hunt-support-btn" href="#" onClick={(e) => e.preventDefault()}>
              Llévame
            </a>
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
            <button className="hunt-icon-btn" aria-label="Refrescar" type="button">
              ↻
            </button>
            <a className="hunt-help-btn" href="#">
              ◎ Ayuda
            </a>
            <SignOutButton compact />
          </div>
        </header>
        <div className="hunt-content">{children}</div>
      </div>
    </div>
  )
}
