import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import animeService from "../../../services/animeService";

export default function RelatedCard({ entry }) {
  const { data } = useQuery({
    queryKey: ["anime", String(entry.mal_id)],
    queryFn: () => animeService.getAnimeById(entry.mal_id).then((r) => r.data),
    staleTime: 1000 * 60 * 30, // 30 min — related anime rarely changes
  });

  const anime = data?.data;
  const cover = anime?.images?.jpg?.image_url;
  const title = anime?.title_english || anime?.title || entry.name;

  return (
    <Link to={`/anime/${entry.mal_id}`} className="group">
      <div className="rounded-lg overflow-hidden aspect-[2/3] bg-white/5 mb-2">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          // Skeleton while loading
          <div className="w-full h-full animate-pulse bg-white/5" />
        )}
      </div>
      <p className="text-xs text-gray-400 group-hover:text-white transition-colors line-clamp-2 leading-tight">
        {title}
      </p>
      <p className="text-xs text-blue-500 mt-0.5">{entry.relation}</p>
    </Link>
  );
}
