"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  COUNTRIES,
  validateRegistro,
  type RegistroErrors,
} from "./registro-validation"
import { completarRegistro } from "./registro-actions"

interface RegistroFormProps {
  username: string
  discordId: string
  avatarUrl?: string
  initialEmail?: string | null
}

function adultCutoff() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

export function RegistroForm({
  username,
  discordId,
  avatarUrl,
  initialEmail,
}: RegistroFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail ?? "")
  const [birthDate, setBirthDate] = useState("")
  const [nationality, setNationality] = useState("")
  const [errors, setErrors] = useState<RegistroErrors>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  const canSubmit = useMemo(
    () => email.trim().length > 0 && birthDate.length > 0 && !pending,
    [email, birthDate, pending],
  )

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setFormError(undefined)

    const trimmed = {
      email: email.trim(),
      birthDate: birthDate.trim(),
      nationality: nationality.trim(),
    }
    const validation = validateRegistro(trimmed)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setPending(true)
    try {
      const result = await completarRegistro({ ...trimmed, discordId })
      if (result.ok) {
        router.push("/")
        router.refresh()
        return
      }
      if ("errors" in result && result.errors) setErrors(result.errors)
      if ("error" in result && result.error) setFormError(result.error)
    } catch {
      setFormError("No se pudo guardar el registro. Inténtalo de nuevo.")
    } finally {
      setPending(false)
    }
  }

  const fallbackInitial = username.trim().charAt(0).toUpperCase() || "?"

  return (
    <div className="eleven-registro-inner">
      <div className="eleven-registro-avatar" aria-hidden="true">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={username} width={40} height={40} />
        ) : (
          <span className="eleven-registro-fallback">{fallbackInitial}</span>
        )}
      </div>

      <h1 className="eleven-registro-title">Completa tu registro</h1>
      <p className="eleven-registro-sub">
        Discord detectado como <strong>{username}</strong>. Solo faltan unos
        datos.
      </p>

      {formError ? (
        <p className="eleven-error" role="alert">
          {formError}
        </p>
      ) : null}

      <form onSubmit={onSubmit} noValidate>
        <div className="eleven-field">
          <label className="eleven-label" htmlFor="registro-email">
            Email
          </label>
          <input
            id="registro-email"
            className="eleven-input"
            type="email"
            autoComplete="email"
            placeholder="agenciadakrox@proton.me"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email ? (
            <p className="eleven-field-error" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="eleven-field">
          <label className="eleven-label" htmlFor="registro-birth">
            Fecha de nacimiento
          </label>
          <input
            id="registro-birth"
            className="eleven-input"
            type="date"
            min="1900-01-01"
            max={adultCutoff()}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
          {errors.birthDate ? (
            <p className="eleven-field-error" role="alert">
              {errors.birthDate}
            </p>
          ) : null}
        </div>

        <div className="eleven-field">
          <label className="eleven-label" htmlFor="registro-country">
            Nacionalidad
          </label>
          <select
            id="registro-country"
            className="eleven-select"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          >
            <option value="">Seleccionar país...</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="eleven-hint">
            Opcional. Desbloquea medallas de bandera en tu perfil.
          </p>
          {errors.nationality ? (
            <p className="eleven-field-error" role="alert">
              {errors.nationality}
            </p>
          ) : null}
        </div>

        <button
          className="eleven-submit"
          type="submit"
          disabled={!canSubmit}
        >
          {pending ? "Guardando…" : "Completar registro"}
        </button>
      </form>
    </div>
  )
}
