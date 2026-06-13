import { useParams, Link } from "react-router-dom";
import { useRef } from "react";
import { ArrowLeft, Star, BookOpen, Heart } from "lucide-react";

import { useMangaDetails } from "../../hooks/useManga";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function MangaDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useMangaDetails(id);
  const readerRef = useRef(null);

  const scrollToReader = () => {
    readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400">Failed to load manga details.</p>
        <Link to="/manga" className="text-blue-500 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Manga
        </Link>
      </div>
    );
  }

  const manga = data.data;
  const title = manga.title_english || manga.title;
  const backdrop = manga.images?.jpg?.large_image_url;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[75vh] overflow-hidden">
        <img
          src={backdrop}
          alt={title}
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

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
              <Link
                to="/manga"
                className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-3 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Manga
              </Link>

              <div className="flex flex-wrap gap-2 mb-2">
                {manga.genres?.slice(0, 4).map((g) => (
                  <span
                    key={g.mal_id}
                    className="text-xs px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
                {manga.score && (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                    <Star className="w-4 h-4 fill-yellow-400" /> {manga.score}
                  </span>
                )}
                {manga.type && (
                  <span className="bg-white/10 px-2 py-0.5 rounded">
                    {manga.type}
                  </span>
                )}
                {manga.status && <span>{manga.status}</span>}
                {manga.authors?.[0] && (
                  <span className="text-blue-400">{manga.authors[0].name}</span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={scrollToReader}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> Start Reading
                </button>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
                  <Heart className="w-4 h-4" /> Favorite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* Synopsis */}
        <section>
          <p className="text-gray-400 leading-relaxed max-w-4xl">
            {manga.synopsis || "No synopsis available."}
          </p>
        </section>

        {/* Reader placeholder coming soon! */}
        <section ref={readerRef}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            Read Online
          </h2>
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-3 text-center border border-white/5"
            style={{ backgroundColor: "var(--color-surface-2)" }}
          >
            <BookOpen className="w-10 h-10 text-gray-600" />
            <p className="text-gray-500 text-sm">Coming soon...</p>
            <a
              href={`https://mangadex.org/search?q=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-400 text-sm"
            >
              Read on MangaDex →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
