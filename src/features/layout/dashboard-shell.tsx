"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  Crown,
  FileText,
  GraduationCap,
  House,
  Scale,
  Search,
  Shield,
  ShoppingBag,
  Gavel,
  Ticket,
  User,
} from "lucide-react"
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
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Shield size={14} /> Equipo
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Crown size={14} /> Dynasty 8
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Calendar size={14} /> Calendario
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <ShoppingBag size={14} /> Comercios
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Scale size={14} /> Postulaciones ilegales
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Gavel size={14} /> Justicia
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">Espacio de trabajo</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <FileText size={14} /> Documentos
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <ClipboardList size={14} /> Formularios
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">Mi Cuenta</p>
            <Link href="/perfil" className={`hunt-nav-item ${active === "perfil" ? "hunt-nav-item--active" : ""}`}>
              <User size={14} /> Mi Perfil
            </Link>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <BookOpen size={14} /> Historias personaje
            </a>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <Ticket size={14} /> Tickets
            </a>
          </div>

          <div className="hunt-nav-section">
            <p className="hunt-nav-title">LSPD</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <GraduationCap size={14} /> Academia
            </a>
          </div>
          <div className="hunt-nav-section">
            <p className="hunt-nav-title">LSSD</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <GraduationCap size={14} /> Academia
            </a>
          </div>
          <div className="hunt-nav-section">
            <p className="hunt-nav-title">SAHP</p>
            <a className="hunt-nav-item" href="#" onClick={(e) => e.preventDefault()}>
              <GraduationCap size={14} /> Academia
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
