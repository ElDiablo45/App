"use client"

import { useMemo, useState } from "react"
import { ArsenalCard } from "./arsenal-card"
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
  likedIds,
  onToggleLike,
}: {
  items: ArsenalItem[]
  armas: ArmaOption[]
  likedIds?: Set<string>
  onToggleLike?: (
    id: string,
  ) => Promise<
    { liked: boolean; likeCount: number } | { ok: false; error: string }
  >
}) {
  const [query, setQuery] = useState("")
  const [arma, setArma] = useState("")
  const [sort, setSort] = useState<ArsenalSort>("popular")
  const [overrides, setOverrides] = useState(
    new Map<string, { liked: boolean; likeCount: number }>(),
  )

  const visible = useMemo(
    () => sortArsenalItems(filterArsenalItems(items, query, arma), sort),
    [items, query, arma, sort],
  )

  async function handleLike(id: string) {
    if (!onToggleLike) return
    const result = await onToggleLike(id)
    if (!("liked" in result)) return
    setOverrides((prev) => new Map(prev).set(id, result))
  }

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
        {visible.map((item) => {
          const override = overrides.get(item.id)
          return (
            <ArsenalCard
              key={item.id}
              item={item}
              liked={override?.liked ?? likedIds?.has(item.id) ?? false}
              likeCount={override?.likeCount ?? item.likeCount}
              onLike={handleLike}
            />
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="eq-empty">Sin resultados para esta búsqueda.</p>
      ) : null}
    </div>
  )
}
