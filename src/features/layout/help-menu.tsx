"use client"

import { useEffect, useRef, useState } from "react"
import { Bug, Lightbulb } from "lucide-react"

/**
 * URLs del menú de ayuda. Centralizadas aquí para cambiarlas sin tocar
 * el marcado. Los reportes y sugerencias viven en Discord.
 */
export const SUPPORT_LINKS = {
  reportBug: "https://discord.com",
  suggestion: "https://discord.com",
} as const

/**
 * Botón "Ayuda" con desplegable de soporte (mismo patrón de
 * accesibilidad que AvatarMenu: Escape y clic fuera lo cierran).
 */
export function HelpMenu() {
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
  }, [open])

  return (
    <div className="hunt-help-menu" ref={root}>
      <button
        type="button"
        className="hunt-help-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        ◎ Ayuda
      </button>
      {open ? (
        <div className="hunt-help-drop" role="menu" aria-label="Ayuda y soporte">
          <p className="hunt-help-section hunt-help-section--first">Cuéntanos</p>
          <a
            href={SUPPORT_LINKS.reportBug}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            className="hunt-help-item"
            onClick={() => setOpen(false)}
          >
            <Bug size={15} aria-hidden="true" />
            Reportar bug
          </a>
          <a
            href={SUPPORT_LINKS.suggestion}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            className="hunt-help-item"
            onClick={() => setOpen(false)}
          >
            <Lightbulb size={15} aria-hidden="true" />
            Enviar sugerencia
          </a>
        </div>
      ) : null}
    </div>
  )
}
