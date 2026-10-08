const express = require('express')
const { getMangaById, getMangaList } = require('../services/weebCentralService')

const router = express.Router()
const VALID_TYPES = new Set(['Manga', 'Manhwa', 'Manhua', 'OEL'])
const VALID_STATUSES = new Set(['Ongoing', 'Complete'])

const parsePage = (value) => {
    const page = Number(value || 1)
    if (!Number.isInteger(page) || page < 1 || page > 1000) {
        const error = new Error('Page must be an integer between 1 and 1000')
        error.statusCode = 400
        throw error
    }
    return page
}

const parseFilters = (query) => {
    const type = query.type ? String(query.type) : ''
    const status = query.status ? String(query.status) : ''

    if (type && !VALID_TYPES.has(type)) {
        const error = new Error('Unsupported manga type')
        error.statusCode = 400
        throw error
    }
    if (status && !VALID_STATUSES.has(status)) {
        const error = new Error('Unsupported manga status')
        error.statusCode = 400
        throw error
    }

    return { type, status }
}

router.get('/search', async (req, res, next) => {
    try {
        const query = String(req.query.q || '').trim()
        if (query.length < 2 || query.length > 120) {
            return res.status(400).json({
                success: false,
                message: 'Search query must contain between 2 and 120 characters',
            })
        }

        const result = await getMangaList(parsePage(req.query.page), {
            ...parseFilters(req.query),
            query,
        })
        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

router.get('/', async (req, res, next) => {
    try {
        const result = await getMangaList(
            parsePage(req.query.page),
            parseFilters(req.query),
        )
        return res.json(result)
    } catch (error) {
        return next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const manga = await getMangaById(req.params.id)
        return res.json({ data: manga })
    } catch (error) {
        return next(error)
    }
})

module.exports = router
