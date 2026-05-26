import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";
import AppRouter from "./router/AppRouter";

// TanStack Query client — global cache config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data fresh for 5 minutes
      gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 429 (rate limit) or 403 (forbidden)
        if (error?.response?.status === 429 || error?.response?.status === 403) {
          return false;
        }
        // Retry up to 1 time for other errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000),
      refetchOnWindowFocus: false, // Don't refetch when tab regains focus
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
