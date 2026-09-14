import { getHuntSteamNews } from "@/features/steam/steam-news"
import { getStreamerMembers } from "@/features/home/discord-members"
import { HomeSteamActividad } from "./home-steam-actividad"
import { HomeStreamers } from "./home-streamers"

function SectionSkeleton({ title }: { title: string }) {
  return (
    <div className="hunt-home-section" aria-busy="true" aria-label={`Cargando ${title}`}>
      <h2 className="hunt-home-heading">{title}</h2>
      <div className="hunt-skeleton-card">
        <div className="hunt-skeleton hunt-skeleton--thumb" />
        <div className="hunt-skeleton-lines">
          <div className="hunt-skeleton hunt-skeleton--line" />
          <div className="hunt-skeleton hunt-skeleton--line" />
          <div className="hunt-skeleton hunt-skeleton--line hunt-skeleton--short" />
        </div>
      </div>
    </div>
  )
}

export function SteamSkeleton() {
  return <SectionSkeleton title="Actividad" />
}

export function StreamersSkeleton() {
  return <SectionSkeleton title="Streamers de la comunidad" />
}

/**
 * Secciones async independientes: cada una trae sus datos y se
 * retransmite vía Suspense sin bloquear el primer pintado del Home.
 */
export async function HomeSteamSection() {
  const news = await getHuntSteamNews(4)
  return <HomeSteamActividad news={news} />
}

export async function HomeStreamersSection() {
  const streamers = await getStreamerMembers()
  return <HomeStreamers members={streamers} />
}
