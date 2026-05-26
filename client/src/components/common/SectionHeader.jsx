import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function SectionHeader({ title, viewAllLink, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full" />
        {Icon && <Icon className="w-5 h-5 text-blue-500" />}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {viewAllLink && (
        <Link
          to={viewAllLink}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
