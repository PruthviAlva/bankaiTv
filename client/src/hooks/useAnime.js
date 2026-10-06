import { useQuery } from '@tanstack/react-query';
import animeService from '../services/animeService';

// Each hook wraps a service call with a unique cache key
// TanStack Query automatically caches, dedupes, and refetches

export const useTopAnime = (limit = 10) => useQuery({
    queryKey: ['top-anime', limit],
    queryFn: () => animeService.getTopAnime(1, limit).then(res => res.data),
    staleTime: 1000 * 60 * 30,  // Keep data fresh for 30 minutes
    gcTime: 1000 * 60 * 60,     // Keep in cache for 1 hour
})

export const useTrendingAnime = () => useQuery({
    queryKey: ['trending-anime'],
    queryFn: () => animeService.getTrendingAnime().then(res => res.data),
    staleTime: 1000 * 60 * 20,  // Keep fresh for 20 minutes
    gcTime: 1000 * 60 * 60,     // Keep in cache for 1 hour
})

export const useLatestEpisodes = () => useQuery({
    queryKey: ['latest-episodes'],
    queryFn: () => animeService.getLatestEpisodes().then(res => res.data),
    staleTime: 1000 * 60 * 15,  // Keep fresh for 15 minutes
    gcTime: 1000 * 60 * 45,     // Keep in cache for 45 minutes
})

export const useTopUpcomingAnime = () => useQuery({
    queryKey: ['top-upcoming'],
    queryFn: () => animeService.getTopUpcomingAnime().then(res => res.data),
    staleTime: 1000 * 60 * 30,  // Keep fresh for 30 minutes
    gcTime: 1000 * 60 * 60,     // Keep in cache for 1 hour
})

export const useAnimeList = (page, filters) => useQuery({
    queryKey: ['anime-list', page, filters],
    queryFn: () => animeService.getAnimeList(page, filters).then(r => r.data),
})

export const useAnimeDetails = (id, source = 'jikan') => useQuery({
    queryKey: ['anime', source, id],
    queryFn: () => (
        source === 'anilist'
            ? animeService.getAniListAnimeById(id)
            : animeService.getAnimeById(id)
    ).then(r => r.data),
    enabled: !!id, // Don't run if id is undefined
})