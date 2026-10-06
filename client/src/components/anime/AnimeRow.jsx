import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import AnimeCard from "./animeCard/AnimeCard";
import AnimeCardSkeleton from "./animeCard/AnimeCardSkeleton";

import SectionHeader from "../common/SectionHeader";

export default function AnimeRow({
  title,
  viewAllLink,
  icon,
  animeList = [],
  isLoading = false,
  error,
  showRank = false,
  type = "anime",
}) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    setCanScrollLeft(scroller.scrollLeft > 0);
    setCanScrollRight(
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1,
    );
  }, []);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [animeList.length, isLoading, updateScrollButtons]);

  const scroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * scroller.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10">
      <SectionHeader title={title} viewAllLink={viewAllLink} icon={icon} />

      {/* Horizontal scroll container */}
      {error ? (
        <p role="alert" className="py-6 text-gray-400">
          Unable to load {title.toLowerCase()}.
        </p>
      ) : (
        <div className="group/row relative">
          <div
            ref={scrollerRef}
            onScroll={updateScrollButtons}
            className="scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto scroll-smooth overscroll-x-contain pb-3 sm:gap-4"
          >
            {isLoading
              ? // Show skeleton placeholders while loading
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="w-40 flex-shrink-0 snap-start sm:w-48 md:w-56"
                    >
                      <AnimeCardSkeleton />
                    </div>
                  ))
              : animeList.map((anime, index) => (
                  <div
                    key={anime.mal_id ?? anime.id}
                    className={`relative flex-shrink-0 snap-start ${
                      showRank
                        ? "w-60 pl-24 sm:w-70 sm:pl-28 md:w-[20.25rem] md:pl-[8.25rem]"
                        : "w-40 sm:w-48 md:w-56"
                    }`}
                  >
                    {showRank && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-1/2 z-0 -translate-y-1/2 text-[13.5rem] font-black leading-none text-transparent sm:text-[15.75rem] md:text-[18rem]"
                        style={{
                          WebkitTextStroke: "3px rgba(64, 64, 64, 0.9)",
                        }}
                      >
                        {index + 1}
                      </span>
                    )}
                    <div className={showRank ? "relative z-10" : undefined}>
                      <AnimeCard anime={anime} type={type} />
                    </div>
                  </div>
                ))}
          </div>

          {canScrollLeft && (
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scroll(-1)}
              className="absolute left-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-lg backdrop-blur transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scroll(1)}
              className="absolute right-1 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-lg backdrop-blur transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
