"use client"

import { ArmaCard, type ArmaCardData } from "./arma-card"

interface ArmaGridProps {
  armas: ArmaCardData[]
  query: string
  tamanos: number[]
  temas?: string[]
  capacidadRestante: number
  seleccionSlug?: string | null
  onSelect?: (arma: ArmaCardData) => void
}

export function ArmaGrid({ armas, query, tamanos, temas = [], capacidadRestante, seleccionSlug, onSelect }: ArmaGridProps) {
  const q = query.trim().toLowerCase()
  const visibles = armas.filter((a) => {
    if (a.tamano != null && tamanos.length > 0 && !tamanos.includes(a.tamano)) return false
    if (temas.length > 0 && !temas.some((t) => a.temas?.includes(t))) return false
    if (q && !a.nombre.toLowerCase().includes(q)) return false
    return true
  })
  if (visibles.length === 0) {
    return <p className="dz-empty-msg">Lista vacía debido a los filtros activos actuales</p>
  }
  return (
    <div className="dz-arma-grid dz-arma-scroll" role="list" aria-label="Armas">
      {visibles.map((arma) => (
        <ArmaCard
          key={arma.slug}
          arma={arma}
          seleccionada={seleccionSlug === arma.slug}
          bloqueada={arma.tamano != null && arma.tamano > capacidadRestante}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
