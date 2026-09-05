"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { syncRoles } from "./refresh-action"

export function RefreshButton() {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      <button
        className="hunt-icon-btn"
        type="button"
        aria-label="Refrescar"
        onClick={onRefresh}
        disabled={pending}
      >
        ↻
      </button>
      {notice ? (
        <div className="hunt-toast" role="status">
          <Check size={14} aria-hidden="true" /> {notice}
        </div>
      ) : null}
    </>
  )
}
