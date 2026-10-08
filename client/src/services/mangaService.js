import axios from 'axios';
import rateLimit from 'axios-rate-limit';

import { api } from './authService';
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

    // Legacy Jikan details route for older manga links.
    getMangaById: (id) =>
        jikan.get(`/manga/${id}/full`),

    getWeebCentralMangaById: (id) => api.get(`/manga/${id}`),

    // Manga browsing and search are served by the Bankai API using WeebCentral data.
    getMangaList: (page = 1, filters = {}) =>
        api.get('/manga', { params: { page, ...filters } }),

    searchManga: (query, page = 1) =>
        api.get('/manga/search', { params: { q: query, page } }),
}

export default mangaService;