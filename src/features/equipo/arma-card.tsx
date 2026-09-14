"use client"

import { Star } from "lucide-react"
import { useState } from "react"

export interface ArmaCardData {
  slug: string
  nombre: string
  imagenUrl: string
  tamano: number | null
  precio: number
  municion?: string
  tipo?: "armas" | "herramientas" | "consumibles"
  temas?: string[]
}

const TIPO_LABEL: Record<string, string> = {
  herramientas: "Herramienta",
  consumibles: "Consumible",
}

interface ArmaCardProps {
  arma: ArmaCardData
  seleccionada?: boolean
  bloqueada?: boolean
  onSelect?: (arma: ArmaCardData) => void
}

export function ArmaCard({ arma, seleccionada, bloqueada, onSelect }: ArmaCardProps) {
  const [fav, setFav] = useState(false)
  const tamanoTxt = arma.tamano == null ? "" : `, tamaño ${arma.tamano} de 5`
  const tipoTxt = arma.tipo && TIPO_LABEL[arma.tipo] ? `, ${TIPO_LABEL[arma.tipo]}` : ""
  return (
    <button
      type="button"
      aria-pressed={seleccionada ? "true" : "false"}
      aria-disabled={bloqueada ? "true" : undefined}
      aria-label={`${arma.nombre}, ◉ ${arma.precio}${tamanoTxt}${tipoTxt}`}
      onClick={() => onSelect?.(arma)}
      className={
        seleccionada
          ? "dz-arma-card dz-arma-card--selected"
          : bloqueada
            ? "dz-arma-card dz-arma-card--locked"
            : "dz-arma-card"
      }
    >
      <span className="dz-arma-top">
        <span
          role="button"
          tabIndex={0}
          aria-label={fav ? "Quitar de favoritas" : "Marcar como favorita"}
          aria-pressed={fav}
          onClick={(e) => {
            e.stopPropagation()
            setFav((v) => !v)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              e.stopPropagation()
              setFav((v) => !v)
            }
          }}
          className={fav ? "dz-arma-fav dz-arma-fav--active" : "dz-arma-fav"}
        >
          <Star size={14} aria-hidden />
        </span>
        <span className="dz-arma-name">{arma.nombre}</span>
        {arma.tipo && TIPO_LABEL[arma.tipo] ? <span className="dz-arma-kind">{TIPO_LABEL[arma.tipo]}</span> : null}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={arma.imagenUrl} alt={arma.nombre} loading="lazy" className="dz-arma-img" />
      <span className="dz-arma-bottom">
        {arma.tamano == null ? null : (
          <span className="dz-arma-size" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < arma.tamano! ? "dz-pip--on" : undefined} />
            ))}
          </span>
        )}
        <span className="dz-arma-cost">◉ {arma.precio}</span>
      </span>
    </button>
  )
}
