import type { DiscordProfile } from "@/features/discord/discord-profile"
import { HomeWelcome } from "./home-welcome"
import { HomeLoTuyo } from "./home-lo-tuyo"
import { HomeNewsFeed } from "./home-news-feed"
import { HomeCanales } from "./home-canales"
import { HomeNuevasIncorporaciones } from "./home-nuevas-incorporaciones"
import type { NewMember } from "./types"

interface HomePageProps {
  profile: DiscordProfile
  recentMembers?: NewMember[]
}

export function HomePage({ profile, recentMembers }: HomePageProps) {
  return (
    <div className="hunt-home">
      <HomeWelcome profile={profile} />
      <HomeLoTuyo />
      <HomeNewsFeed />
      <HomeCanales />
      <HomeNuevasIncorporaciones members={recentMembers} />
    </div>
  )
}
