import AnimeCard from "./animeCard/AnimeCard";
import AnimeCardSkeleton from "./animeCard/AnimeCardSkeleton";

import SectionHeader from "../common/SectionHeader";

export default function AnimeRow({
  title,
  viewAllLink,
  icon,
  animeList = [],
  isLoading = false,
  showRank = false,
  type = "anime",
}) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} viewAllLink={viewAllLink} icon={icon} />

      {/* Horizontal scroll container */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {isLoading
          ? // Show skeleton placeholders while loading
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex-shrink-0 w-75 pl-8">
                  <AnimeCardSkeleton />
                </div>
              ))
          : animeList.map((anime, index) => (
              <div
                key={anime.mal_id}
                className={`flex-shrink-0 ${showRank ? "w-95 pl-35" : "w-60"}`}
              >
                <AnimeCard
                  anime={anime}
                  type={type}
                  rank={showRank ? index + 1 : null}
                />
              </div>
            ))}
      </div>
    </section>
  );
}
