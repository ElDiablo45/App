import { DashboardShell } from "@/features/layout/dashboard-shell"

/**
 * Esqueleto instantáneo de la ruta /: se pinta en cuanto empieza la
 * navegación, sin esperar a sesión, Supabase ni Steam. Cuando la página
 * real está lista, Next la sustituye. Las secciones pesadas (Steam,
 * streamers) ya van en Suspense y rellenan de fondo.
 */
export default function HomeLoading() {
  return (
    <DashboardShell active="home" breadcrumb="Home" profile={null} isGuest>
      <div className="hunt-home" aria-busy="true" aria-label="Cargando home">
        <div className="hunt-skeleton-card">
          <div className="hunt-skeleton hunt-skeleton--thumb" />
          <div className="hunt-skeleton-lines">
            <div className="hunt-skeleton hunt-skeleton--line" />
            <div className="hunt-skeleton hunt-skeleton--line" />
            <div className="hunt-skeleton hunt-skeleton--line hunt-skeleton--short" />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
