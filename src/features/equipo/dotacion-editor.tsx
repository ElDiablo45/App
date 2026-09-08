"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"

const FILTERS = ["Armas", "Herramientas", "Consumibles", "Atributos"]

export function DotacionEditor({ title = "Dotación 7" }: { title?: string }) {
  return (
    <div className="dz-root">
      <Link className="dz-back" href="/equipo">
        <ChevronLeft size={16} aria-hidden />
        Atrás
      </Link>
      <h1 className="dz-title">{title}</h1>

      <div className="dz-layout">
        <div className="dz-list" aria-label="Dotación">
          <div className="dz-empty" aria-hidden="true" />
          <div className="dz-empty" aria-hidden="true" />
          <div className="dz-empty" aria-hidden="true" />
        </div>

        <div className="dz-editor-main">
          <p className="dz-order">Orden: Nombre</p>
          <div className="dz-filters" aria-label="Filtros">
            {FILTERS.map((f) => (
              <button key={f} type="button" className="dz-filter" disabled>
                {f}
              </button>
            ))}
          </div>
          <input
            className="dz-search"
            type="search"
            placeholder="Buscar..."
            aria-label="Buscar"
            disabled
            readOnly
            value=""
          />
          <p className="dz-empty-msg">Lista vacía debido a los filtros activos actuales</p>
        </div>
      </div>
    </div>
  )
}
