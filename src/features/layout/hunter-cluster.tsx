"use client"

import { AvatarMenu } from "./avatar-menu"

interface HunterClusterProps {
  avatarUrl?: string
  displayName?: string
}

/**
 * Bloque derecho de la barra Hunt: avatar actual con su menú
 * desplegable (perfil / cerrar sesión).
 */
export function HunterCluster({ avatarUrl, displayName }: HunterClusterProps) {
  return (
    <div className="hunt-cluster" aria-label="Cazadores y sistema">
      <span className="hunt-slot hunt-slot--active">
        <AvatarMenu avatarUrl={avatarUrl} displayName={displayName} size={44} />
      </span>
    </div>
  )
}
