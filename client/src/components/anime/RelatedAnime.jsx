import AnimeRow from "./AnimeRow";

const normalizeSeriesTitle = (title = "") =>
  (title || "")
    .toLocaleLowerCase()
    .replace(/\b(?:season|part|cour)\s+\d+\b.*$/i, "")
    .replace(/\b\d+(?:st|nd|rd|th)\s+season\b.*$/i, "")
    .replace(/\s+(?:i{1,3}|iv|v)(?=:)/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

const toAnimeCardData = (entry, source) => {
  const title =
    entry.name ||
    entry.title_english ||
    entry.title?.english ||
    entry.title?.romaji ||
    entry.title;
  const animeSource = entry.source || source;

  return {
    ...entry,
    id: entry.id ?? (animeSource === "anilist" ? entry.mal_id : undefined),
    mal_id: entry.mal_id ?? entry.id,
    source: animeSource,
    title,
    type: entry.format ?? entry.type,
    score:
      entry.score ??
      (entry.averageScore ? entry.averageScore / 10 : undefined),
  };
};

export default function RelatedAnime({
  relations = [],
  recommendations = [],
  source = "jikan",
  animeTitle = "",
  animeId,
  showSeasons = true,
  showRecommendations = true,
}) {
  const normalizedAnimeTitles = (Array.isArray(animeTitle) ? animeTitle : [animeTitle])
    .map(normalizeSeriesTitle)
    .filter(Boolean);
  const seenSeasonIds = new Set([animeId].filter(Boolean));
  const seasons = (relations ?? [])
    .filter(({ relation }) => ["Sequel", "Prequel"].includes(relation))
    .flatMap(({ relation, entry = [] }) =>
      entry
        .filter((anime) => {
          const relatedTitles = [
            anime.name,
            anime.title_english,
            anime.title?.english,
            anime.title_romaji,
            anime.title?.romaji,
            anime.title,
          ]
            .map(normalizeSeriesTitle)
            .filter(Boolean);
          return (
            anime.type === "anime" &&
            !seenSeasonIds.has(anime.id ?? anime.mal_id) &&
            relatedTitles.some((relatedTitle) =>
              normalizedAnimeTitles.some(
                (seriesTitle) =>
                  relatedTitle.includes(seriesTitle) ||
                  seriesTitle.includes(relatedTitle),
              ),
            )
          );
        })
        .map((anime) => {
          seenSeasonIds.add(anime.id ?? anime.mal_id);
          return { ...toAnimeCardData(anime, source), relation };
        }),
    )
    .slice(0, 10);

  const suggestedAnime = (recommendations ?? [])
    .filter((anime) => anime.type === "anime" && anime.name)
    .slice(0, 10)
    .map((anime) => toAnimeCardData(anime, source));

  return (
    <>
      {showSeasons && seasons.length > 0 && (
        <AnimeRow title="Seasons" animeList={seasons} />
      )}
      {showRecommendations && suggestedAnime.length > 0 && (
        <AnimeRow title="You may like" animeList={suggestedAnime} />
      )}
    </>
  );
}
