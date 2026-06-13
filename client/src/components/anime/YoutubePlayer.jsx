import { ExternalLink, PlayCircle } from "lucide-react";

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
          className="rounded-xl p-8 flex flex-col items-center gap-3 text-center border border-white/5"
          style={{ backgroundColor: "var(--color-surface-2)" }}
        >
          <PlayCircle className="w-10 h-10 text-gray-600" />
          <p className="text-gray-400">No trailer available for this anime.</p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 text-sm"
          >
            Search on YouTube <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-blue-500 rounded-full" />
        Trailer
      </h2>
      <div
        className="relative w-full max-w-6xl aspect-video rounded-xl overflow-hidden
                            border border-anime-border"
      >
        <iframe
          src={trailer.embed_url}
          title={`${title} trailer`}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write;
                       encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  );
}
