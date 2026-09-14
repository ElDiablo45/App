"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ExternalLink, X } from "lucide-react"
import { STREAMER_ROLE_ID } from "@/features/discord/roles"
import { ROLE_MEDALS, type RoleMedal } from "@/features/profile/role-medals"
import { RoleMedalBadge } from "@/features/profile/role-medal"
import type { StreamerMember } from "./discord-members"

interface HomeStreamersProps {
  members?: StreamerMember[]
}

const STREAMER_MEDAL: RoleMedal = {
  roleId: STREAMER_ROLE_ID,
  roleName: "Streamer",
  automatic: true,
  ...ROLE_MEDALS[STREAMER_ROLE_ID]!,
}

/**
 * Streamers de la comunidad (rol Streamer de Discord) como medallas.
 * Al clicar una tarjeta se abre un popup in-app con su perfil de Discord.
 */
export function HomeStreamers({ members }: HomeStreamersProps) {
  const [selected, setSelected] = useState<StreamerMember | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selected) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null)
    }
    document.addEventListener("keydown", onKey)
    dialogRef.current?.querySelector("button")?.focus()
    return () => document.removeEventListener("keydown", onKey)
  }, [selected])

  if (!members || members.length === 0) {
    return (
      <div className="hunt-home-section">
        <h2 className="hunt-home-heading">Streamers de la comunidad</h2>
        <p className="hunt-acc-empty">Aún no hay streamers en la comunidad.</p>
      </div>
    )
  }

  return (
    <div className="hunt-home-section">
      <h2 className="hunt-home-heading hunt-home-heading--center">Streamers de la comunidad</h2>
      <div className="hunt-streamers-viewport">
        <div className="hunt-streamers-track">
          {[false, true].map((copy) => (
            <div key={copy ? "b" : "a"} className="hunt-streamers-group" aria-hidden={copy || undefined}>
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="hunt-streamer-tile"
                  aria-haspopup="dialog"
                  onClick={() => setSelected(m)}
                  tabIndex={copy ? -1 : undefined}
                >
                  <span className="hunt-streamer-portrait">
                    <Image src={m.avatarUrl} alt="" width={96} height={96} className="hunt-streamer-avatar" unoptimized />
                    <span className="hunt-streamer-seal">
                      <RoleMedalBadge medal={STREAMER_MEDAL} />
                    </span>
                  </span>
                  <p className="hunt-streamer-name" title={m.name}>
                    {m.name}
                  </p>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div
          className="hunt-streamer-backdrop"
          onClick={() => setSelected(null)}
        >
          <div
            ref={dialogRef}
            className="hunt-streamer-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Perfil de ${selected.name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="hunt-streamer-close"
              aria-label="Cerrar"
              onClick={() => setSelected(null)}
            >
              <X size={16} aria-hidden="true" />
            </button>
            <Image
              src={selected.avatarUrl}
              alt={selected.name}
              width={96}
              height={96}
              className="hunt-streamer-modal-avatar"
              unoptimized
            />
            <p className="hunt-streamer-modal-name">{selected.name}</p>
            <p className="hunt-streamer-modal-since">En la comunidad desde hace {selected.sinceLabel}</p>
            <p className="hunt-streamer-modal-id">{selected.id}</p>
            <div className="hunt-streamer-modal-actions">
              <a
                href={`https://discord.com/users/${selected.id}`}
                target="_blank"
                rel="noreferrer"
                className="hunt-lo-btn"
                style={{ textDecoration: "none" }}
              >
                <ExternalLink size={14} aria-hidden="true" /> Abrir en Discord
              </a>
              <button type="button" className="hunt-lo-btn" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
