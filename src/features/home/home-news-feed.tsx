import { Heart, Megaphone, Rocket, Sparkles, Calendar, HeartHandshake } from "lucide-react"
import type { NewsItem } from "./types"
import { MOCK_NEWS } from "./data"

function iconFor(label: string) {
  if (label.includes("📅")) return Calendar
  if (label.includes("📢")) return Megaphone
  if (label.includes("🚀")) return Rocket
  if (label.includes("❤")) return HeartHandshake
  return Sparkles
}

export function HomeNewsFeed({ items = MOCK_NEWS }: { items?: NewsItem[] }) {
  return (
    <div className="hunt-home-section">
      <div className="hunt-news-header">
        <span className="hunt-news-date">Hoy</span>
        <div className="hunt-news-line" />
      </div>
      <div className="hunt-news-list">
        {items.map((item) => {
          const Icon = iconFor(item.iconLabel)
          return (
            <div key={item.id} className="hunt-news-item">
              <div className="hunt-news-icon">
                <Icon size={14} />
              </div>
              <div className="hunt-news-content">
                <p className="hunt-news-title">
                  {item.unread ? <span className="hunt-news-dot" aria-hidden /> : null}
                  {item.title}
                </p>
                <p className="hunt-news-body">{item.body}</p>
              </div>
              <div className="hunt-news-likes">
                <span>{item.likes}</span>
                <Heart size={14} className={item.id === "1" ? "hunt-heart-filled" : ""} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
