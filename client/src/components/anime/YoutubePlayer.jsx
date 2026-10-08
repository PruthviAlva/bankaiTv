import { PlayCircle } from "lucide-react";

export default function YoutubePlayer({ trailer, title }) {
  // If no trailer available
  if (!trailer?.embed_url) {
    return (
      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          Trailer
        </h2>
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-white/5 p-8 text-center"
          style={{ backgroundColor: "var(--color-surface-2)" }}
        >
          <PlayCircle className="w-10 h-10 text-gray-600" />
          <p className="text-gray-400">No trailer available for this anime.</p>
        </div>
      </section>
    );
  }

  const trailerUrl = new URL(trailer.embed_url);
  trailerUrl.searchParams.set("autoplay", "1");
  trailerUrl.searchParams.delete("mute");

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-blue-500 rounded-full" />
        Trailer
      </h2>
      <div
        className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-xl
                            border border-anime-border"
      >
        <iframe
          src={trailerUrl.toString()}
          title={`${title} trailer`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; accelerometer; clipboard-write;
                       encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  );
}
