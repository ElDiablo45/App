"use client"

import Image from "next/image"
import { useState } from "react"
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Cake,
  Calendar,
  Clock,
  Heart,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Link2,
  Lock,
  Mail,
  Shield,
  Ticket,
  Users,
} from "lucide-react"
import type { DiscordProfile } from "@/features/discord/discord-profile"

interface HuntProfileProps {
  profile: DiscordProfile
  discordRoles?: Array<{ id: string; name: string; color: string }>
  huntMember?: { joinedAt?: string; nick?: string | null } | null
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
  if (flags & 64) medals.push("🏠")
  if (flags & 1) medals.push("👑")
  if (medals.length === 0) return ["🇪🇸", "🍃", "💗"]
  return medals
}

export function HuntProfile({ profile, discordRoles, huntMember }: HuntProfileProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    informacion: true,
  })

  const toggle = (key: string) => setOpenSections((s) => ({ ...s, [key]: !s[key] }))

  const creationDate = discordCreationDate(profile.id)
  const huntJoinedAt = huntMember?.joinedAt ? new Date(huntMember.joinedAt) : null
  const huntCreatedPlaceholder = new Date("2026-04-05T10:00:00Z")
  const avatarInitial = profile.displayName.trim().charAt(0).toUpperCase() || "?"

  const medals = medalsFromFlags(profile.publicFlags)
  const roles = discordRoles?.length
    ? discordRoles
    : [
        { id: "1", name: "Whitelisted", color: "#3b82f6" },
        { id: "2", name: "Historia Aceptada", color: "#22c55e" },
        ...(profile.primaryGuild ? [{ id: "pg", name: profile.primaryGuild.tag, color: "#a78bfa" }] : []),
      ]

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
            {profile.avatarDecorationUrl ? (
              <Image src={profile.avatarDecorationUrl} alt="" width={180} height={180} className="hunt-avatar-decoration" unoptimized />
            ) : null}
          </div>

          <h2 className="hunt-name">
            {profile.displayName} <Heart size={16} className="hunt-heart-icon" />
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
            <p className="hunt-roles-hint" style={{ fontSize: "11px", color: huntMember ? "#22c55e" : "#f59e0b", margin: "0 0 8px" }}>
              {huntMember ? `Roles de Discord · en vivo (${roles.length})` : "Roles de Discord · placeholder (conecta bot para ver los reales)"}
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
                <Mail size={12} /> mdavidrp2007@outlook.com
              </li>
              <li>
                <a href="https://steamcommunity.com/id/ELDI..." target="_blank" rel="noreferrer">
                  <Link2 size={12} /> https://steamcommunity.com/id/ELDI...
                </a>
              </li>
              <li>
                <Cake size={12} /> Nacimiento 15 de febrero de 2002
              </li>
              <li>
                <Calendar size={12} /> Se unió {huntJoinedAt ? timeAgoEs(huntJoinedAt) : `${timeAgoEs(huntCreatedPlaceholder)} (placeholder)`}
              </li>
              <li>
                <Shield size={12} /> Whitelist aprobada
              </li>
              <li>
                <BadgeCheck size={12} /> Verificado {huntJoinedAt ? formatDateEs(huntJoinedAt) : `${formatDateEs(huntCreatedPlaceholder)} (placeholder)`}
              </li>
              <li>
                <BookMarked size={12} /> Última historia aprobada: No especificada
              </li>
            </ul>
            {!huntMember ? (
              <p style={{ marginTop: "8px", color: "#f59e0b", fontSize: "11px", lineHeight: "1.4" }}>
                ⚠ Sin conexión a Hunt Discord — añade HUNT_GUILD_ID + DISCORD_BOT_TOKEN en .env.local para ver tu fecha real de entrada.
              </p>
            ) : null}
          </div>
        </div>

        <div className="hunt-profile-right">
          <div className="hunt-stats">
            <div className="hunt-stat">
              <div className="hunt-stat-icon hunt-stat-icon--blue">
                <Users size={16} />
              </div>
              <div>
                <p className="hunt-stat-label">Personajes</p>
                <p className="hunt-stat-value">0</p>
              </div>
            </div>
            <div className="hunt-stat">
              <div className="hunt-stat-icon hunt-stat-icon--green">
                <Clock size={16} />
              </div>
              <div>
                <p className="hunt-stat-label">Tiempo en Hunt Hispano</p>
                <p className="hunt-stat-value">0h 0m</p>
              </div>
            </div>
          </div>

          <div className="hunt-accordion">
            <div className={`hunt-acc-item ${openSections.informacion ? "hunt-acc-item--open" : ""}`}>
              <button className="hunt-acc-head" onClick={() => toggle("informacion")} type="button">
                <span>
                  <Info size={14} className="hunt-acc-icon" /> Información
                </span>
                <span className="hunt-acc-chevron">⌃</span>
              </button>
              {openSections.informacion ? (
                <div className="hunt-acc-body">
                  <div className="hunt-info-card">
                    <div className="hunt-info-row">
                      <span>Cuenta creada</span>
                      <strong>{huntJoinedAt ? formatDateEs(huntJoinedAt) : `${formatDateEs(huntCreatedPlaceholder)} (placeholder)`}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Se unió a Hunt Discord</span>
                      <strong>{huntJoinedAt ? `${formatDateEs(huntJoinedAt)} · ${timeAgoEs(huntJoinedAt)}` : `${timeAgoEs(huntCreatedPlaceholder)} (placeholder — configura bot)`}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Discord creado</span>
                      <strong>{formatDateEs(creationDate)}</strong>
                    </div>
                    <div className="hunt-info-row">
                      <span>Balance total</span>
                      <strong>0 US$ (requiere API Hunt)</strong>
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
                    <div className="hunt-info-row">
                      <span>Nick en Hunt</span>
                      <strong>{huntMember?.nick ?? profile.displayName}</strong>
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
              { key: "personajes", label: "Personajes", icon: Users },
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
