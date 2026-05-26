import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="border-t mt-16 py-8 items-center justify-center text-center flex flex-col gap-4"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm ml-2">
            &copy; {new Date().getFullYear()} Bankai. All rights reserved.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <Link to="/anime" className="hover:text-white transition-colors">
          Anime
        </Link>
        <Link to="/manga" className="hover:text-white transition-colors">
          Manga
        </Link>
        <Link to="/search" className="hover:text-white transition-colors">
          Search
        </Link>
      </div>
    </footer>
  );
}
