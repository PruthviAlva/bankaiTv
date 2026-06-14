import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  Shuffle,
  LogIn,
  LogOut,
  User,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      searchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Anime", href: "/anime" },
    { label: "Manga", href: "/manga" },
  ];

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backdropFilter: "blur(12px)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mx-auto px-4 h-20 flex items-center gap-4">
        {/* Logo */}
        <Link to="/">
          <img src="/Anime_Logo.png" alt="Anime Logo" className="w-22 h-15" />
        </Link>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-1 ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-md mx-4 hidden md:block"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime, manga..."
              className="w-full pl-9 pr-4 py-2 rounded-4xl outline-none transition-colors"
              style={{
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Random anime button */}
          <button
            title="Random Anime"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <Shuffle />
          </button>

          {/* Login button */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300 hidden sm:block gap-1.5">
                <User className="w-8 h-8" />
                <span className="text-white font-semibold">
                  {user.username}
                </span>
              </span>
              <Link
                to="/watchlist"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="My Watchlist"
              >
                <List className="w-4 h-4" /> Watchlist
              </Link>
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t overflow-hidden"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-surface-2)",
            }}
          >
            <div className="p-4 flex flex-col gap-2">
              {/* Mobile search */}
              <form onSubmit={handleSearch}>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anime, manga..."
                    className="w-full pl-9 pr-4 py-2 rounded-4xl outline-none"
                    style={{
                      backgroundColor: "var(--color-surface-3)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }}
                  />
                </div>
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-4xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
