export function EquipoHeader({ registroComplete }: { registroComplete: boolean }) {
  return (
    <div className="eq-header">
      <div>
        <h1 className="eq-title">EQUIPO</h1>
        <p className="eq-sub">
          Descubre los equipos creados por la comunidad para dominar Hunt Hispano.
        </p>
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
