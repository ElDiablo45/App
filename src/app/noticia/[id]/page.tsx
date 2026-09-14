import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { DashboardShell } from "@/features/layout/dashboard-shell"
import { getHuntSteamNewsById, getHuntSteamNews, stripSteamBbcode, extractSteamYoutubeIds } from "@/features/steam/steam-news"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/options"
import { getDiscordProfile } from "@/features/profile/profile-session"
import { redirect } from "next/navigation"

interface NoticiaPageProps {
  params: Promise<{ id: string }>
}

function renderContents(contents: string) {
  const clean = stripSteamBbcode(contents)
  // links sueltos restantes (no imagenes, esas ya van arriba)
  const parts = clean.split(/(\s+)/)
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const url = part.replace(/[),.;!?]+$/, "")
      return (
        <a key={i} href={url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", wordBreak: "break-all" }}>
          {url}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export const dynamicParams = true
export const revalidate = 600

export async function generateStaticParams() {
  // pre-generar las ultimas para cache (ventana amplia, no solo 4)
  const news = await getHuntSteamNews(20)
  return news.map((n) => ({ id: n.id }))
}

export default async function NoticiaPage({ params }: NoticiaPageProps) {
  const session = await getServerSession(authOptions)
  const profile = getDiscordProfile(session)
  if (!profile) redirect("/")

  const { id } = await params
  const item = await getHuntSteamNewsById(id)
  if (!item) notFound()

  const dateLabel = new Date(item.date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  // extrae todas las imagenes del contenido para galeria
  const images = Array.from(item.contents.matchAll(/https?:\/\/[^\s"'<>\]]+\.(jpg|jpeg|png|gif|webp)(\?[^\s"'<>\]]*)?/gi)).map((m) => m[0])
  const uniqueImages = Array.from(new Set([item.imageUrl, ...images].filter(Boolean))) as string[]
  const youtubeIds = extractSteamYoutubeIds(item.contents)

  return (
    <DashboardShell active="home" breadcrumb="Noticia" profile={profile}>
      <div className="hunt-home" style={{ maxWidth: 760 }}>
        <Link href="/" className="hunt-steam-link" style={{ display: "inline-flex", marginBottom: 12 }}>
          ← Volver a Home
        </Link>

        <article className="hunt-steam-detail">
          <p className="hunt-steam-kicker">{item.feedLabel} · {dateLabel} · {item.author}</p>
          <h1 className="hunt-steam-detail-title">{item.title}</h1>

          {uniqueImages[0] ? (
            <div style={{ margin: "14px 0", borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e1e", background: "#111" }}>
              <Image src={uniqueImages[0]} alt={item.title} width={760} height={428} style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} unoptimized priority />
            </div>
          ) : null}

          <div className="hunt-steam-detail-body">
            {youtubeIds.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                {youtubeIds.map((vid) => (
                  <div key={vid} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1e1e1e", background: "#000" }}>
                    <iframe
                      width="100%"
                      height="360"
                      src={`https://www.youtube.com/embed/${vid}`}
                      title="Video de la noticia"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ display: "block", border: 0 }}
                    />
                  </div>
                ))}
              </div>
            ) : null}
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#d0d3de", fontSize: 13 }}>
              {renderContents(item.contents)}
            </p>
          </div>

          {uniqueImages.length > 1 ? (
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {uniqueImages.slice(1, 3).map((src, idx) => (
                <div key={idx} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #1e1e1e" }}>
                  <Image src={src!} alt="" width={380} height={214} style={{ width: "100%", height: "auto", display: "block" }} unoptimized />
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <a href={item.url} target="_blank" rel="noreferrer" className="hunt-lo-btn" style={{ textDecoration: "none", background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              Ver fuente original en Steam
            </a>
            <Link href="/" className="hunt-lo-btn" style={{ textDecoration: "none" }}>
              Volver
            </Link>
          </div>
        </article>
      </div>
    </DashboardShell>
  )
}
