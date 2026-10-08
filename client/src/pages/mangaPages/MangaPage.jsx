import { useSearchParams } from "react-router-dom";
import FilterTabs from "../../components/common/FilterTabs";
import Anime_MangaGrid from "../../components/grid/Anime_MangaGrid";
import Pagination from "../../components/common/Pagination";
import { useMangaList } from "../../hooks/useManga";

const TABS = [
  { label: "Top Manga", value: "manga" },
  { label: "Manhwa", value: "manhwa" },
  { label: "Manhua", value: "manhua" },
  { label: "OEL", value: "oel" },
  { label: "Publishing", value: "publishing" },
  { label: "Completed", value: "finished" },
];

const getFilters = (tab) => {
  switch (tab) {
    case "manga":
      return { type: "Manga" };
    case "manhwa":
      return { type: "Manhwa" };
    case "manhua":
      return { type: "Manhua" };
    case "oel":
      return { type: "OEL" };
    case "publishing":
      return { status: "Ongoing" };
    case "finished":
      return { status: "Complete" };
    default:
      return {};
  }
};

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const activeTab = searchParams.get("tab") || "manga";

  const filters = getFilters(activeTab);
  const { data, isLoading, isError } = useMangaList(currentPage, filters);

  const items = data?.data || [];
  const totalPages = data?.pagination?.last_visible_page || 1;

  const handleTabChange = (tab) => setSearchParams({ tab, page: "1" });

  const handlePageChange = (page) => {
    setSearchParams({ tab: activeTab, page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Manga</h1>
        <p className="text-gray-500 text-sm">
          Explore manga, manhwa, manhua, and more
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <FilterTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />
      </div>

      <Anime_MangaGrid
        items={items}
        isLoading={isLoading}
        error={isError ? "Unable to load manga from WeebCentral. Please try again." : null}
        type="manga"
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
