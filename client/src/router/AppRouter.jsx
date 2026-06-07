import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import LoadingSpinner from "../components/common/LoadingSpinner";

// Lazy load pages — only downloaded when visited (faster initial load)
const HomePage = lazy(() => import("../pages/HomePage"));
const AnimePage = lazy(() => import("../pages/AnimePage"));
const MangaPage = lazy(() => import("../pages/MangaPage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));

const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRouter() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <Navbar />

      {/* Suspense shows spinner while lazy page loads */}
      <main>
        {/* <main className="flex-1"> */}
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/manga" element={<MangaPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
