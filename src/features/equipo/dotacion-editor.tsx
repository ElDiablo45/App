"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Ban,
  Bomb,
  Crosshair,
  Flame,
  Lock,
  Plus,
  Search,
  Skull,
  Star,
  Syringe,
} from "lucide-react"

export type SlotKind = "principal" | "secundaria" | "herramientas"

const SLOTS: Array<{ id: SlotKind; label: string; short: string }> = [
  { id: "principal", label: "Ranura principal", short: "Principal" },
  { id: "secundaria", label: "Ranura secundaria", short: "Secundaria" },
  { id: "herramientas", label: "Herramientas y consumibles", short: "Herramientas" },
]

const SIZES = [1, 2, 3, 4, 5]

const CATEGORY_FILTERS = [
  { id: "bloqueadas", label: "Solo bloqueadas", Icon: Lock },
  { id: "favoritas", label: "Solo favoritas", Icon: Star },
  { id: "ocultas", label: "Ocultar no disponibles", Icon: Ban },
  { id: "explosivos", label: "Explosivos", Icon: Bomb },
  { id: "curacion", label: "Curación", Icon: Syringe },
  { id: "fuego", label: "Fuego", Icon: Flame },
  { id: "veneno", label: "Veneno", Icon: Skull },
  { id: "precision", label: "Precisión", Icon: Crosshair },
] as const

interface DotacionEditorProps {
  title?: string
  initialSlot?: SlotKind
}

export function DotacionEditor({ title = "Dotación 7", initialSlot = "principal" }: DotacionEditorProps) {
  const [slot, setSlot] = useState<SlotKind>(initialSlot)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [sizes, setSizes] = useState<number[]>([])
  const [categories, setCategories] = useState<string[]>([])

  function toggleSize(size: number) {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  function toggleCategory(id: string) {
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  return (
    <div className="dz-root">
      <div className="dz-top">
        <Link className="dz-esc" href="/equipo">
          <span className="dz-esc-arrow" aria-hidden="true">‹</span>
          <span className="dz-esc-box">ESC</span>
        </Link>
        <div className="dz-head">
          <h1 className="dz-title">{title}</h1>
        </div>
      </div>

      <div className="dz-layout">
        <div className="dz-detail" aria-label="Dotación">
          <section aria-label="Capacidad de armas">
            <h2 className="dz-sec-title">Capacidad de armas (0/5)</h2>
            <div className="dz-pips" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
          </section>

          <section aria-label="Ranura principal">
            <h2 className="dz-sec-title">Ranura principal</h2>
            <div className="dz-weapon-row">
              <button
                type="button"
                className={slot === "principal" ? "dz-weapon-card dz-weapon-card--active" : "dz-weapon-card"}
                aria-pressed={slot === "principal"}
                aria-label="Ranura principal"
                onClick={() => setSlot("principal")}
              >
                <Plus size={18} aria-hidden className="dz-plus" />
              </button>
            </div>
          </section>

          <section aria-label="Ranura secundaria">
            <h2 className="dz-sec-title">Ranura secundaria</h2>
            <div className="dz-weapon-row">
              <button
                type="button"
                className={slot === "secundaria" ? "dz-weapon-card dz-weapon-card--short dz-weapon-card--active" : "dz-weapon-card dz-weapon-card--short"}
                aria-pressed={slot === "secundaria"}
                aria-label="Ranura secundaria"
                onClick={() => setSlot("secundaria")}
              >
                <Plus size={18} aria-hidden className="dz-plus" />
              </button>
            </div>
          </section>

          <section aria-label="Herramientas y consumibles">
            <h2 className="dz-sec-title">Herramientas y consumibles</h2>
            <button
              type="button"
              className={slot === "herramientas" ? "dz-tools dz-tools--active" : "dz-tools"}
              aria-pressed={slot === "herramientas"}
              aria-label="Herramientas y consumibles"
              onClick={() => setSlot("herramientas")}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="dz-tool" aria-hidden="true">
                  <Plus size={13} className="dz-plus" />
                </span>
              ))}
            </button>
          </section>

          <section aria-label="Atributos">
            <div className="dz-attr-head">
              <h2 className="dz-sec-title">Atributos (0/15)</h2>
              <span className="dz-sec-title">Coste ⬡ 0</span>
            </div>
            <div className="dz-attrs">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="dz-attr" aria-hidden="true">
                  {i === 0 ? <Plus size={13} aria-hidden className="dz-plus" /> : null}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="dz-editor-main">
          <p className="dz-order">Orden: Nombre</p>
          <div className="dz-filters" aria-label="Filtros">
            <button
              type="button"
              className={searchOpen ? "dz-filter dz-filter--active" : "dz-filter"}
              aria-expanded={searchOpen}
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={15} aria-hidden="true" />
            </button>
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                className={sizes.includes(size) ? "dz-filter dz-filter--active" : "dz-filter"}
                aria-pressed={sizes.includes(size)}
                aria-label={`Tamaño ${size}`}
                onClick={() => toggleSize(size)}
              >
                <span className="dz-filter-pips" aria-hidden="true">
                  {Array.from({ length: size }).map((_, i) => (
                    <span key={i} />
                  ))}
                </span>
              </button>
            ))}
            {CATEGORY_FILTERS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={categories.includes(id) ? "dz-filter dz-filter--active" : "dz-filter"}
                aria-pressed={categories.includes(id)}
                aria-label={label}
                onClick={() => toggleCategory(id)}
              >
                <Icon size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
          {searchOpen ? (
            <div className="dz-editor-searchrow">
              <Search size={16} aria-hidden="true" className="dz-editor-searchicon" />
              <input
                className="dz-search"
                type="search"
                placeholder="Buscar..."
                aria-label="Buscar por nombre"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          ) : null}
          <p className="dz-empty-msg">Lista vacía debido a los filtros activos actuales</p>
          <p className="dz-editor-hint">
            Mostrando: {SLOTS.find((s) => s.id === slot)?.short}
          </p>
        </div>
      </div>
    </div>
  )
}
