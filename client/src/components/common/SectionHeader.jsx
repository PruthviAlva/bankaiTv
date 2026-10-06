import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({ title, viewAllLink, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full" />
        {Icon && <Icon className="w-5 h-5 text-blue-500" />}
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      </div>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-blue-500 transition-colors hover:text-blue-400 sm:text-base"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
