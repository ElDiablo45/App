"use client"

import { BookOpen, Lightbulb, MessageCircle } from "lucide-react"

export function HomeLoTuyo() {
  return (
    <div className="hunt-home-section">
      <h2 className="hunt-home-heading">Lo tuyo</h2>
      <div className="hunt-lo-grid">
        {/* Tickets */}
        <div className="hunt-lo-card">
          <div className="hunt-lo-card-head">
            <span className="hunt-lo-title">
              <MessageCircle size={14} /> Tickets
            </span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hunt-lo-link">
              Ver todos
            </a>
          </div>
          <div className="hunt-lo-inner">
            <div className="hunt-lo-icon">
              <MessageCircle size={12} />
            </div>
            <p className="hunt-lo-empty-title">Ningún ticket abierto</p>
            <p className="hunt-lo-empty-desc">Si necesitas algo del staff —una duda, un problema, un reporte— ábrele un ticket y lo seguís aquí.</p>
            <button className="hunt-lo-btn" type="button">
              Abrir ticket
            </button>
          </div>
        </div>

        {/* Historias */}
        <div className="hunt-lo-card">
          <div className="hunt-lo-card-head">
            <span className="hunt-lo-title">
              <BookOpen size={14} /> Historias
            </span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hunt-lo-link">
              Ver todas
            </a>
          </div>
          <div className="hunt-lo-inner">
            <div className="hunt-lo-icon">
              <BookOpen size={12} />
            </div>
            <p className="hunt-lo-empty-title">Aún no tienes historias</p>
            <p className="hunt-lo-empty-desc">La historia de tu personaje es que lo staff revisa antes de darle vida en el servidor.</p>
            <button className="hunt-lo-btn" type="button">
              Escribir mi historia
            </button>
          </div>
        </div>

        {/* Sugerencias */}
        <div className="hunt-lo-card">
          <div className="hunt-lo-card-head">
            <span className="hunt-lo-title">
              <Lightbulb size={14} /> Sugerencias y bugs
            </span>
            <a href="#" onClick={(e) => e.preventDefault()} className="hunt-lo-link">
              Ver todo
            </a>
          </div>
          <div className="hunt-lo-inner">
            <div className="hunt-lo-icon">
              <Lightbulb size={12} />
            </div>
            <p className="hunt-lo-empty-title">No has enviado nada todavía</p>
            <p className="hunt-lo-empty-desc">Si algo te chirría o se te ocurre una mejora, cuéntanoslo desde el botón de feedback y aquí verás en qué queda.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
