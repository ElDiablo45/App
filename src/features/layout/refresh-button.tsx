"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Check } from "lucide-react"
import { syncRoles } from "./refresh-action"

export function RefreshButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  // El toast va a document.body vía portal: el topbar usa backdrop-filter
  // y eso lo convertiría en bloque contenedor del `position: fixed`,
  // dejando el aviso cortado/desplazado. `notice` solo existe tras un
  // clic (siempre en cliente), así que `document` está disponible.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  async function onRefresh() {
    if (pending) return
    setPending(true)
    setNotice(null)
    try {
      const result = await syncRoles(pathname)
      if (result.ok) {
        setNotice(
          result.changed
            ? "Rangos sincronizados correctamente."
            : "No hay rangos pendientes de sincronizar.",
        )
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setNotice(null), 4000)
      }
    } catch {
      // Purga best-effort: aunque falle la red, el refresh local sigue
      // re-renderizando con los últimos datos disponibles.
    } finally {
      router.refresh()
      setPending(false)
    }
  }

  return (
    <>
      <span className="hunt-refresh-wrap">
        <button
          className="hunt-icon-btn"
          type="button"
          aria-label="Refrescar"
          aria-describedby="refresh-tip"
          onClick={onRefresh}
          disabled={pending}
        >
          ↻
        </button>
        <span className="hunt-refresh-tip" role="tooltip" id="refresh-tip">
          Vuelve a leer tus roles de Discord y actualiza tus rangos y permisos en la web
        </span>
      </span>
      {notice
        ? createPortal(
            <div className="hunt-toast" role="status">
              <Check size={14} aria-hidden="true" /> {notice}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
