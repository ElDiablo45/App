"use client"

import Link from "next/link"
import { ChevronLeft, Lock, Plus } from "lucide-react"

const ROWS = [
  "Dotación 1",
  "Dotación 2",
  "La Original",
  "Dotación 4",
  "Lebel",
  "Dotación 6",
  "Dotación 7",
]

export function DotacionesGuardadas() {
  return (
    <div className="dz-root">
      <Link className="dz-back" href="/">
        <ChevronLeft size={16} aria-hidden />
        Atrás
      </Link>
      <h1 className="dz-title">Dotaciones guardadas</h1>

      <div className="dz-layout">
        <div className="dz-list" aria-label="Dotaciones">
          {ROWS.map((name, i) => (
            <div
              key={name}
              className={
                i === 0
                  ? "dz-row dz-row--selected"
                  : i === ROWS.length - 1
                    ? "dz-row dz-row--highlighted"
                    : "dz-row"
              }
              aria-current={i === 0 ? "true" : undefined}
            >
              <span className="dz-weapon" aria-hidden="true" />
              <span className="dz-name">{name}</span>
              <span className="dz-cost">0</span>
            </div>
          ))}
          <div className="dz-unlock">
            <Lock size={14} aria-hidden />
            <span>Desbloquear ranura</span>
            <span className="dz-unlock-cost">100</span>
          </div>
          <div className="dz-empty" aria-hidden="true" />
          <div className="dz-empty" aria-hidden="true" />
        </div>

        <div className="dz-diamond" aria-hidden="true" />

        <div className="dz-detail">
          <section className="dz-panel" aria-label="Capacidad de armas">
            <h2 className="dz-panel-title">Capacidad de armas</h2>
            <span className="dz-count">0/5</span>
            <div className="dz-slots">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="dz-slot" aria-hidden="true" />
              ))}
            </div>
          </section>

          <section className="dz-panel" aria-label="Ranura principal">
            <h2 className="dz-panel-title">Ranura principal 0</h2>
            <div className="dz-big-slot" aria-hidden="true">
              <Plus size={16} aria-hidden />
            </div>
          </section>

          <section className="dz-panel" aria-label="Ranura secundaria">
            <h2 className="dz-panel-title">Ranura secundaria 0</h2>
            <div className="dz-big-slot" aria-hidden="true">
              <Plus size={16} aria-hidden />
            </div>
          </section>

          <section className="dz-panel" aria-label="Herramientas y consumibles">
            <h2 className="dz-panel-title">Herramientas y consumibles 0</h2>
            <div className="dz-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="dz-cell" aria-hidden="true">
                  <Plus size={14} aria-hidden />
                </span>
              ))}
            </div>
          </section>

          <section className="dz-panel" aria-label="Atributos">
            <h2 className="dz-panel-title">Atributos</h2>
            <span className="dz-count">0/15</span>
            <p className="dz-cost-line">Coste 0</p>
          </section>
        </div>
      </div>
    </div>
  )
}
