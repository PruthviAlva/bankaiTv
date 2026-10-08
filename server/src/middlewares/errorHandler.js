// Global error handler — catches all errors passed to next()
const errorHandler = (err, req, res, next) => {
    // Sometimes Express passes a 200 status code with an error, so we check if the status code is 200 and set it to 500
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode)

    console.error(`[ERROR] ${err.message}`)

    if (process.env.NODE_ENV === 'development') {
        console.log(err.stack)
    }

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Only show stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
}

module.exports = errorHandler;