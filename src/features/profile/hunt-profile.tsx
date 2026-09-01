"use client"

import Image from "next/image"
import { useState } from "react"
import type { DiscordProfile } from "@/features/discord/discord-profile"

interface HuntProfileProps {
  profile: DiscordProfile
  // Roles will come from Discord guild later; for now we render Discord-derived + Hunt placeholders
  discordRoles?: Array<{ id: string; name: string; color: string }>
}

function discordCreationDate(id: string): Date {
  // Discord snowflake: (id >> 22) + 1420070400000
  try {
    const ts = Number(BigInt(id) >> BigInt(22)) + 1420070400000
    return new Date(ts)
  } catch {
    return new Date()
  }
}

function formatDateEs(date: Date): string {
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
}

function timeAgoEs(date: Date): string {
  const diff = Date.now() - date.getTime()
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30))
  if (months <= 0) return "hace menos de un mes"
  if (months === 1) return "hace 1 mes"
  if (months < 12) return `hace ${months} meses`
  const years = Math.floor(months / 12)
  return years === 1 ? "hace 1 año" : `hace ${years} años`
}

function medalsFromFlags(flags: number): string[] {
  const medals: string[] = []
  if (flags & 64) medals.push("🏠") // HypeSquad Bravery placeholder
  if (flags & 1) medals.push("👑")
  // siempre mostramos al menos Hunt placeholders como en captura hasta tener datos reales
  if (medals.length === 0) return ["🇪🇸", "🍃", "💗"]
  return medals
}

export function HuntProfile({ profile, discordRoles }: HuntProfileProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    informacion: true,
  })

  const toggle = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }))

  const creationDate = discordCreationDate(profile.id)
  // Mock Hunt account creation: 5 abril 2026 as in screenshot
  const huntCreated = new Date("2026-04-05T10:00:00Z")
  const avatarInitial = profile.displayName.trim().charAt(0).toUpperCase() || "?"

  const medals = medalsFromFlags(profile.publicFlags)
  // Roles: prefer Discord guild roles if provided, else Hunt placeholders + primaryGuild
  const roles = discordRoles?.length
    ? discordRoles
    : [
        { id: "1", name: "Whitelisted", color: "#3b82f6" },
        { id: "2", name: "Historia Aceptada", color: "#22c55e" },
        ...(profile.primaryGuild ? [{ id: "pg", name: profile.primaryGuild.tag, color: "#a78bfa" }] : []),
      ]

  return (
    <div className="hunt-profile">
      {/* Banner */}
      <div className="hunt-banner">
        {profile.bannerUrl ? (
          <Image src={profile.bannerUrl} alt="" fill priority sizes="(max-width: 1024px) 100vw, 900px" className="hunt-banner-img" />
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=1400&h=400&fit=crop&auto=format"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 900px"
            className="hunt-banner-img"
          />
        )}
        <button className="hunt-banner-edit" type="button">
          Editar banner
        </button>
      </div>

      <div className="hunt-profile-grid">
        {/* LEFT */}
        <div className="hunt-profile-left">
          <div className="hunt-avatar-wrap">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`Avatar de ${profile.displayName}`}
                width={140}
                height={140}
                className="hunt-avatar"
                priority
              />
            ) : (
              <div className="hunt-avatar hunt-avatar-fallback">{avatarInitial}</div>
            )}
            {profile.avatarDecorationUrl ? (
              <Image src={profile.avatarDecorationUrl} alt="" width={160} height={160} className="hunt-avatar-decoration" unoptimized />
            ) : null}
          </div>

          <h2 className="hunt-name">
            {profile.displayName} <span className="hunt-heart">🤍</span>
          </h2>
          <p className="hunt-handle">
            @{profile.username} · {profile.id}
          </p>

          <button className="hunt-edit-btn" type="button">
            Editar perfil
          </button>

          <div className="hunt-section">
            <p className="hunt-label">MEDALLAS</p>
            <div className="hunt-medals">
              {medals.map((m, i) => (
                <span key={i} className="hunt-medal">
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div className="hunt-section">
            <p className="hunt-label">ROLES</p>
            <p className="hunt-roles-hint" style={{ fontSize: "11px", color: "#6f7589", margin: "0 0 8px" }}>
              Roles de Discord {discordRoles ? "· en vivo" : "· placeholder (conecta bot)"}
            </p>
            <div className="hunt-roles">
              {roles.map((r) => (
                <span key={r.id} className="hunt-role" style={{ borderColor: r.color }}>
                  <span className="hunt-role-dot" style={{ background: r.color }} />
                  {r.name}
                </span>
              ))}
            </div>
          </div>

          <div className="hunt-section">
            <p className="hunt-label">INFO</p>
            <ul className="hunt-info">
              <li>
                <span>✉</span> mdavidrp2007@outlook.com
              </li>
              <li>
                <a href="https://steamcommunity.com/id/ELDI..." target="_blank" rel="noreferrer">
                  <span>◎</span> https://steamcommunity.com/id/ELDI...
                </a>
              </li>
              <li>
                <span>🎂</span> Nacimiento 15 de febrero de 2002
              </li>
              <li>
                <span>📅</span> Se unió {timeAgoEs(huntCreated)}
              </li>
              <li>
                <span>🛡</span> Whitelist aprobada
              </li>
              <li>
                <span>✔</span> Verificado {formatDateEs(huntCreated)}
              </li>
              <li>
                <span>📖</span> Última historia aprobada: No especificada
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hunt-profile-right">
          <div className="hunt-stats">
            <div className="hunt-stat">
              <div className="hunt-stat-icon hunt-stat-icon--blue">👥</div>
              <div>
                <p className="hunt-stat-label">Personajes</p>
                <p className="hunt-stat-value">0</p>
              </div>
            </div>
            <div className="hunt-stat">
              <div className="hunt-stat-icon hunt-stat-icon--green">◷</div>
              <div>
                <p className="hunt-stat-label">Tiempo en Hunt Hispano</p>
                <p className="hunt-stat-value">0h 0m</p>
              </div>
            </div>
          </div>

          <div className="hunt-accordion">
            {/* Información - expanded by default */}
            <div className={`hunt-acc-item ${openSections.informacion ? "hunt-acc-item--open" : ""}`}>
              <button className="hunt-acc-head" onClick={() => toggle("informacion")} type="button">
                <span>
                  <span className="hunt-acc-icon">ⓘ</span> Información
                </span>
                <span className="hunt-acc-chevron">⌃</span>
              </button>
              {openSections.informacion ? (
                <div className="hunt-acc-body">
                  <div className="hunt-info-card">
                    <div className="hunt-info-row">
                      <span>Cuenta creada</span>
                      <strong>{formatDateEs(huntCreated)}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Se unió al Discord</span>
                      <strong>{timeAgoEs(huntCreated)}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Discord creado</span>
                      <strong>{formatDateEs(creationDate)}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Balance total</span>
                      <strong>0 US$</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Idioma</span>
                      <strong>{profile.locale ?? "es-ES"}</strong>
                    </div>
                    {profile.primaryGuild ? (
                      <div className="hunt-info-row">
                        <span>Guild principal</span>
                        <strong>{profile.primaryGuild.tag}</strong>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {[
              { key: "personajes", label: "Personajes", icon: "👥" },
              { key: "historias", label: "Historias", icon: "📖" },
              { key: "tickets", label: "Tickets", icon: "🎫" },
              { key: "sugerencias", label: "Sugerencias y bugs", icon: "💡" },
              { key: "sanciones", label: "Sanciones", icon: "⚠" },
              { key: "actividad", label: "Actividad", icon: "〰" },
              { key: "paso", label: "Tu paso por Hunt Hispano", icon: "🖼" },
              { key: "privacidad", label: "Privacidad", icon: "🔒" },
            ].map((s) => (
              <div key={s.key} className={`hunt-acc-item ${openSections[s.key] ? "hunt-acc-item--open" : ""}`}>
                <button className="hunt-acc-head" onClick={() => toggle(s.key)} type="button">
                  <span>
                    <span className="hunt-acc-icon">{s.icon}</span> {s.label}
                  </span>
                  <span className="hunt-acc-chevron">⌄</span>
                </button>
                {openSections[s.key] ? (
                  <div className="hunt-acc-body">
                    <p className="hunt-acc-empty">Próximamente — esta sección se conectará a la base de datos de Hunt Hispano.</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
