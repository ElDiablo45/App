"use client"

import { signOut } from "next-auth/react"
import { useState } from "react"

export function SignOutButton() {
  const [pending, setPending] = useState(false)

  async function endSession() {
    setPending(true)
    await signOut({ callbackUrl: "/" })
    setPending(false)
  }

  return (
    <button
      className="secondary-action"
      disabled={pending}
      onClick={endSession}
      type="button"
    >
      {pending ? "Cerrando…" : "Cerrar sesión"}
    </button>
  )
}
