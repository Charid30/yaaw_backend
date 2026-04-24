// src/routes/index.js
const express = require('express');
const router = express.Router();

// ─────────────────────────────────────────────────
// IMPORTER LES ROUTES
// ─────────────────────────────────────────────────
// const authRoutes = require('./auth.routes');
// const productRoutes = require('./product.routes');

// ─────────────────────────────────────────────────
// MONTER LES ROUTES
// ─────────────────────────────────────────────────
// router.use('/auth', authRoutes);
// router.use('/products', productRoutes);

// Healthcheck
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API YAAHW fonctionne correctement',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
