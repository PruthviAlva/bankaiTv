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
const aniList = axios.create({
    baseURL: 'https://graphql.anilist.co',
    timeout: 10000,
})

const aniListMediaFields = `
    id
    idMal
    title { romaji english native }
    description(asHtml: false)
    coverImage { extraLarge large }
    bannerImage
    averageScore
    popularity
    episodes
    duration
    format
    status
    season
    seasonYear
    startDate { year month day }
    endDate { year month day }
    genres
    studios { edges { isMain node { id name } } }
`

const aniListAnimeDetailsQuery = `
    query AnimeDetails($id: Int!) {
        Media(id: $id, type: ANIME) {
            ${aniListMediaFields}
            trailer { id site }
            characters(page: 1, perPage: 12, sort: ROLE) {
                edges {
                    role
                    node {
                        id
                        name { full }
                        image { large }
                    }
                    voiceActors(language: JAPANESE) {
                        id
                        name { full }
                        image { large }
                    }
                }
            }
            recommendations(perPage: 10, sort: RATING_DESC) {
                nodes {
                    rating
                    mediaRecommendation {
                        id
                        idMal
                        type
                        title { romaji english }
                        coverImage { large }
                        averageScore
                        episodes
                        format
                    }
                }
            }
            relations {
                edges {
                    relationType
                    node {
                        id
                        idMal
                        type
                        format
                        episodes
                        averageScore
                        title { romaji english }
                        coverImage { large }
                    }
                }
            }
        }
    }
`

const aniListAnimeRelationsQuery = `
    query AnimeRelations($id: Int!) {
        Media(id: $id, type: ANIME) {
            relations {
                edges {
                    relationType
                    node {
                        id
                        idMal
                        type
                        format
                        episodes
                        averageScore
                        title { romaji english }
                        coverImage { large }
                    }
                }
            }
        }
    }
`

const fetchAniListMedia = async (query, variables = {}) => {
    const response = await aniList.post('', { query, variables })
    if (response.data?.errors?.length) {
        throw new Error(response.data.errors.map(({ message }) => message).join('; '))
    }

    return response.data?.data
}

const normalizeAniListCast = (edges = []) =>
    edges.flatMap(({ role, node, voiceActors = [] }) => {
        return voiceActors.map((actor) => ({
            id: actor.id,
            name: actor.name?.full ?? 'Unknown',
            image: actor.image?.large,
            character: node.name?.full,
            role,
        }))
    })

const normalizeJikanCast = (entries = []) =>
    entries.flatMap(({ character, role, voice_actors: voiceActors = [] }) => {
        const japaneseActors = voiceActors.filter(
            ({ language }) => language === 'Japanese',
        )
        const actors = japaneseActors.length > 0
            ? japaneseActors
            : voiceActors

        return actors.map(({ person }) => ({
            id: person.mal_id,
            name: person.name || character.name || 'Unknown',
            image:
                person.images?.jpg?.image_url ||
                character.images?.jpg?.image_url,
            character: character.name,
            role,
        }))
    })

const relationName = (relation) => relation
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const normalizeAniListRelations = (edges = []) => edges
    .filter(({ node }) => node.type === 'ANIME')
    .reduce((relations, { relationType, node }) => {
        const relation = relationName(relationType)
        let group = relations.find((item) => item.relation === relation)
        if (!group) {
            group = { relation, entry: [] }
            relations.push(group)
        }
        if (!group.entry.some((entry) => entry.id === node.id)) {
            group.entry.push({
                mal_id: node.idMal ?? node.id,
                id: node.id,
                source: 'anilist',
                type: 'anime',
                format: node.format,
                episodes: node.episodes,
                score: node.averageScore ? node.averageScore / 10 : null,
                name: node.title?.english ?? node.title?.romaji,
                title_english: node.title?.english,
                title_romaji: node.title?.romaji,
                images: { jpg: { image_url: node.coverImage?.large } },
            })
        }
        return relations
    }, [])

const getAniListFranchiseRelations = async (media) => {
    const allEdges = [...(media.relations?.edges ?? [])]
    const visitedIds = new Set([media.id])
    let pending = allEdges
        .filter(({ relationType, node }) =>
            ['SEQUEL', 'PREQUEL'].includes(relationType) &&
            node.type === 'ANIME' &&
            !visitedIds.has(node.id),
        )
        .map(({ node }) => node.id)
    let fetchedCount = 0

    while (pending.length > 0 && fetchedCount < 20) {
        const batch = pending
            .filter((animeId) => !visitedIds.has(animeId))
            .slice(0, 20 - fetchedCount)
        if (batch.length === 0) break

        batch.forEach((animeId) => visitedIds.add(animeId))
        fetchedCount += batch.length

        const relatedMedia = await Promise.all(
            batch.map(async (animeId) => {
                const data = await fetchAniListMedia(aniListAnimeRelationsQuery, {
                    id: animeId,
                })
                if (!data?.Media) {
                    throw new Error(`AniList anime ${animeId} was not found`)
                }
                return data.Media
            }),
        )
        const nextPending = []

        relatedMedia.forEach((relatedAnime) => {
            const edges = relatedAnime.relations?.edges ?? []
            allEdges.push(...edges)
            edges.forEach(({ relationType, node }) => {
                if (
                    ['SEQUEL', 'PREQUEL'].includes(relationType) &&
                    node.type === 'ANIME' &&
                    !visitedIds.has(node.id)
                ) {
                    nextPending.push(node.id)
                }
            })
        })
        pending = nextPending
    }

    return normalizeAniListRelations(allEdges)
}

const getAniListAnimeList = async (query, perPage = 12, variables = {}) => {
    const data = await fetchAniListMedia(query, { ...variables, perPage })
    const media = data?.Page?.media
    if (!Array.isArray(media)) {
        throw new Error('Unexpected response from AniList anime list')
    }

    return { data: { data: media.map(normalizeAniListAnime) } }
}

const getAniListAnimePage = async (page, filters = {}) => {
    const variables = {
        page,
        perPage: 24,
        sort: [filters.sort ?? 'TRENDING_DESC'],
    }
    const variableDefinitions = ['$page: Int', '$perPage: Int', '$sort: [MediaSort]']
    const mediaFilters = ['type: ANIME', 'sort: $sort', 'isAdult: false']
    if (filters.format) {
        variableDefinitions.push('$format: MediaFormat')
        variables.format = filters.format
        mediaFilters.push('format: $format')
    }
    if (filters.status) {
        variableDefinitions.push('$status: MediaStatus')
        variables.status = filters.status
        mediaFilters.push('status: $status')
    }

    const data = await fetchAniListMedia(`
        query AnimeList(${variableDefinitions.join(', ')}) {
            Page(page: $page, perPage: $perPage) {
                pageInfo {
                    currentPage
                    lastPage
                    hasNextPage
                    total
                }
                media(${mediaFilters.join(', ')}) {
                    ${aniListMediaFields}
                }
            }
        }
    `, variables)
    const resultPage = data?.Page
    if (!Array.isArray(resultPage?.media)) {
        throw new Error('Unexpected response from AniList anime list')
    }

    return {
        data: {
            data: resultPage.media.map(normalizeAniListAnime),
            pagination: {
                last_visible_page: resultPage.pageInfo?.lastPage ?? 1,
                current_page: resultPage.pageInfo?.currentPage ?? page,
                has_next_page: resultPage.pageInfo?.hasNextPage ?? false,
                total: resultPage.pageInfo?.total ?? 0,
            },
        },
    }
}

const searchAniListAnime = async (search, page = 1, filters = {}) => {
    const variables = {
        search,
        page,
        perPage: 24,
        sort: ['SEARCH_MATCH'],
    }
    const variableDefinitions = [
        '$search: String!',
        '$page: Int!',
        '$perPage: Int!',
        '$sort: [MediaSort]!',
    ]
    const mediaFilters = [
        'search: $search',
        'type: ANIME',
        'sort: $sort',
        'isAdult: false',
    ]

    if (filters.status) {
        variableDefinitions.push('$status: MediaStatus')
        variables.status = filters.status
        mediaFilters.push('status: $status')
    }

    const data = await fetchAniListMedia(`
        query SearchAnime(${variableDefinitions.join(', ')}) {
            Page(page: $page, perPage: $perPage) {
                pageInfo {
                    currentPage
                    lastPage
                    hasNextPage
                    total
                }
                media(${mediaFilters.join(', ')}) {
                    ${aniListMediaFields}
                }
            }
        }
    `, variables)
    const resultPage = data?.Page
    if (!Array.isArray(resultPage?.media)) {
        throw new Error('Unexpected response from AniList anime search')
    }

    return {
        data: {
            data: resultPage.media.map(normalizeAniListAnime),
            pagination: {
                last_visible_page: resultPage.pageInfo?.lastPage ?? 1,
                current_page: resultPage.pageInfo?.currentPage ?? page,
                has_next_page: resultPage.pageInfo?.hasNextPage ?? false,
                total: resultPage.pageInfo?.total ?? 0,
            },
        },
    }
}

const normalizeAniListAnime = (media) => {
    const dateString = (date) => (
        date?.year
            ? [date.year, date.month, date.day].filter(Boolean).join('-')
            : null
    )
    return {
        id: media.id,
        mal_id: media.idMal ?? media.id,
        source: 'anilist',
        title: media.title?.romaji ?? media.title?.english ?? media.title?.native ?? 'Untitled',
        title_english: media.title?.english,
        title_romaji: media.title?.romaji,
        title_native: media.title?.native,
        images: {
            jpg: {
                image_url: media.coverImage?.large,
                large_image_url: media.coverImage?.extraLarge ?? media.coverImage?.large,
            },
        },
        banner_image: media.bannerImage,
        score: media.averageScore ? media.averageScore / 10 : null,
        popularity: media.popularity,
        episodes: media.episodes,
        duration: media.duration,
        type: media.format,
        status: media.status,
        season: media.season?.toLowerCase(),
        year: media.seasonYear,
        start_date: dateString(media.startDate),
        end_date: dateString(media.endDate),
        genres: (media.genres ?? []).map((name, index) => ({ mal_id: index, name })),
        studios: (media.studios?.edges ?? []).map(({ node }) => node),
        synopsis: media.description,
        trailer: media.trailer?.site === 'youtube'
            ? { embed_url: `https://www.youtube-nocookie.com/embed/${media.trailer.id}` }
            : null,
        cast: normalizeAniListCast(media.characters?.edges),
        relations: normalizeAniListRelations(media.relations?.edges),
        recommendations: (media.recommendations?.nodes ?? [])
            .map(({ mediaRecommendation }) => mediaRecommendation)
            .filter((recommendation) => recommendation?.type === 'ANIME')
            .map((recommendation) => ({
                id: recommendation.id,
                mal_id: recommendation.idMal ?? recommendation.id,
                source: 'anilist',
                type: 'anime',
                format: recommendation.format,
                episodes: recommendation.episodes,
                score: recommendation.averageScore
                    ? recommendation.averageScore / 10
                    : null,
                name: recommendation.title?.english ?? recommendation.title?.romaji,
                title_english: recommendation.title?.english,
                title_romaji: recommendation.title?.romaji,
                images: { jpg: { image_url: recommendation.coverImage?.large } },
            })),
    }
}

const animeService = {
    // Homepage feeds use AniList so every row shares the same IDs and data shape.
    getTopAnime: (page = 1, limit = 10) => getAniListAnimeList(`
        query TopAnime($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
                    ${aniListMediaFields}
                }
            }
        }
    `, limit, { page }),

    getTrendingAnime: () => getAniListAnimeList(`
        query TrendingAnime($perPage: Int) {
            Page(perPage: $perPage) {
                media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
                    ${aniListMediaFields}
                }
            }
        }
    `),

    getLatestEpisodes: () => getAniListAnimeList(`
        query LatestAnime($perPage: Int) {
            Page(perPage: $perPage) {
                media(type: ANIME, status: RELEASING, sort: UPDATED_AT_DESC, isAdult: false) {
                    ${aniListMediaFields}
                }
            }
        }
    `),

    getTopUpcomingAnime: () => getAniListAnimeList(`
        query UpcomingAnime($perPage: Int) {
            Page(perPage: $perPage) {
                media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC, isAdult: false) {
                    ${aniListMediaFields}
                }
            }
        }
    `),

    // Anime catalog filters use AniList formats, statuses, and sorting.
    getAnimeList: (page = 1, filters = {}) => getAniListAnimePage(page, filters),

    // Search
    searchAnime: (query, page = 1, filters = {}) =>
        searchAniListAnime(query, page, filters),

    // Single anime details
    getAnimeById: async (id) => {
        const [detailsResult, castResult] = await Promise.allSettled([
            jikan.get(`/anime/${id}/full`),
            jikan.get(`/anime/${id}/characters`),
        ])

        if (detailsResult.status === 'rejected') {
            throw detailsResult.reason
        }

        const detailsResponse = detailsResult.value
        const cast = castResult.status === 'fulfilled'
            ? normalizeJikanCast(castResult.value.data?.data)
            : []

        return {
            ...detailsResponse,
            data: {
                ...detailsResponse.data,
                data: {
                    ...detailsResponse.data.data,
                    cast,
                    castError: castResult.status === 'rejected'
                        ? castResult.reason.message
                        : null,
                },
            },
        }
    },
    getAniListAnimeById: async (id) => {
        const animeId = Number(id)
        if (!Number.isInteger(animeId) || animeId <= 0) {
            throw new Error('AniList anime ID must be a positive integer')
        }

        const data = await fetchAniListMedia(aniListAnimeDetailsQuery, { id: animeId })
        if (!data?.Media) {
            throw new Error(`AniList anime ${animeId} was not found`)
        }

        const anime = normalizeAniListAnime(data.Media)
        anime.relations = await getAniListFranchiseRelations(data.Media)

        return {
            data: { data: anime },
        }
    },
}

export default animeService;