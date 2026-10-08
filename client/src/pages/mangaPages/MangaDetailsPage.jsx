import { useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Star } from "lucide-react";

import { useMangaDetails } from "../../hooks/useManga";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AnimeRow from "../../components/anime/AnimeRow";

const getShortSynopsis = (synopsis = "") => {
  const words = synopsis.trim().split(/\s+/).filter(Boolean);
  return words.length > 99 ? `${words.slice(0, 99).join(" ")}...` : synopsis;
};

export default function MangaDetailsPage({ source = "jikan" }) {
  const { id } = useParams();
  const { data, isLoading, isError } = useMangaDetails(id, source);
  const chaptersRef = useRef(null);
  const [visibleChapterCount, setVisibleChapterCount] = useState(20);

  const scrollToChapters = () => {
    chaptersRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError || !data?.data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Failed to load manga details.</p>
        <Link to="/manga" className="text-blue-500 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Manga
        </Link>
      </div>
    );
  }

  const manga = data.data;
  const title = manga.title_english || manga.title || "Untitled";
  const poster =
    manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url;
  const synopsis = getShortSynopsis(manga.synopsis || "No synopsis available.");
  const chapters = manga.chapters || [];
  const authors = manga.authors || [];

  return (
    <div className="min-h-screen">
      <div className="relative h-[75vh] overflow-hidden">
        {poster && (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-top"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-end px-4 pb-8 md:px-8">
          <div className="mx-auto flex w-full max-w-6xl items-end gap-6">
            {poster && (
              <div className="hidden w-56 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl md:block">
                <img
                  src={poster}
                  alt={`${title} cover`}
                  className="aspect-[2/3] w-full object-cover"
                />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <Link
                to="/manga"
                className="mb-3 inline-flex items-center gap-1 text-gray-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Manga
              </Link>

              <div className="mb-3 flex flex-wrap gap-2">
                {manga.genres?.map((genre) => (
                  <span
                    key={genre.mal_id ?? genre.name}
                    className="rounded-full border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs text-white"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <h1 className="mb-2 text-3xl font-black leading-tight text-white md:text-4xl">
                {title}
              </h1>

              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                {manga.score != null && (
                  <span className="flex items-center gap-1 font-semibold text-yellow-400">
                    <Star className="h-4 w-4 fill-yellow-400" />
                    {manga.score}
                  </span>
                )}
                {manga.type && (
                  <span className="rounded bg-white/10 px-2 py-0.5">
                    {manga.type}
                  </span>
                )}
                {manga.status && <span>{manga.status}</span>}
                {manga.year && <span>{manga.year}</span>}
              </div>

              {chapters.length > 0 && (
                <button
                  type="button"
                  onClick={scrollToChapters}
                  className="flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  <BookOpen className="h-4 w-4" />
                  View Chapters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 md:px-8">
        <section>
          <p className="max-w-4xl leading-relaxed text-gray-400">{synopsis}</p>
        </section>

        {authors.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-white">
              <span className="h-9 w-1 rounded-full bg-blue-500" />
              Authors
            </h2>
            <div className="flex flex-wrap gap-2">
              {authors.map(({ name }) => (
                <span
                  key={name}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </section>
        )}

        <section ref={chaptersRef} className="scroll-mt-24">
          <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-white">
            <span className="h-9 w-1 rounded-full bg-blue-500" />
            Chapters
          </h2>
          {chapters.length > 0 ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {chapters.slice(0, visibleChapterCount).map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-200">
                      {chapter.title}
                    </span>
                    {chapter.publishedAt && (
                      <time
                        dateTime={chapter.publishedAt}
                        className="flex-shrink-0 text-xs text-gray-500"
                      >
                        {new Date(chapter.publishedAt).toLocaleDateString()}
                      </time>
                    )}
                  </div>
                ))}
              </div>
              {visibleChapterCount < chapters.length && (
                <button
                  type="button"
                  onClick={() => setVisibleChapterCount(chapters.length)}
                  className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Show all {chapters.length} loaded chapters
                </button>
              )}
              {manga.chaptersTruncated && (
                <p className="mt-3 text-sm text-gray-500">
                  Showing the latest {chapters.length} of {manga.chaptersTotal}{" "}
                  chapters.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Chapter information is unavailable for this manga.
            </p>
          )}
        </section>

        {manga.relations?.length > 0 && (
          <AnimeRow
            title="Related Manga"
            animeList={manga.relations}
            type="manga"
          />
        )}
      </div>
    </div>
  );
}
