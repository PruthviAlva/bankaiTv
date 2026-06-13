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

const mangaService = {

    // Single manga details
    getMangaById: (id) =>
    jikan.get(`/manga/${id}/full`),

    // All manga with filters (for /manga page)
    getMangaList: (page = 1, filters = {}) => {
        const params = new URLSearchParams({ page, limit: 24, ...filters })
        return jikan.get(`/manga?${params}`)
    },

    // Search
    searchManga: (query, page = 1) => jikan.get(`/manga?q=${query}&page=${page}&limit=24`),
}

export default mangaService;