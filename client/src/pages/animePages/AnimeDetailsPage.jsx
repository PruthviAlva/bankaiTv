import { useParams, Link } from "react-router-dom";
import { Star, Play, ArrowLeft, Heart } from "lucide-react";

import { useAnimeDetails } from "../../hooks/useAnime";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import YoutubePlayer from "../../components/anime/YoutubePlayer";
import RelatedAnime from "../../components/anime/RelatedAnime";

export default function AnimeDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useAnimeDetails(id);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400">Failed to load anime details.</p>
        <Link to="/anime" className="text-blue-500 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Anime
        </Link>
      </div>
    );
  }

  const anime = data.data;
  const title = anime.title_english || anime.title;
  const backdrop = anime.images?.jpg?.large_image_url;
  const trailer = anime.trailer;

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ───────────────────────────── */}
      <div className="relative h-[75vh] overflow-hidden">
        {/* Backdrop image */}
        <img
          src={backdrop}
          alt={title}
          className="w-full h-full object-cover object-top"
        />

        {/* Gradients for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end pb-8 px-4 md:px-8">
          <div className="max-w-7xl w-full mx-auto flex gap-6 items-end">
            {/* Cover poster */}
            <div className="hidden md:block flex-shrink-0 w-70 rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={backdrop}
                alt={title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Back link */}
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Anime
              </Link>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-3">
                {anime.genres?.slice(0, 4).map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="text-xs px-2 py-0.5 bg-blue-500/50 text-white border border-blue-500/30 rounded-full"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                {title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                {anime.score && (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    {anime.score}
                  </span>
                )}
                {anime.type && (
                  <span className="bg-white/10 px-2 py-0.5 rounded">
                    {anime.type}
                  </span>
                )}
                {anime.status && <span>{anime.status}</span>}
                {anime.season && (
                  <span className="capitalize">
                    {anime.season} {anime.year}
                  </span>
                )}
                {anime.studios?.[0] && (
                  <span className="text-orange-400">
                    {anime.studios[0].name}
                  </span>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  <Play className="w-4 h-4 fill-white" /> Watch Now
                </button>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" /> Favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Synopsis */}
        <section>
          <p className="text-gray-400 leading-relaxed">
            {anime.synopsis || "No synopsis available."}
          </p>
        </section>

        {/* YouTube Player */}
        {trailer && <YoutubePlayer trailer={trailer} title={title} />}

        {/* Related Anime */}
        <RelatedAnime relations={anime.relations} />
      </div>
    </div>
  );
}
