import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Info,
  Star,
  Calendar,
  Tv,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function HeroBanner({ animeList = [], error }) {
  const [currentAnime, setCurrentAnime] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (animeList.length === 0) return;

    const timer = setInterval(() => {
      setCurrentAnime((prev) => (prev + 1) % animeList.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [animeList.length]);

  if (animeList.length === 0) {
    if (error) {
      return (
        <div role="alert" className="mb-10 rounded-xl bg-white/5 p-6 text-gray-400">
          Unable to load featured anime.
        </div>
      );
    }

    // Skeleton state
    return (
      <div className="relative mb-8 h-[min(62vh,34rem)] min-h-[26rem] animate-pulse rounded-xl bg-white/5 sm:mb-10 sm:h-[min(80vh,42rem)] sm:min-h-[34rem]" />
    );
  }

  const anime = animeList[currentAnime];
  const isAniList = anime.source === "anilist";
  const animeId = isAniList ? anime.id : anime.mal_id;
  const animeUrl = isAniList
    ? `/anime/anilist/${animeId}`
    : `/anime/${animeId}`;
  const imageUrl =
    anime.banner_image ||
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url;
  const title =
    anime.title_english ||
    anime.title?.english ||
    anime.title?.romaji ||
    anime.title;
  const synopsis = anime.synopsis?.slice(0, 200);

  return (
    <div className="relative mb-8 h-[min(62vh,34rem)] min-h-[26rem] overflow-hidden rounded-xl sm:mb-10 sm:h-[min(80vh,42rem)] sm:min-h-[34rem]">
      {/* Background image with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnime}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-top"
          />

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex h-full max-w-6xl flex-col justify-end p-5 pb-20 sm:p-8 sm:pb-12 md:p-12">
        {/* Title */}
        <motion.h1
          key={`title-${currentAnime}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 line-clamp-2 text-2xl font-black leading-tight sm:text-3xl md:text-5xl"
        >
          {title}
        </motion.h1>

        {/* Currently Airing badge */}
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base">
          <span className="px-2 py-1">{anime.status}</span>
          {/* Rating */}
          {anime.score && (
            <span className="flex items-center gap-1 px-2 py-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {anime.score}
            </span>
          )}
          {/* Season */}
          {anime.season && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {anime.year}
            </span>
          )}
          {/* Episodes */}
          {anime.episodes && (
            <span className="flex items-center px-2 gap-1 bg-blue-500 rounded-xl">
              <Tv className="w-4 h-4" /> {anime.episodes} Episodes
            </span>
          )}
        </div>

        {/* Synopsis */}
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed sm:mb-6 sm:line-clamp-3 sm:text-base">
          {synopsis}
          {synopsis?.length === 200 ? "..." : ""}
        </p>

        {/* Watch Now Buttons and See More */}
        <div className="flex flex-wrap gap-3 sm:gap-6">
          <Link
            to={animeUrl}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold sm:px-5 sm:text-base"
          >
            <Play className="h-5 w-5" /> Watch Now
          </Link>
          <Link
            to={animeUrl}
            className="flex items-center gap-2 rounded-lg bg-gray-700/80 px-4 py-2.5 text-sm font-semibold sm:px-5 sm:text-base"
          >
            <Info className="h-5 w-5" /> See More
          </Link>
        </div>
      </div>

      {/* Arrow indicators */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2 sm:bottom-6 sm:right-5">
        <button
          type="button"
          aria-label="Next featured anime"
          onClick={() =>
            setCurrentAnime((prev) => (prev + 1) % animeList.length)
          }
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-gray-700 sm:h-10 sm:w-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <button
          type="button"
          aria-label="Previous featured anime"
          onClick={() =>
            setCurrentAnime(
              (prev) => (prev - 1 + animeList.length) % animeList.length,
            )
          }
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded bg-gray-700 sm:h-10 sm:w-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
