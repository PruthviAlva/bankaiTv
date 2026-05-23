const express = require('express');
const cors = require('cors');

const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL, // Only allow your frontend
    credentials: true,              // Allow cookies/auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}))

// ─── Routes ────────────────────────
app.use('/api/health', healthRoutes)

// ─── Error Handling ─────
app.use(errorHandler)

module.exports = app;