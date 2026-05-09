/**
 * Route Aggregator
 * ────────────────
 * Mounts all route modules on the Express app.
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const tripRoutes = require('./trip.routes');
const locationRoutes = require('./location.routes');

router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/location', locationRoutes);

module.exports = router;
