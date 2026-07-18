"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"

export function SignOutButton() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()

  async function endSession() {
    setPending(true)
    setError(undefined)

    try {
      await signOut({ callbackUrl: "/" })
    } catch {
      setError("No se pudo cerrar la sesión. Inténtalo de nuevo.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="sign-out-control">
      <button
        className="secondary-action"
        disabled={pending}
        onClick={endSession}
        type="button"
      >
        {pending ? "Cerrando…" : "Cerrar sesión"}
      </button>
      {error ? (
        <p className="inline-error" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  )
}
