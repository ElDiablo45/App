import type { DiscordProfile } from "@/features/discord/discord-profile"
import { HomeWelcome } from "./home-welcome"
import { HomeLoTuyo } from "./home-lo-tuyo"
import { HomeCanales } from "./home-canales"
import { HomeNuevasIncorporaciones } from "./home-nuevas-incorporaciones"
import { HomeSteamActividad } from "./home-steam-actividad"
import type { NewMember } from "./types"
import type { SteamNewsItem } from "@/features/steam/steam-news"
import type { LiveChannelEnriched } from "@/features/twitch/twitch-live"

interface HomePageProps {
  profile: DiscordProfile
  recentMembers?: NewMember[]
  steamNews?: SteamNewsItem[]
  liveChannels?: LiveChannelEnriched[]
}

export function HomePage({ profile, recentMembers, steamNews, liveChannels }: HomePageProps) {
  return (
    <div className="hunt-home">
      <HomeWelcome profile={profile} />
      <HomeLoTuyo />
      {steamNews && <HomeSteamActividad news={steamNews} />}
      <HomeCanales channels={liveChannels} />
      <HomeNuevasIncorporaciones members={recentMembers} />
    </div>
  )
}
