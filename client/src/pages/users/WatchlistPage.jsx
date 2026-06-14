import { Link } from "react-router-dom";

import { useWatchlist, useWatchlistMutations } from "../../hooks/useWatchlist";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import WatchlistCard from "../../components/anime/animeCard/WatchlistCard";

export default function WatchlistPage() {
  const { user } = useAuth();
  const { data, isLoading } = useWatchlist();
  const { updateStatus, remove } = useWatchlistMutations();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-400">Sign in to view your watchlist.</p>
        <Link
          to="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner fullScreen />;

  const items = data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">My Watchlist</h1>
        <p className="text-gray-500 text-sm">{items.length} anime saved</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-600">
          <p className="text-lg">Your watchlist is empty.</p>
          <Link to="/anime" className="text-blue-500 hover:text-blue-400">
            Browse Anime →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              onStatusChange={(status) =>
                updateStatus.mutate({ animeId: item.animeId, status })
              }
              onRemove={() => remove.mutate(item.animeId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
