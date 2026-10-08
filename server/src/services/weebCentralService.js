const axios = require('axios')
const cheerio = require('cheerio')

const BASE_URL = 'https://weebcentral.com'
const COVER_URL = 'https://temp.compsci88.com/cover/fallback'
const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const SERIES_ID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/i
const PAGE_SIZE = 32
const CHAPTER_LIMIT = 100

const requestHeaders = {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: `${BASE_URL}/search`,
}

const fetchHTML = async (path, params) => {
    try {
        const response = await axios.get(`${BASE_URL}${path}`, {
            headers: requestHeaders,
            params,
            timeout: 20000,
            responseType: 'text',
        })
        return response.data
    } catch (error) {
        const upstreamStatus = error.response?.status
        const message = upstreamStatus
            ? `WeebCentral returned HTTP ${upstreamStatus}`
            : `WeebCentral request failed: ${error.message}`
        const requestError = new Error(message)
        requestError.statusCode = 502
        throw requestError
    }
}

const getSeriesId = (href) => href?.match(/\/series\/([0-9A-HJKMNP-TV-Z]{26})/i)?.[1]

const normalizeCoverUrl = (url) => {
    if (!url) return ''
    return url.startsWith('/') ? `${BASE_URL}${url}` : url
}

const parseSearchResults = (html, page) => {
    const $ = cheerio.load(html)
    const resultCards = $('article').filter(
        (_, article) => $(article).find('a[href*="/series/"]').length > 0,
    )
    const items = resultCards
        .map((_, article) => {
            const card = $(article)
            const seriesLink = card.find('a[href*="/series/"]').first()
            const id = getSeriesId(seriesLink.attr('href'))
            if (!id) return null

            const title =
                card.find('.text-ellipsis').first().text().trim() ||
                card.find('img').first().attr('alt')?.replace(/\s+cover$/i, '') ||
                'Untitled'
            const image = normalizeCoverUrl(
                card.find('img').first().attr('src') ||
                    card.find('source[srcset]').first().attr('srcset') ||
                    `${COVER_URL}/${id}.jpg`,
            )
            const readLabel = card.find('[data-tip]').first().attr('data-tip')
            const type =
                readLabel ||
                card
                    .find('strong')
                    .filter((__, label) => $(label).text().trim() === 'Type:')
                    .next('span')
                    .text()
                    .trim()

            return {
                id,
                mal_id: id,
                source: 'weebcentral',
                title,
                title_english: title,
                type: type || 'Manga',
                images: { jpg: { image_url: image, large_image_url: image } },
            }
        })
        .get()
        .filter(Boolean)

    const nextPageUrl = $('button[hx-get]').attr('hx-get') || ''
    const hasNextPage = /offset=\d+/.test(nextPageUrl)

    return {
        data: items,
        pagination: {
            current_page: page,
            last_visible_page: hasNextPage ? page + 1 : page,
            has_next_page: hasNextPage,
        },
    }
}

const makeSearchParams = ({ page, type, status, query }) => {
    const params = {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        sort: query ? 'Best Match' : 'Popularity',
        order: 'Descending',
        official: 'Any',
        anime: 'Any',
        adult: 'Any',
        display_mode: 'Full Display',
    }
    if (type) params.included_type = type
    if (status) params.included_status = status
    if (query) params.text = query
    return params
}

const getMangaList = async (page = 1, filters = {}) => {
    const html = await fetchHTML(
        '/search/data',
        makeSearchParams({ page, ...filters }),
    )
    return parseSearchResults(html, page)
}

const getLabeledElement = ($, label) =>
    $('strong').filter((_, element) => $(element).text().trim() === label).first()

const getLabeledValue = ($, label) => {
    const element = getLabeledElement($, label)
    if (!element.length) return ''

    return element.parent().children().not(element).first().text().trim()
}

const getLabeledLinks = ($, label) => {
    const element = getLabeledElement($, label)
    return element.length
        ? element.parent().find('a').map((_, anchor) => $(anchor).text().trim()).get()
        : []
}

const getRelatedSeries = ($) => {
    const label = getLabeledElement($, 'Related Series(s)')
    if (!label.length) return []

    return label
        .parent()
        .find('a[href*="/series/"]')
        .map((_, anchor) => {
            const href = $(anchor).attr('href')
            const id = getSeriesId(href)
            if (!id) return null

            const title = $(anchor).text().trim()
            const image = `${COVER_URL}/${id}.jpg`
            return {
                id,
                mal_id: id,
                source: 'weebcentral',
                title,
                title_english: title,
                type: 'Manga',
                images: { jpg: { image_url: image, large_image_url: image } },
            }
        })
        .get()
        .filter(Boolean)
}

const parseChapters = (html) => {
    const $ = cheerio.load(html)
    const chapters = $('a[href^="/chapters/"]')
        .map((_, anchor) => {
            const link = $(anchor)
            const title = link.find('span.grow > span').first().text().trim()
            const id = link.attr('href')?.split('/').pop()
            if (!id || !title) return null

            return {
                id,
                title,
                publishedAt: link.find('time[datetime]').attr('datetime') || null,
            }
        })
        .get()
        .filter(Boolean)

    return { chapters: chapters.slice(0, CHAPTER_LIMIT), total: chapters.length }
}

const getMangaById = async (id) => {
    if (!SERIES_ID_PATTERN.test(id)) {
        const error = new Error('Invalid WeebCentral manga ID')
        error.statusCode = 400
        throw error
    }

    const html = await fetchHTML(`/series/${id}`)
    const $ = cheerio.load(html)
    const title =
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content')?.replace(/\s+\|\s+Weeb Central$/, '') ||
        'Untitled'
    const cover = normalizeCoverUrl($('meta[property="og:image"]').attr('content'))
    const description = getLabeledElement($, 'Description')
        .next('p')
        .text()
        .trim()
    const genres =
        getLabeledLinks($, 'Tags(s):').length > 0
            ? getLabeledLinks($, 'Tags(s):')
            : getLabeledLinks($, 'Tag(s):')
    const year = getLabeledValue($, 'Released:')
    const related = getRelatedSeries($)
    const chaptersHTML = await fetchHTML(`/series/${id}/full-chapter-list`)
    const chapterData = parseChapters(chaptersHTML)

    return {
        id,
        mal_id: id,
        source: 'weebcentral',
        title,
        title_english: title,
        title_native: '',
        type: getLabeledValue($, 'Type:') || 'Manga',
        status: getLabeledValue($, 'Status:'),
        year: Number(year) || null,
        score: null,
        synopsis: description,
        images: { jpg: { image_url: cover, large_image_url: cover } },
        genres: genres.map((name, index) => ({ mal_id: index, name })),
        authors: getLabeledLinks($, 'Author(s):').map((name) => ({ name })),
        relations: related,
        chapters: chapterData.chapters,
        chaptersTotal: chapterData.total,
        chaptersTruncated: chapterData.total > CHAPTER_LIMIT,
    }
}

module.exports = { getMangaById, getMangaList }
