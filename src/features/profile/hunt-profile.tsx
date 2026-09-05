"use client"

import Image from "next/image"
import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Lock,
  Mail,
  MessageSquare,
  Ticket,
  Users,
} from "lucide-react"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import type { HuntMessage } from "@/features/profile/discord-messages"
import { buildActivity } from "@/features/profile/profile-activity"
import { medalsForRoles, VERIFIED_ROLE_ID } from "@/features/profile/role-medals"
import { RoleMedalBadge } from "@/features/profile/role-medal"

interface HuntProfileProps {
  profile: DiscordProfile
  email?: string | null
  discordRoles?: Array<{ id: string; name: string; color: string }>
  huntMember?: { joinedAt?: string; nick?: string | null } | null
  huntMessages?: HuntMessage[]
  verifiedAt?: string | null
  medalDates?: Record<string, string> | null
}

function discordCreationDate(id: string): Date {
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
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return "hoy"
  if (diffDays === 1) return "ayer"
  if (diffDays < 30) return `hace ${diffDays} días`
  const months = Math.floor(diffDays / 30)
  if (months === 1) return "hace 1 mes"
  if (months < 12) return `hace ${months} meses`
  const years = Math.floor(months / 12)
  return years === 1 ? "hace 1 año" : `hace ${years} años`
}

export function HuntProfile({ profile, email, discordRoles, huntMember, huntMessages, verifiedAt, medalDates }: HuntProfileProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    informacion: true,
  })

  const toggle = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }))

  const creationDate = discordCreationDate(profile.id)
  const huntJoinedAt = huntMember?.joinedAt ? new Date(huntMember.joinedAt) : null
  const huntCreatedPlaceholder = new Date("2026-04-05T10:00:00Z")
  const avatarInitial = profile.displayName.trim().charAt(0).toUpperCase() || "?"

  const roles = discordRoles?.length
    ? discordRoles
    : [
        { id: "1", name: "Whitelisted", color: "#3b82f6" },
        { id: "2", name: "Historia Aceptada", color: "#22c55e" },
        ...(profile.primaryGuild ? [{ id: "pg", name: profile.primaryGuild.tag, color: "#a78bfa" }] : []),
      ]
  const medals = medalsForRoles(roles)
  const verifiedDate = verifiedAt ? new Date(verifiedAt) : null
  const verifiedDateLabel =
    verifiedDate && !Number.isNaN(verifiedDate.getTime())
      ? timeAgoEs(verifiedDate)
      : undefined
  const isVerified = roles.some((r) => r.id === VERIFIED_ROLE_ID)
  const validIso = (iso?: string | null) => {
    if (!iso) return null
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? null : iso
  }
  const verifiedISO = validIso(verifiedAt)
  const joinedISO = huntJoinedAt ? huntJoinedAt.toISOString() : null
  // Fecha por medalla: audit-log real > registro (verificada) > unión. Nunca inventada.
  const medalAt = (m: { roleId: string }) =>
    medalDates?.[m.roleId] ??
    (m.roleId === VERIFIED_ROLE_ID ? (verifiedISO ?? joinedISO) : joinedISO)
  const activityEvents = buildActivity({
    guildJoinedAt: joinedISO,
    registroAt: verifiedISO,
    verifiedAt: verifiedISO,
    medals: medals.map((m) => ({
      title: m.title,
      verified: m.roleId === VERIFIED_ROLE_ID,
      at: medalAt(m),
    })),
  })

  const messageCount = huntMessages?.length

  return (
    <div className="hunt-profile">
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
        <div className="hunt-profile-left">
          <div className="hunt-avatar-wrap">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`Avatar de ${profile.displayName}`}
                width={150}
                height={150}
                className="hunt-avatar"
                priority
              />
            ) : (
              <div className="hunt-avatar hunt-avatar-fallback">{avatarInitial}</div>
            )}
          </div>

          <h2 className="hunt-name">
            {profile.displayName}
            {isVerified ? (
              <span className="hunt-verified">
                <BadgeCheck size={14} aria-hidden="true" /> Verificado
              </span>
            ) : null}
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
              {medals.length ? (
                medals.map((m) => (
                  <RoleMedalBadge
                    key={m.roleId}
                    medal={m}
                    dateLabel={
                      medalAt(m) ? timeAgoEs(new Date(medalAt(m) as string)) : undefined
                    }
                  />
                ))
              ) : (
                <p className="hunt-acc-empty">Sin medallas todavía.</p>
              )}
            </div>
          </div>

          <div className="hunt-section">
            <p className="hunt-label">ROLES</p>
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
                <Mail size={12} /> {email ?? profile.email ?? "—"}
              </li>
              {verifiedDateLabel ? (
                <li>
                  <BadgeCheck size={12} /> Verificado {verifiedDateLabel}
                </li>
              ) : null}
              {huntJoinedAt ? (
                <li>
                  <Users size={12} /> Se unió al Discord {formatDateEs(huntJoinedAt)}
                </li>
              ) : (
                <li>
                  <Users size={12} /> En Discord desde {formatDateEs(creationDate)}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="hunt-profile-right">
          <div className="hunt-stats">
            <div className="hunt-stat">
              <div className="hunt-stat-icon hunt-stat-icon--blue">
                <MessageSquare size={16} />
              </div>
              <div>
                <p className="hunt-stat-label">Mensajes</p>
                <p className="hunt-stat-value">{typeof messageCount === "number" ? messageCount : "—"}</p>
              </div>
            </div>
          </div>

          <div className="hunt-accordion">
            <div className={`hunt-acc-item ${openSections.informacion ? "hunt-acc-item--open" : ""}`}>
              <button className="hunt-acc-head" onClick={() => toggle("informacion")} type="button">
                <span>
                  <Info size={14} className="hunt-acc-icon" /> Información
                </span>
                <span className="hunt-acc-chevron">⌄</span>
              </button>
              {openSections.informacion ? (
                <div className="hunt-acc-body">
                  <div className="hunt-info-card">
                    <div className="hunt-info-row">
                      <span>Discord creado</span>
                      <strong>{formatDateEs(creationDate)}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Se unió a Hunt Discord</span>
                      <strong>{huntJoinedAt ? `${formatDateEs(huntJoinedAt)} · ${timeAgoEs(huntJoinedAt)}` : `${timeAgoEs(huntCreatedPlaceholder)} (placeholder — configura bot)`}</strong>
                    </div>
                  </div>
                  {!huntMember ? (
                    <p style={{ marginTop: "8px", color: "#f59e0b", fontSize: "11px" }}>
                      Datos de Hunt Discord no conectados — añade HUNT_GUILD_ID y DISCORD_BOT_TOKEN y revalida.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {[
              { key: "mensajes", label: "Mensajes", icon: MessageSquare },
              { key: "historias", label: "Historias", icon: BookOpen },
              { key: "tickets", label: "Tickets", icon: Ticket },
              { key: "sugerencias", label: "Sugerencias y bugs", icon: Lightbulb },
              { key: "sanciones", label: "Sanciones", icon: AlertTriangle },
              { key: "actividad", label: "Actividad", icon: Activity },
              { key: "paso", label: "Tu paso por Hunt Hispano", icon: ImageIcon },
              { key: "privacidad", label: "Privacidad", icon: Lock },
            ].map((s) => (
              <div key={s.key} className={`hunt-acc-item ${openSections[s.key] ? "hunt-acc-item--open" : ""}`}>
                <button className="hunt-acc-head" onClick={() => toggle(s.key)} type="button">
                  <span>
                    <s.icon size={14} className="hunt-acc-icon" /> {s.label}
                  </span>
                  <span className="hunt-acc-chevron">⌄</span>
                </button>
                {openSections[s.key] ? (
                  <div className="hunt-acc-body">
                    {s.key === "mensajes" ? (
                      huntMessages === undefined ? (
                        <p className="hunt-acc-empty">
                          Sin conexión a Discord o sin permisos — añade HUNT_GUILD_ID + DISCORD_BOT_TOKEN con permisos de lectura para ver tus mensajes en Hunt Hispano.
                        </p>
                      ) : huntMessages.length === 0 ? (
                        <p className="hunt-acc-empty">No se encontraron mensajes recientes tuyos en los canales de texto de Hunt Hispano (últimos 100 por canal).</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <p style={{ margin: 0, color: "#9aa0b5", fontSize: "11px" }}>
                            Mostrando {huntMessages.length} mensajes recientes (muestra limitada a 100 por canal).
                          </p>
                          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                            {huntMessages.map((m) => (
                              <li
                                key={m.id}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: "10px",
                                  background: "#0a0a0a",
                                  border: "1px solid #1e1e1e",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                  <span style={{ color: "#a78bfa", fontSize: "11px", fontWeight: 600 }}>#{m.channelName}</span>
                                  <span style={{ color: "#6f7589", fontSize: "10px" }}>{new Date(m.timestamp).toLocaleString("es-ES")}</span>
                                </div>
                                <p style={{ margin: 0, color: "#e8e9ef", fontSize: "12px", lineHeight: 1.5, overflowWrap: "anywhere" }}>{m.content}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ) : s.key === "actividad" ? (
                      activityEvents.length ? (
                        <div className="hunt-info-card">
                          <div className="hunt-info-row hunt-act-head">
                            <span>Evento</span>
                            <span>Fecha</span>
                          </div>
                          {activityEvents.map((e) => (
                            <div key={e.id} className="hunt-info-row hunt-act-row">
                              <span>{e.label}</span>
                              <strong>{e.at ? timeAgoEs(new Date(e.at)) : "—"}</strong>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="hunt-acc-empty">Sin actividad registrada todavía.</p>
                      )
                    ) : (
                      <p className="hunt-acc-empty">Próximamente — esta sección se conectará a la base de datos de Hunt Hispano.</p>
                    )}
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
