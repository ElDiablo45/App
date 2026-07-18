"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { getAuthErrorMessage } from "./auth-errors"

interface LoginPanelProps {
  authenticated: boolean
  errorCode?: string
}

export function LoginPanel({ authenticated, errorCode }: LoginPanelProps) {
  const [accepted, setAccepted] = useState(false)
  const [pending, setPending] = useState(false)
  const [localError, setLocalError] = useState<string>()
  const errorMessage = localError ?? getAuthErrorMessage(errorCode)

  async function startDiscordLogin() {
    setPending(true)
    setLocalError(undefined)

    try {
      await signIn("discord", { callbackUrl: "/perfil" })
    } catch {
      setLocalError(
        "No se pudo conectar con Discord. Revisa tu conexión e inténtalo de nuevo.",
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="login-card" aria-labelledby="login-title">
      <div className="brand-mark" aria-hidden="true">
        DP
      </div>
      <p className="eyebrow">Tu espacio de Discord</p>
      <h1 id="login-title">Discord Panel</h1>
      <p className="login-intro">
        Conecta tu cuenta para descubrir qué información básica comparte
        Discord y preparar tu futuro panel de gestión.
      </p>

      <div className="permission-note">
        <span className="permission-dot" aria-hidden="true" />
        Solicitaremos únicamente acceso a tu identidad básica.
      </div>

      {errorMessage ? (
        <p className="auth-error" role="alert" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}

      {authenticated ? (
        <Link className="primary-action" href="/perfil">
          Ver mi perfil
        </Link>
      ) : (
        <>
          <label className="consent-control">
            <input
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              type="checkbox"
            />
            <span>
              Autorizo a Discord Panel a leer y mostrar temporalmente la
              información básica de mi perfil de Discord.
            </span>
          </label>

          <button
            className="primary-action"
            disabled={!accepted || pending}
            onClick={startDiscordLogin}
            type="button"
          >
            {pending ? "Conectando…" : "Continuar con Discord"}
          </button>
        </>
      )}

      <p className="privacy-footnote">
        No pedimos tu correo, servidores, mensajes ni permisos de bot.
      </p>
    </section>
  )
}
