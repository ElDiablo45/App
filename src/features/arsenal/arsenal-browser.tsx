"use client"

import { useMemo, useState } from "react"
import { filterArsenalItems, sortArsenalItems } from "./arsenal-filter"
import type { ArsenalItem, ArsenalSort } from "./types"

const SORT_TABS: { value: ArsenalSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "top", label: "Mejor valorada" },
  { value: "latest", label: "Recientes" },
]

export interface ArmaOption {
  slug: string
  nombre: string
}

export function ArsenalBrowser({
  items,
  armas,
}: {
  items: ArsenalItem[]
  armas: ArmaOption[]
}) {
  const [query, setQuery] = useState("")
  const [arma, setArma] = useState("")
  const [sort, setSort] = useState<ArsenalSort>("popular")

  const visible = useMemo(
    () => sortArsenalItems(filterArsenalItems(items, query, arma), sort),
    [items, query, arma, sort],
  )

  return (
    <div className="eq-browser">
      <div className="eq-toolbar">
        <input
          className="eq-search"
          type="search"
          placeholder="Buscar dotaciones por nombre..."
          aria-label="Buscar dotaciones por nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="eq-arma-filter">
          Arma
          <select
            aria-label="Filtrar por arma"
            value={arma}
            onChange={(e) => setArma(e.target.value)}
          >
            <option value="">Todas las armas</option>
            {armas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className="eq-tabs" role="group" aria-label="Ordenar">
          {SORT_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              className="eq-tab"
              aria-pressed={sort === t.value}
              onClick={() => setSort(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="eq-grid">
        {visible.map((item) => (
          <article key={item.id} className="eq-card">
            <h3 className="eq-card-title">{item.title}</h3>
            <p className="eq-card-meta">
              ♥ {item.likeCount} · 👁 {item.views}
            </p>
          </article>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="eq-empty">Sin resultados para esta búsqueda.</p>
      ) : null}
    </div>
  )
}
