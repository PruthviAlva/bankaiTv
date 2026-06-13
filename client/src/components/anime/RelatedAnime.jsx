import RelatedCard from "./animeCard/RelatedCard";

export default function RelatedAnime({ relations = [] }) {
  // Filter to only sequel/prequel/side story — most useful relations
  const usefulRelations =
    relations?.filter((r) =>
      [
        "Sequel",
        "Prequel",
        "Side Story",
        "Alternative Version",
        "Summary",
      ].includes(r.relation),
    ) || [];

  if (usefulRelations.length === 0) return null;

  // Flatten all entries from all relation groups
  const relatedEntries = usefulRelations
    .flatMap((r) =>
      r.entry
        .filter((e) => e.type === "anime")
        .map((e) => ({ ...e, relation: r.relation })),
    )
    .slice(0, 10); // max 10

  if (relatedEntries.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-blue-500 rounded-full" />
        Related Anime
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {relatedEntries.map((entry) => (
          <RelatedCard key={entry.mal_id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
