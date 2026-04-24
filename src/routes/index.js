// src/routes/index.js
const express = require('express');
const router = express.Router();

// ── Routes ───────────────────────────────────────────────────
const authRoutes = require('./auth.routes');

// ── Montage ──────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Healthcheck ──────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API YAAHW fonctionne correctement.',
    version: '0.2.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
