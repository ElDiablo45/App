"use client"

import { useMemo, useState } from "react"
import { TOPICS } from "./data"
import { filterLoadouts, sortLoadouts } from "./equipo-filter"
import { LoadoutCard } from "./loadout-card"
import type { Loadout, LoadoutSort } from "./types"

const SORT_TABS: { value: LoadoutSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "top", label: "Top Rated" },
  { value: "views", label: "Más vistos" },
  { value: "latest", label: "Recientes" },
]

export function EquipoBrowser({ items }: { items: Loadout[] }) {
  const [query, setQuery] = useState("")
  const [topic, setTopic] = useState("")
  const [sort, setSort] = useState<LoadoutSort>("popular")

  const visible = useMemo(
    () => sortLoadouts(filterLoadouts(items, query, topic), sort),
    [items, query, topic, sort],
  )

  return (
    <div className="eq-browser">
      <div className="eq-toolbar">
        <input
          className="eq-search"
          type="search"
          placeholder="Buscar equipos, temas, creadores..."
          aria-label="Buscar equipos"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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

      <div className="eq-layout">
        <aside className="eq-topics" aria-label="Temas">
          <h2 className="eq-topics-title">Temas</h2>
          <div className="eq-topics-cloud">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className="eq-topic"
                aria-pressed={topic === t}
                onClick={() => setTopic((cur) => (cur === t ? "" : t))}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>

        <div className="eq-grid">
          {visible.map((item) => (
            <LoadoutCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="eq-empty">Sin resultados para esta búsqueda.</p>
      ) : null}
    </div>
  )
}
