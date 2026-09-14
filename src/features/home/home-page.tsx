import { Suspense } from "react"
import type { DiscordProfile } from "@/features/discord/discord-profile"
import { HomeWelcome } from "./home-welcome"
import { HomeLoTuyo } from "./home-lo-tuyo"
import {
  HomeSteamSection,
  HomeStreamersSection,
  SteamSkeleton,
  StreamersSkeleton,
} from "./home-sections"

interface HomePageProps {
  profile: DiscordProfile
}

export function HomePage({ profile }: HomePageProps) {
  return (
    <div className="hunt-home">
      <HomeWelcome profile={profile} />
      <HomeLoTuyo />
      <Suspense fallback={<SteamSkeleton />}>
        <HomeSteamSection />
      </Suspense>
      <Suspense fallback={<StreamersSkeleton />}>
        <HomeStreamersSection />
      </Suspense>
    </div>
  )
}
