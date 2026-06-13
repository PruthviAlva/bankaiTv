import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { JIKAN_BASE_URL } from '../utils/constants';

// Jikan has a rate limit: 3 req/sec, 60 req/min
// Use client-side rate limiting to stay under the limit
const jikanRaw = axios.create({
    baseURL: JIKAN_BASE_URL,
    timeout: 10000, // 10s timeout to be safe
})

// Rate limit to 1 request per second to safely stay under Jikan's limit
// Even though Jikan allows 3 req/sec, being conservative prevents 429 errors
const jikan = rateLimit(jikanRaw, { maxRequests: 1, perMilliseconds: 1000 })

const animeService = {
    // Top 10 today ( Same for Hero banner )
    getTopAnime: (page = 1, limit = 10) => jikan.get(`/top/anime?limit=${limit}&page=${page}`),

    //Trending anime ( currently airing, sorted by score )
    getTrendingAnime: (page = 1) => jikan.get(`/anime?status=airing&order_by=score&sort=desc&limit=12&page=${page}`),

    // Latest episodes ( currently airing, sorted by start date )
    getLatestEpisodes: () => jikan.get(`/anime?status=airing&order_by=start_date&sort=desc&limit=12`),

    // Top upcoming ( not yet aired, sorted by popularity )
    getTopUpcomingAnime: (page = 1) => jikan.get(`/seasons/upcoming?limit=12&page=${page}`),

    // All anime with filters (for /anime page)
    getAnimeList: (page = 1, filters = {}) => {
        const params = new URLSearchParams({ page, limit: 24, ...filters })
        return jikan.get(`/anime?${params}`)
    },

    // Search
    searchAnime: (query, page = 1, filters = {}) => {
        const params = new URLSearchParams({
            q: query,
            page,
            limit: 24,
            ...filters,
        })
        return jikan.get(`/anime?${params}`)
    },

    // Single anime details
    getAnimeById: (id) => jikan.get(`/anime/${id}/full`),
}

export default animeService;