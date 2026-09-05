"use client"

import Image from "next/image"

export function EquipoHeader({ registroComplete }: { registroComplete: boolean }) {
  return (
    <div className="eq-header">
      <div>
        <h1 className="eq-title">EQUIPO</h1>
        <p className="eq-sub">
          Descubre los equipos creados por la comunidad para dominar Hunt Hispano.
        </p>
      </div>
      <div className="eq-header-art" aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop"
          alt=""
          width={200}
          height={200}
          className="eq-header-img"
          unoptimized
        />
      </div>
      {registroComplete ? (
        <a href="#" className="eq-create" onClick={(e) => e.preventDefault()}>
          Crear equipo
        </a>
      ) : (
        <div>
          <button
            className="eq-create"
            type="button"
            disabled
            title="Completa tu registro para crear equipos"
          >
            Crear equipo
          </button>
          <p className="eq-hint">Próximamente: completa tu registro para crear equipos.</p>
        </div>
      )}
    </div>
  )
}
