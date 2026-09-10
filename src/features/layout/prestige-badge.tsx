"use client"

import { useEffect, useState } from "react"
import { Medal } from "lucide-react"
import { getMyPrestige } from "./hunter-hud-action"

/**
 * Badge de prestigio arriba a la izquierda (HUD estilo Hunt).
 * No renderiza nada mientras carga o si no hay prestigio.
 * Con `disabled` (p. ej. sesión de invitado) ni siquiera pide el nivel.
 *
 * El prestigio cambia poco (roles de Discord), así que se cachea en memoria
 * a nivel de módulo: navegar entre home/perfil/equipo desmonta y remonta
 * este componente, pero reutiliza la misma promesa y no dispara otro POST
 * de `getMyPrestige()` hasta que expire el TTL.
 */
type PrestigeResult = { ok: true; level?: number } | { ok: false }

let cachedPromise: Promise<PrestigeResult> | null = null
let cachedAt = 0
const PRESTIGE_TTL_MS = 5 * 60 * 1000

function getCachedPrestige(): Promise<PrestigeResult> {
  if (!cachedPromise || Date.now() - cachedAt > PRESTIGE_TTL_MS) {
    cachedAt = Date.now()
    cachedPromise = getMyPrestige() as Promise<PrestigeResult>
    // Si falla, liberar la caché para permitir reintento posterior
    // sin dejar un rejection cacheado.
    cachedPromise.catch(() => {
      cachedPromise = null
    })
  }
  return cachedPromise
}

/** Solo para tests: limpia la caché en memoria. */
export function __resetPrestigeCache() {
  cachedPromise = null
  cachedAt = 0
}

export function PrestigeBadge({ disabled = false }: { disabled?: boolean }) {
  const [level, setLevel] = useState<number | undefined>(undefined)
  const [done, setDone] = useState(disabled)

  useEffect(() => {
    if (disabled) return
    let alive = true
    getCachedPrestige()
      .then((res) => {
        if (alive && res.ok) setLevel(res.level)
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setDone(true)
      })
    return () => {
      alive = false
    }
  }, [disabled])

  if (!done || level === undefined) return null

  return (
    <span className="hunt-prestige" title={`Prestigio ${level}`} aria-label={`Prestigio ${level}`}>
      <Medal size={17} aria-hidden="true" />
      <span className="hunt-prestige-num">Prestigio {level}</span>
    </span>
  )
}
