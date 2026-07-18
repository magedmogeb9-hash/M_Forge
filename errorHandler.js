/**
 * Centralized Express error handler. Register this AFTER all routes.
 * Any error passed to next(err) — including ones caught by asyncHandler —
 * ends up here instead of crashing the process or hanging the request.
 */
function errorHandler(err, req, res, next) {
    console.error("❌ Request error:", err.message);

    // Mongoose bad ObjectId / cast errors → 400 instead of 500
    if (err.name === "CastError") {
        return res.status(400).json({ error: `Invalid value for ${err.path}` });
    }

    // Mongoose validation errors → 400 with details
    if (err.name === "ValidationError") {
        const details = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ error: "Validation failed", details });
    }

    // Known Stripe/DHL config errors thrown intentionally with .message
    if (err.status) {
        return res.status(err.status).json({ error: err.message });
    }

    res.status(500).json({ error: "Internal server error" });
}

function notFound(req, res) {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
