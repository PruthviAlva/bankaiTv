import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CastSection({ cast = [], error }) {
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
  }, [cast.length, updateScrollButtons]);

  const scroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    scroller.scrollBy({
      left: direction * scroller.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (cast.length === 0 && !error) return null;

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-white">
        <span className="h-9 w-1 rounded-full bg-blue-500" />
        Cast
      </h2>

      {error ? (
        <p className="text-sm text-gray-400">
          Cast could not be loaded. Please try again later.
        </p>
      ) : (
        <div className="group/cast relative">
          <div
            ref={scrollerRef}
            onScroll={updateScrollButtons}
            className="scrollbar-hide flex snap-x snap-proximity gap-5 overflow-x-auto scroll-smooth overscroll-x-contain pb-3"
          >
            {cast.map((member) => (
              <div
                key={`${member.id}-${member.character}`}
                className="w-28 flex-shrink-0 snap-start text-center sm:w-32"
              >
                <div className="mx-auto mb-3 h-[4.5rem] w-[4.5rem] overflow-hidden rounded-full bg-white/10 sm:h-20 sm:w-20">
                  {member.image && (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="line-clamp-2 text-sm font-semibold text-white">
                  {member.name}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                  {member.character}
                </p>
              </div>
            ))}
          </div>
          {canScrollLeft && (
            <button
              type="button"
              aria-label="Scroll cast left"
              onClick={() => scroll(-1)}
              className="absolute left-1 top-10 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-lg backdrop-blur transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              aria-label="Scroll cast right"
              onClick={() => scroll(1)}
              className="absolute right-1 top-10 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/75 text-white shadow-lg backdrop-blur transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
