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
    <div className="eleven-login-shell">
      {/* LEFT */}
      <div className="eleven-login-left">
        <div className="eleven-login-left-inner">
          <div className="eleven-brand" aria-hidden="true">
            <span className="eleven-brand-icon">🦌</span>
            <span className="eleven-brand-text">
              <strong>HUNT</strong>
              <span>HISPANO</span>
            </span>
          </div>

          <h1 id="login-title" className="eleven-title">
            ¿Quieres formar
            <br />
            parte de Hunt Hispano?
          </h1>
          <p className="eleven-subtitle">
            Inicia sesión con Discord para solicitar tu whitelist y empezar a escribir tu historia en Hunt Hispano.
          </p>

          {errorMessage ? (
            <p className="eleven-error" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          ) : null}

          {authenticated ? (
            <Link className="eleven-primary-btn eleven-primary-btn--active" href="/perfil">
              <span className="eleven-discord-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M20.6 4.2a19.5 19.5 0 0 0-4.9-1.5 14.6 14.6 0 0 0-.7 1.5 17.3 17.3 0 0 0-5 0 14.6 14.6 0 0 0-.7-1.5A19.5 19.5 0 0 0 3.4 4.2a15 15 0 0 0-2 8.2 19.7 19.7 0 0 0 6 3.1l1-1.4a13.5 13.5 0 0 1-1.9-.9l.4-.3a14.1 14.1 0 0 0 8.3 0l.4.3a13.5 13.5 0 0 1-1.9.9l1 1.4a19.7 19.7 0 0 0 6-3.1 15 15 0 0 0-2-8.2ZM9.7 15.3a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Zm4.6 0a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Z" />
                </svg>
              </span>
              Ver mi perfil
            </Link>
          ) : (
            <>
              <label className="eleven-consent">
                <input
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  Acepto{" "}
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="eleven-link"
                  >
                    términos y condiciones
                  </a>{" "}
                  de Hunt Hispano
                </span>
              </label>

              <button
                className="eleven-primary-btn"
                disabled={!accepted || pending}
                onClick={startDiscordLogin}
                type="button"
              >
                <span className="eleven-discord-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M20.6 4.2a19.5 19.5 0 0 0-4.9-1.5 14.6 14.6 0 0 0-.7 1.5 17.3 17.3 0 0 0-5 0 14.6 14.6 0 0 0-.7-1.5A19.5 19.5 0 0 0 3.4 4.2a15 15 0 0 0-2 8.2 19.7 19.7 0 0 0 6 3.1l1-1.4a13.5 13.5 0 0 1-1.9-.9l.4-.3a14.1 14.1 0 0 0 8.3 0l.4.3a13.5 13.5 0 0 1-1.9.9l1 1.4a19.7 19.7 0 0 0 6-3.1 15 15 0 0 0-2-8.2ZM9.7 15.3a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Zm4.6 0a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8Z" />
                  </svg>
                </span>
                {pending ? "Conectando…" : "Iniciar sesión"}
              </button>
              <p className="eleven-consent-hint">
                Autorizo a Hunt Hispano a leer y mostrar temporalmente la información básica de mi perfil de Discord.
              </p>
            </>
          )}

          <nav className="eleven-socials" aria-label="Redes sociales">
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <span aria-hidden>𝕏</span> Twitter
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer">
              <span aria-hidden>◈</span> Discord
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              <span aria-hidden>▶</span> YouTube
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <span aria-hidden>◎</span> Instagram
            </a>
          </nav>
        </div>
      </div>

      {/* RIGHT */}
      <div className="eleven-login-right" aria-hidden="true">
        <div className="eleven-hero-stack">
          <div className="eleven-hero-card">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&h=500&fit=crop&auto=format"
              alt=""
              className="eleven-hero-img"
              loading="eager"
            />
            <div className="eleven-hero-overlay">Hunt Hispano — Territorio</div>
          </div>
          <div className="eleven-hero-card">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=500&fit=crop&auto=format"
              alt=""
              className="eleven-hero-img"
              loading="lazy"
            />
            <div className="eleven-hero-overlay">Hunt Hispano — Operativos</div>
          </div>
          <div className="eleven-hero-card">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&h=500&fit=crop&auto=format"
              alt=""
              className="eleven-hero-img"
              loading="lazy"
            />
            <div className="eleven-hero-overlay">Hunt Hispano — Tu historia</div>
          </div>
        </div>
        <p className="eleven-hero-note">
          Pon tus imágenes reales en <code>public/hunt/</code> como <code>hero-1.jpg</code>, <code>hero-2.jpg</code>, <code>hero-3.jpg</code> para reemplazar estos placeholders.
        </p>
      </div>
    </div>
  )
}
