import { useQuery } from '@tanstack/react-query';
import mangaService from '../services/mangaService';

// Each hook wraps a service call with a unique cache key
// TanStack Query automatically caches, dedupes, and refetches
export const useMangaDetails = (id, source = 'jikan') =>
    useQuery({
        queryKey: ['manga', source, id],
        queryFn: () => (
            source === 'weebcentral'
                ? mangaService.getWeebCentralMangaById(id)
                : mangaService.getMangaById(id)
        ).then(r => r.data),
        enabled: !!id,
    })

export const useMangaList = (page, filters) => useQuery({
    queryKey: ['manga-list', page, filters],
    queryFn: () => mangaService.getMangaList(page, filters).then(r => r.data),
})