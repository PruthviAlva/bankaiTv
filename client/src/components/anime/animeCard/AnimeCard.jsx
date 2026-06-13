import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Play, BookOpen, Tv } from "lucide-react";

export default function AnimeCard({ anime, type = "anime", rank = null }) {
  // Jikan returns slightly different shapes for anime vs manga
  const id = anime.mal_id;
  const title = anime.title_english || anime.title;
  const coverImage =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  const rating = anime.score;
  const episodes = type === "anime" ? anime.episodes : anime.chapters;
  const href = `/${type}/${id}`;

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative group"
    >
      <Link to={href} className="block">
        {/* Rank number — shown in Top 10 row */}
        {rank && (
          <div
            className="absolute -left-30 z-10 font-black"
            style={{
              fontSize: "20rem",
              color: "transparent",
              WebkitTextStroke: "8px rgba(64, 64, 64, 1.0)",
              lineHeight: 1,
            }}
          >
            {rank}
          </div>
        )}

        {/* Card image */}
        <div className="relative overflow-hidden z-11 rounded-lg aspect-[2/3] bg-surface-2">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Gradient overlay — always visible at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />

          {/* Score badge — top right */}
          {rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-1.5 py-0.5">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold">{rating}</span>
            </div>
          )}

          {/* Play button overlay — appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-blue-500 rounded-full p-3 shadow-lg shadow-blue-500/50">
              {type === "anime" ? (
                <Play className="w-8 h-8 text-white fill-white" />
              ) : (
                <BookOpen className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          {/* Hover overlay with more info */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent
                        to-transparent opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 flex items-end p-3"
          >
            <div className="flex items-center gap-3 text-white text-xs">
              {/* Episode count */}
              {episodes && (
                <span className="flex items-center gap-1">
                  <Tv size={12} />
                  {episodes} eps
                </span>
              )}
              {/* Type (TV, Movie, OVA) */}
              {type && (
                <span className="flex items-center gap-1">
                  <BookOpen size={12} />
                  {type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title below card */}
        <div className="mt-2 px-1">
          <p className="text-sm font-medium text-gray-200 line-clamp-2 leading-tight">
            {title}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
