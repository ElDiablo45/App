"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
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
import { ArmaGrid } from "./arma-grid"
import type { ArmaCardData } from "./arma-card"

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

function RanuraArma({
  kind,
  titulo,
  arma,
  activa,
  corta,
  onActivar,
  onMenu,
}: {
  kind: SlotKind
  titulo: string
  arma: ArmaCardData | null
  activa: boolean
  corta?: boolean
  onActivar: (kind: SlotKind) => void
  onMenu: (e: ReactMouseEvent, kind: SlotKind) => void
}) {
  const cardClass = `dz-weapon-card${corta ? " dz-weapon-card--short" : ""}${activa ? " dz-weapon-card--active" : ""}`
  return (
    <section aria-label={titulo}>
      <h2 className="dz-sec-title">
        {titulo}
        {arma ? <span className="dz-inline-cost"> ◉ {arma.precio}</span> : null}
      </h2>
      <div className="dz-weapon-row">
        <button
          type="button"
          id={`ranura-${kind}`}
          className={cardClass}
          aria-pressed={activa}
          aria-label={arma ? `${titulo}: ${arma.nombre}, ◉ ${arma.precio}, tamaño ${arma.tamano} de 5` : titulo}
          onClick={() => onActivar(kind)}
          onContextMenu={(e) => onMenu(e, kind)}
        >
          {arma ? (
            <>
              <span className="dz-wtip" role="tooltip">
                {arma.nombre} · ◉ {arma.precio}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={arma.imagenUrl} alt={arma.nombre} className="dz-slot-img" />
              <span className="dz-size-pips" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < (arma.tamano ?? 0) ? "dz-pip--on" : undefined} />
                ))}
              </span>
            </>
          ) : (
            <>
              <Plus size={20} aria-hidden className="dz-plus" />
              <span className="dz-size-pips" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} />
                ))}
              </span>
            </>
          )}
        </button>
      </div>
    </section>
  )
}

export function DotacionEditor({ title = "Dotación 7", initialSlot = "principal" }: DotacionEditorProps) {
  const [slot, setSlot] = useState<SlotKind>(initialSlot)
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [sizes, setSizes] = useState<number[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [armas, setArmas] = useState<ArmaCardData[]>([])
  const [cargando, setCargando] = useState(true)
  const [errorWiki, setErrorWiki] = useState(false)
  const [seleccion, setSeleccion] = useState<{ principal: ArmaCardData | null; secundaria: ArmaCardData | null }>({
    principal: null,
    secundaria: null,
  })
  const [menu, setMenu] = useState<{
    x: number
    y: number
    target: { kind: "principal" | "secundaria" } | { kind: "herramientas"; index: number }
  } | null>(null)
  const [equipo, setEquipo] = useState<ArmaCardData[]>([])
  const [cargandoEquipo, setCargandoEquipo] = useState(false)
  const [tools, setTools] = useState<Array<ArmaCardData | null>>(() => Array(8).fill(null))
  const [toolSlot, setToolSlot] = useState(0)
  const cargandoEquipoRef = useRef(false)

  useEffect(() => {
    let cancelado = false
    async function cargar() {
      try {
        const res = await fetch("/api/armas")
        if (!res.ok) throw new Error("wiki down")
        const json = (await res.json()) as ArmaCardData[]
        if (!cancelado) {
          setArmas(Array.isArray(json) ? json : [])
          setErrorWiki(false)
        }
      } catch {
        if (!cancelado) setErrorWiki(true)
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    cargar()
    return () => {
      cancelado = true
    }
  }, [])

  function toggleSize(size: number) {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  function toggleCategory(id: string) {
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const capacidad = (seleccion.principal?.tamano ?? 0) + (seleccion.secundaria?.tamano ?? 0)
  const coste =
    (seleccion.principal?.precio ?? 0) +
    (seleccion.secundaria?.precio ?? 0) +
    tools.reduce((acc, t) => acc + (t?.precio ?? 0), 0)
  const otra = slot === "principal" ? seleccion.secundaria : seleccion.principal
  const capacidadRestante = 5 - (otra?.tamano ?? 0)
  const temasActivos = categories.filter((c) => ["explosivos", "curacion", "fuego", "veneno"].includes(c))

  function seleccionar(item: ArmaCardData) {
    if (slot === "herramientas") {
      setTools((prev) => {
        const next = [...prev]
        next[toolSlot] = item
        return next
      })
      return
    }
    if (item.tamano != null && item.tamano > capacidadRestante) return
    setSeleccion((prev) => ({ ...prev, [slot]: item }))
  }

  function abrirMenu(e: ReactMouseEvent, kind: SlotKind) {
    if (kind === "herramientas") return
    if (!seleccion[kind]) return
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, target: { kind } })
  }

  function abrirMenuTool(e: ReactMouseEvent, index: number) {
    if (!tools[index]) return
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, target: { kind: "herramientas", index } })
  }

  function quitarArma() {
    if (!menu) return
    const target = menu.target
    if (target.kind === "herramientas") {
      setTools((prev) => {
        const next = [...prev]
        next[target.index] = null
        return next
      })
    } else {
      setSeleccion((prev) => ({ ...prev, [target.kind]: null }))
    }
    setMenu(null)
  }

  useEffect(() => {
    if (slot !== "herramientas" || equipo.length > 0 || cargandoEquipoRef.current) return
    cargandoEquipoRef.current = true
    let cancelado = false
    setCargandoEquipo(true)
    async function cargarEquipo() {
      try {
        const [h, c] = await Promise.all([
          fetch("/api/catalogo?tipo=herramientas").then((r) => {
            if (!r.ok) throw new Error("wiki down")
            return r.json() as Promise<ArmaCardData[]>
          }),
          fetch("/api/catalogo?tipo=consumibles").then((r) => {
            if (!r.ok) throw new Error("wiki down")
            return r.json() as Promise<ArmaCardData[]>
          }),
        ])
        if (!cancelado) {
          setEquipo([...(Array.isArray(h) ? h : []), ...(Array.isArray(c) ? c : [])])
          setErrorWiki(false)
        }
      } catch {
        if (!cancelado) setErrorWiki(true)
      } finally {
        if (!cancelado) setCargandoEquipo(false)
      }
    }
    cargarEquipo()
    return () => {
      cancelado = true
      cargandoEquipoRef.current = false
    }
  }, [slot, equipo.length])

  useEffect(() => {
    if (!menu) return
    const target = menu.target
    const ancla = target.kind === "herramientas" ? `tool-${target.index}` : `ranura-${target.kind}`
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu(null)
        document.getElementById(ancla)?.focus()
      }
    }
    function onPointer(e: PointerEvent) {
      if (!(e.target as HTMLElement).closest(".dz-slot-menu")) setMenu(null)
    }
    function onScroll() {
      setMenu(null)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onScroll)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onScroll)
    }
  }, [menu])

  function reintentar() {
    setCargando(true)
    setErrorWiki(false)
    fetch("/api/armas")
      .then((res) => {
        if (!res.ok) throw new Error("wiki down")
        return res.json() as Promise<ArmaCardData[]>
      })
      .then((json) => setArmas(Array.isArray(json) ? json : []))
      .catch(() => setErrorWiki(true))
      .finally(() => setCargando(false))
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
            <h2 className="dz-sec-title">Capacidad de armas ({capacidad}/5)</h2>
            <div className={capacidad > 5 ? "dz-pips dz-pips--over" : "dz-pips"} aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.min(capacidad, 5) ? "dz-pip--on" : undefined} />
              ))}
            </div>
          </section>

          <RanuraArma
            kind="principal"
            titulo="Ranura principal"
            arma={seleccion.principal}
            activa={slot === "principal"}
            onActivar={setSlot}
            onMenu={abrirMenu}
          />

          <RanuraArma
            kind="secundaria"
            titulo="Ranura secundaria"
            arma={seleccion.secundaria}
            activa={slot === "secundaria"}
            corta
            onActivar={setSlot}
            onMenu={abrirMenu}
          />
          {menu ? (
            <div
              role="menu"
              aria-label={
                menu.target.kind === "herramientas"
                  ? `Acciones de herramienta ${menu.target.index + 1}`
                  : `Acciones de ranura ${menu.target.kind}`
              }
              className="dz-slot-menu"
              style={{ top: menu.y, left: menu.x }}
            >
              <button type="button" role="menuitem" autoFocus onClick={quitarArma}>
                Quitar
              </button>
            </div>
          ) : null}

          <section aria-label="Herramientas y consumibles">
            <h2 className="dz-sec-title">Herramientas y consumibles</h2>
            <div className="dz-tools" role="group" aria-label="Slots de herramientas">
              {tools.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  id={`tool-${i}`}
                  className={
                    slot === "herramientas" && toolSlot === i
                      ? "dz-tool dz-tool--active"
                      : t
                        ? "dz-tool dz-tool--filled"
                        : "dz-tool"
                  }
                  aria-pressed={slot === "herramientas" && toolSlot === i}
                  aria-label={t ? `Herramienta ${i + 1}: ${t.nombre}, ◉ ${t.precio}` : `Herramienta ${i + 1}`}
                  onClick={() => {
                    setSlot("herramientas")
                    setToolSlot(i)
                  }}
                  onContextMenu={(e) => abrirMenuTool(e, i)}
                >
                  {t ? (
                    <>
                      <span className="dz-wtip" role="tooltip">
                        {t.nombre} · ◉ {t.precio}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.imagenUrl} alt="" className="dz-tool-img" />
                    </>
                  ) : (
                    <Plus size={13} aria-hidden className="dz-plus" />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Atributos">
            <div className="dz-attr-head">
              <h2 className="dz-sec-title">Atributos (0/15)</h2>
              <span className="dz-sec-title">Coste ◉ {coste}</span>
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
          {slot === "herramientas" ? (
            errorWiki && equipo.length === 0 ? (
              <div className="dz-arma-error" role="alert">
                <span>No se pudo contactar con la wiki. Revisa tu conexión.</span>
                <button type="button" className="dz-filter" onClick={reintentar}>
                  Reintentar
                </button>
              </div>
            ) : (
              <ArmaGrid
                armas={equipo}
                query={query}
                tamanos={[]}
                temas={temasActivos}
                capacidadRestante={99}
                seleccionSlug={tools[toolSlot]?.slug ?? null}
                onSelect={seleccionar}
              />
            )
          ) : errorWiki ? (
            <div className="dz-arma-error" role="alert">
              <span>No se pudo contactar con la wiki. Revisa tu conexión.</span>
              <button type="button" className="dz-filter" onClick={reintentar}>
                Reintentar
              </button>
            </div>
          ) : (
            <ArmaGrid
              armas={armas}
              query={query}
              tamanos={sizes}
              capacidadRestante={capacidadRestante}
              seleccionSlug={(slot === "principal" ? seleccion.principal : seleccion.secundaria)?.slug ?? null}
              onSelect={seleccionar}
            />
          )}
          {cargando ? <p className="dz-arma-status">Cargando armas de la wiki…</p> : null}
          {cargandoEquipo ? <p className="dz-arma-status">Cargando herramientas de la wiki…</p> : null}
          <p className="dz-editor-hint">
            Mostrando: {SLOTS.find((s) => s.id === slot)?.short} · Datos e imágenes: huntshowdown.wiki.gg (CC BY-SA)
          </p>
        </div>
      </div>
    </div>
  )
}
