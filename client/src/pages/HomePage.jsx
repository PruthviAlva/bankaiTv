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
  const {
    data: topAnime,
    isLoading: loadingTopAnime,
    error: topAnimeError,
  } = useTopAnime(10);
  const {
    data: trendingAnime,
    isLoading: loadingTrendingAnime,
    error: trendingAnimeError,
  } = useTrendingAnime();
  const {
    data: latestEpisodes,
    isLoading: loadingLatestEpisodes,
    error: latestEpisodesError,
  } = useLatestEpisodes();
  const {
    data: topUpcomingAnime,
    isLoading: loadingTopUpcomingAnime,
    error: topUpcomingAnimeError,
  } = useTopUpcomingAnime();

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Hero Banner — rotates through currently airing anime */}
      <HeroBanner animeList={topAnime?.data || []} error={topAnimeError} />

      {/* Top 10 Anime Row */}
      <AnimeRow
        title="Top 10 Today"
        viewAllLink="/anime"
        animeList={topAnime?.data || []}
        isLoading={loadingTopAnime}
        error={topAnimeError}
        showRank={true}
      />

      {/* Trending Now */}
      <AnimeRow
        title="Trending Now"
        viewAllLink="/anime"
        icon={Flame}
        animeList={trendingAnime?.data || []}
        isLoading={loadingTrendingAnime}
        error={trendingAnimeError}
      />

      {/* Latest Episodes */}
      <AnimeRow
        title="Latest Episodes"
        viewAllLink="/anime"
        icon={Clock}
        animeList={latestEpisodes?.data || []}
        isLoading={loadingLatestEpisodes}
        error={latestEpisodesError}
      />

      {/* Top Upcoming */}
      <AnimeRow
        title="Top Upcoming"
        viewAllLink="/anime"
        icon={Calendar}
        animeList={topUpcomingAnime?.data || []}
        isLoading={loadingTopUpcomingAnime}
        error={topUpcomingAnimeError}
      />
    </div>
  );
}
