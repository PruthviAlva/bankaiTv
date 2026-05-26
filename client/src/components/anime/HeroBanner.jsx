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

export default function HeroBanner({ animeList = [] }) {
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
    // Skeleton state
    return (
      <div className="relative h-[80vh] bg-white/5 animate-pulse rounded-xl mb-10" />
    );
  }

  const anime = animeList[currentAnime];
  const imageUrl = anime.images?.jpg?.large_image_url;
  const title = anime.title_english || anime.title;
  const synopsis = anime.synopsis?.slice(0, 200);

  return (
    <div className="relative h-[80vh] rounded-xl overflow-hidden mb-10">
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
            className="w-full h-full object-fill object-top"
          />

          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 max-w-6xl">
        {/* Title */}
        <motion.h1
          key={`title-${currentAnime}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black mb-3 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Currently Airing badge */}
        <div className="flex items-center gap-3 mb-3">
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
        <p className="leading-relaxed mb-6 line-clamp-3">
          {synopsis}
          {synopsis?.length === 200 ? "..." : ""}
        </p>

        {/* Watch Now Buttons and See More */}
        <div className="flex gap-6">
          <Link
            to={`/anime/${anime.mal_id}`}
            className="flex items-center gap-2 bg-blue-500 font-semibold px-5 py-2.5 rounded-lg"
          >
            <Play /> Watch Now
          </Link>
          <Link
            to={`/anime/${anime.mal_id}/details`}
            className="flex items-center gap-2 bg-gray-700/80 font-semibold px-5 py-2.5 rounded-lg"
          >
            <Info /> See More
          </Link>
        </div>
      </div>

      {/* Arrow indicators */}
      <div className="absolute bottom-6 right-5 gap-2 z-10 flex flex-col">
        <button
          type="button"
          onClick={() =>
            setCurrentAnime((prev) => (prev + 1) % animeList.length)
          }
          className="flex items-center justify-center w-10 h-10 rounded bg-gray-700 cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={() =>
            setCurrentAnime(
              (prev) => (prev - 1 + animeList.length) % animeList.length,
            )
          }
          className="flex items-center justify-center w-10 h-10 rounded bg-gray-700 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
