import { useSearchParams } from "react-router-dom";

import FilterTabs from "../../components/common/FilterTabs";
import Anime_MangaGrid from "../../components/grid/Anime_MangaGrid";
import Pagination from "../../components/common/Pagination";

import { useAnimeList } from "../../hooks/useAnime";

// Tab definitions — each maps to AniList sorting and media filters.
const TABS = [
  { label: "Trending", value: "trending" },
  { label: "Top Rated", value: "top" },
  { label: "Movies", value: "movie" },
  { label: "TV Shows", value: "tv" },
  { label: "OVAs", value: "ova" },
  { label: "Upcoming", value: "upcoming" },
];

// Map tab value to AniList filter variables.
const getFilters = (tab) => {
  switch (tab) {
    case "trending":
      return { sort: "TRENDING_DESC" };
    case "top":
      return { sort: "SCORE_DESC" };
    case "movie":
      return { format: "MOVIE", sort: "SCORE_DESC" };
    case "tv":
      return { format: "TV", sort: "SCORE_DESC" };
    case "ova":
      return { format: "OVA", sort: "SCORE_DESC" };
    case "upcoming":
      return { status: "NOT_YET_RELEASED", sort: "POPULARITY_DESC" };
    default:
      return { sort: "TRENDING_DESC" };
  }
};

export default function AnimePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const activeTab = searchParams.get("tab") || "trending";

  const filters = getFilters(activeTab);
  const { data, isLoading, isError, error } = useAnimeList(currentPage, filters);

  const items = data?.data || [];
  const totalPages = Math.min(data?.pagination?.last_visible_page || 1, 20);

  const handleTabChange = (tab) => {
    // Reset to page 1 when switching tabs
    setSearchParams({ tab, page: "1" });
  };

  const handlePageChange = (page) => {
    setSearchParams({ tab: activeTab, page: String(page) });
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-auto mx-auto px-4 py-6 text-white">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Anime</h1>
        <p className="text-gray-500">
          Browse and discover your next favorite anime series
        </p>
      </div>

      {/* Filter Tabs + Result Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <FilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* Grid */}
      {isError ? (
        <p role="alert" className="py-6 text-gray-400">
          Unable to load anime from AniList. {error?.message}
        </p>
      ) : (
        <Anime_MangaGrid items={items} isLoading={isLoading} type="anime" />
      )}

      {/* Pagination */}
      {!isError && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
