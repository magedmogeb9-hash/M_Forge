/**
 * Wraps an async Express route handler so any rejected promise (e.g. a
 * failed DB call) is forwarded to next(err) and handled by the central
 * error-handling middleware, instead of becoming an unhandled promise
 * rejection that can crash or hang the process.
 *
 * Usage: router.get("/", asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
    return function wrapped(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = asyncHandler;
