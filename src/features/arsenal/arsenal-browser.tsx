"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { TOPICS } from "../equipo/data"
import { ArsenalCard } from "./arsenal-card"
import { filterArsenalItems, sortArsenalItems } from "./arsenal-filter"
import type { ArmaOption, ArsenalItem, ArsenalSort } from "./types"

const SORT_TABS: { value: ArsenalSort; label: string }[] = [
  { value: "popular", label: "Popular" },
  { value: "top", label: "Mejor valorada" },
  { value: "views", label: "Más vistas" },
  { value: "latest", label: "Recientes" },
]

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
  const [topic, setTopic] = useState("")
  const [sort, setSort] = useState<ArsenalSort>("popular")
  const [overrides, setOverrides] = useState(
    new Map<string, { liked: boolean; likeCount: number }>(),
  )

  const visible = useMemo(
    () => sortArsenalItems(filterArsenalItems(items, query, arma, topic), sort),
    [items, query, arma, topic, sort],
  )

  async function handleLike(id: string) {
    if (!onToggleLike) return
    const result = await onToggleLike(id)
    if (!("liked" in result)) return
    setOverrides((prev) => new Map(prev).set(id, result))
  }

  return (
    <div className="ar-root">
      <header className="ar-head">
        <div className="ar-head-text">
          <h1 className="ar-title">ARSENAL</h1>
          <p className="ar-sub">
            Descubre las dotaciones más efectivas creadas por otros cazadores.
            Encuentra la perfecta para dominar el pantano o comparte tus
            propias estrategias con la comunidad.
          </p>
        </div>
        <Link className="ar-create" href="/equipo/nueva">
          Crear dotación
        </Link>
      </header>

      <div className="ar-toolbar">
        <input
          className="ar-search"
          type="search"
          placeholder="Buscar dotaciones por nombre..."
          aria-label="Buscar dotaciones por nombre"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="ar-tabs" role="group" aria-label="Ordenar">
          {SORT_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              className="ar-tab"
              aria-pressed={sort === t.value}
              onClick={() => setSort(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ar-layout">
        <aside className="ar-side" aria-label="Filtros">
          <h2 className="ar-side-title">Estilo de juego</h2>
          <div className="ar-pills">
            {TOPICS.map((t) => (
              <button
                key={t}
                type="button"
                className="ar-pill"
                aria-pressed={topic === t}
                onClick={() => setTopic((cur) => (cur === t ? "" : t))}
              >
                {t}
              </button>
            ))}
          </div>

          <h2 className="ar-side-title">Armas</h2>
          {armas.length > 0 ? (
            <div className="ar-weapons-grid">
              {armas.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  className="ar-weapon-tile"
                  aria-pressed={arma === a.slug}
                  aria-label={`Filtrar por ${a.nombre}`}
                  title={a.nombre}
                  onClick={() => setArma((cur) => (cur === a.slug ? "" : a.slug))}
                >
                  {a.imagenUrl ? (
                    <Image
                      src={a.imagenUrl}
                      alt=""
                      width={220}
                      height={90}
                      className="ar-weapon-tile-img"
                      unoptimized
                    />
                  ) : null}
                  <span className="ar-weapon-tile-name">{a.nombre}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="ar-side-empty">Armas no disponibles.</p>
          )}
          {arma ? (
            <button
              type="button"
              className="ar-clear"
              onClick={() => {
                setArma("")
                setTopic("")
              }}
            >
              Limpiar filtros
            </button>
          ) : null}
        </aside>

        <div className="ar-grid">
          {visible.map((item) => {
            const override = overrides.get(item.id)
            return (
              <ArsenalCard
                key={item.id}
                item={item}
                armas={armas}
                liked={override?.liked ?? likedIds?.has(item.id) ?? false}
                likeCount={override?.likeCount ?? item.likeCount}
                onLike={handleLike}
              />
            )
          })}
          {visible.length === 0 ? (
            <p className="ar-empty">Sin resultados para esta búsqueda.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
