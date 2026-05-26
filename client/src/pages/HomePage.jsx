import { Flame, Clock, Calendar } from "lucide-react";

import {
  useTopAnime,
  useTrendingAnime,
  useLatestEpisodes,
  useTopUpcomingAnime,
} from "../hooks/useAnime";

import HeroBanner from "../components/anime/HeroBanner";
import AnimeRow from "../components/anime/AnimeRow";

export default function HomePage() {
  const { data: topAnime, isLoading: loadingTopAnime } = useTopAnime(10);
  const { data: trendingAnime, isLoading: loadingTrendingAnime } =
    useTrendingAnime();
  const { data: latestEpisodes, isLoading: loadingLatestEpisodes } =
    useLatestEpisodes();
  const { data: topUpcomingAnime, isLoading: loadingTopUpcomingAnime } =
    useTopUpcomingAnime();

  return (
    <div className="mx-auto px-4 py-6">
      {/* Hero Banner — rotates through currently airing anime */}
      <HeroBanner animeList={topAnime?.data || []} />

      {/* Top 10 Anime Row */}
      <AnimeRow
        title="Top 10 Today"
        viewAllLink="/anime"
        animeList={topAnime?.data || []}
        isLoading={loadingTopAnime}
        showRank={true}
      />

      {/* Trending Now */}
      <AnimeRow
        title="Trending Now"
        viewAllLink="/anime"
        icon={Flame}
        animeList={trendingAnime?.data || []}
        isLoading={loadingTrendingAnime}
      />

      {/* Latest Episodes */}
      <AnimeRow
        title="Latest Episodes"
        viewAllLink="/anime"
        icon={Clock}
        animeList={latestEpisodes?.data || []}
        isLoading={loadingLatestEpisodes}
      />

      {/* Top Upcoming */}
      <AnimeRow
        title="Top Upcoming"
        viewAllLink="/anime"
        icon={Calendar}
        animeList={topUpcomingAnime?.data || []}
        isLoading={loadingTopUpcomingAnime}
      />
    </div>
  );
}
