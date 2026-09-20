"use client"

import { useState } from "react"
import Link from "next/link"
import { Book, Check, Lock, Plus } from "lucide-react"

const MAX_DOTACIONES = 4

type Dotacion = {
  name: string
  cost: number
  blood: number
  capacidad: string
  principalCost: number
  secundariaCost: number
  herramientasCost: number
  atributos: string
}

function emptyDotacion(name: string): Dotacion {
  return {
    name,
    cost: 0,
    blood: 0,
    capacidad: "0/5",
    principalCost: 0,
    secundariaCost: 0,
    herramientasCost: 0,
    atributos: "0/15",
  }
}

export function DotacionesGuardadas() {
  const [dotaciones, setDotaciones] = useState<Dotacion[]>([emptyDotacion("Dotación 1")])
  const [selected, setSelected] = useState(0)
  const current = dotaciones[Math.min(selected, dotaciones.length - 1)]
  const full = dotaciones.length >= MAX_DOTACIONES

  function crearDotacion() {
    if (full) return
    const next = emptyDotacion(`Dotación ${dotaciones.length + 1}`)
    setDotaciones((prev) => [...prev, next])
    setSelected(dotaciones.length)
  }

  return (
    <div className="dz-root">
      <div className="dz-top">
        <Link className="dz-esc" href="/">
          <span className="dz-esc-arrow" aria-hidden="true">‹</span>
          <span className="dz-esc-box">ESC</span>
        </Link>
        <div className="dz-head">
          <h1 className="dz-title">Dotaciones guardadas</h1>
        </div>
      </div>

      <div className="dz-layout">
        <div className="dz-list" role="listbox" aria-label="Dotaciones">
          {dotaciones.map((d, i) => (
            <button
              key={d.name}
              type="button"
              role="option"
              aria-selected={i === selected}
              onClick={() => setSelected(i)}
              className={i === selected ? "dz-row dz-row--selected" : "dz-row"}
            >
              <span className="dz-row-icon" aria-hidden="true">
                <Book size={18} />
              </span>
              <span className="dz-name">{d.name}</span>
              <span className="dz-costs">
                <span className="dz-cost">◉ {d.cost}</span>
                <span className="dz-blood">⬡ {d.blood}</span>
              </span>
            </button>
          ))}
          {!full &&
            Array.from({ length: MAX_DOTACIONES - dotaciones.length }).map((_, i) => (
              <button
                key={`nueva-${i}`}
                type="button"
                onClick={crearDotacion}
                className="dz-row dz-row--empty"
                aria-label="Crear dotación"
              >
                <span className="dz-row-icon" aria-hidden="true">
                  <Plus size={16} className="dz-plus" />
                </span>
                <span className="dz-name dz-name--muted">Crear dotación</span>
              </button>
            ))}
          {full ? (
            <div className="dz-unlock">
              <Lock size={14} aria-hidden />
              <span>Desbloquear ranura</span>
              <span className="dz-unlock-cost">◈ 100</span>
            </div>
          ) : null}
          <div className="dz-empty" aria-hidden="true" />
          <div className="dz-empty" aria-hidden="true" />
        </div>

        <div className="dz-detail">
          <section aria-label="Capacidad de armas">
            <h2 className="dz-sec-title">Capacidad de armas ({current.capacidad})</h2>
            <div className="dz-pips" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
          </section>

          <section aria-label="Ranura principal">
            <span className="dz-check" aria-hidden="true"><Check size={12} /></span>
            <h2 className="dz-sec-title">
              Ranura principal <span className="dz-inline-cost">◉ {current.principalCost}</span>
            </h2>
            <div className="dz-weapon-row">
              <Link href="/equipo/nueva?ranura=principal" className="dz-weapon-card" aria-label="Editar ranura principal">
                <Plus size={20} aria-hidden className="dz-plus" />
                <span className="dz-size-pips" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} />
                  ))}
                </span>
              </Link>
              {current.principalCost > 0 ? <span className="dz-ammo" aria-hidden="true" /> : null}
            </div>
          </section>

          <section aria-label="Ranura secundaria">
            <span className="dz-check" aria-hidden="true"><Check size={12} /></span>
            <h2 className="dz-sec-title">Ranura secundaria</h2>
            <div className="dz-weapon-row">
              <Link href="/equipo/nueva?ranura=secundaria" className="dz-weapon-card dz-weapon-card--short" aria-label="Editar ranura secundaria">
                <Plus size={20} aria-hidden className="dz-plus" />
                <span className="dz-size-pips" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} />
                  ))}
                </span>
              </Link>
              {current.secundariaCost > 0 ? <span className="dz-ammo" aria-hidden="true" /> : null}
            </div>
          </section>

          <section aria-label="Herramientas y consumibles">
            <span className="dz-check" aria-hidden="true"><Check size={12} /></span>
            <h2 className="dz-sec-title">Herramientas y consumibles</h2>
            <div className="dz-tools">
              {Array.from({ length: 8 }).map((_, i) => (
                <Link
                  key={i}
                  href="/equipo/nueva?ranura=herramientas"
                  className="dz-tool"
                  aria-label={`Herramienta ${i + 1}`}
                >
                  <Plus size={13} aria-hidden className="dz-plus" />
                </Link>
              ))}
            </div>
          </section>

          <section aria-label="Atributos">
            <span className="dz-check" aria-hidden="true"><Check size={12} /></span>
            <div className="dz-attr-head">
              <h2 className="dz-sec-title">Atributos ({current.atributos})</h2>
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
      </div>
    </div>
  )
}
