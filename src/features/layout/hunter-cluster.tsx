"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { LogOut, Mail, Settings } from "lucide-react"
import { clearGuestCookie } from "@/features/auth/guest-cookie"
import { AvatarMenu } from "./avatar-menu"

interface HunterClusterProps {
  avatarUrl?: string
  displayName?: string
}

/**
 * Bloque derecho de la barra Hunt: 3 huecos de cazador (central = avatar
 * actual con su menú, laterales = reclutar), mensajes, ajustes y salida.
 */
export function HunterCluster({ avatarUrl, displayName }: HunterClusterProps) {
  return (
    <div className="hunt-cluster" aria-label="Cazadores y sistema">
      <span className="hunt-slot hunt-slot--active">
        <AvatarMenu avatarUrl={avatarUrl} displayName={displayName} size={44} />
      </span>
      <button type="button" className="hunt-slot" aria-label="Mensajes">
        <Mail size={16} aria-hidden="true" />
      </button>
      <Link href="/perfil" className="hunt-slot" aria-label="Ajustes">
        <Settings size={16} aria-hidden="true" />
      </Link>
      <button
        type="button"
        className="hunt-slot"
        aria-label="Salir"
        onClick={() => {
          clearGuestCookie()
          signOut({ callbackUrl: "/" })
        }}
      >
        <LogOut size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
