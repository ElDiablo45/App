"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { clearGuestCookie } from "@/features/auth/guest-cookie"

interface AvatarMenuProps {
  avatarUrl?: string
  displayName?: string
  size?: number
}

/**
 * Cuadrado con el avatar arriba a la derecha. Al clic abre un mini-menú
 * con ir al perfil y cerrar sesión. Cierra con Escape o clic fuera.
 */
export function AvatarMenu({ avatarUrl, displayName, size = 32 }: AvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    function onPointer(e: PointerEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open ])

  const initial = displayName?.trim().charAt(0).toUpperCase() || "?"

  return (
    <div className="hunt-avatar-menu" ref={root}>
      <button
        type="button"
        className="hunt-avatar-btn"
        aria-label="Menú de cazador"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={size} height={size} className="hunt-avatar-img" />
        ) : (
          <span className="hunt-avatar-fallback" aria-hidden="true">
            {initial}
          </span>
        )}
      </button>
      {open ? (
        <div className="hunt-avatar-drop" role="menu" aria-label="Menú de cazador">
          <Link
            href="/perfil"
            role="menuitem"
            className="hunt-avatar-item"
            onClick={() => setOpen(false)}
          >
            <User size={15} aria-hidden="true" />
            Mi perfil
          </Link>
          <button
            type="button"
            role="menuitem"
            className="hunt-avatar-item"
            onClick={() => {
              clearGuestCookie()
              signOut({ callbackUrl: "/" })
            }}
          >
            <LogOut size={15} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}
