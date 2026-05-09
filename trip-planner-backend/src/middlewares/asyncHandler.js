/**
 * Async Handler
 * ─────────────
 * Wraps async Express route handlers to automatically
 * catch rejected promises and pass errors to next().
 *
 * Without this, every async handler needs its own try/catch.
 *
 * Usage:
 *   router.get('/trips', asyncHandler(async (req, res) => {
 *     const trips = await Trip.find();
 *     res.json(trips);
 *   }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
