// src/routes/index.js
const express = require('express');
const router = express.Router();

// ── Routes ───────────────────────────────────────────────────
const authRoutes     = require('./auth.routes');
const shopRoutes     = require('./shop.routes');
const categoryRoutes = require('./category.routes');
const productRoutes  = require('./product.routes');
const saleRoutes     = require('./sale.routes');
const stockRoutes    = require('./stock.routes');
const reportRoutes   = require('./report.routes');
const customerRoutes      = require('./customer.routes');
const employeeRoutes      = require('./employee.routes');
const fournisseurRoutes   = require('./fournisseur.routes');
const adminRoutes         = require('./admin.routes');

// ── Montage ──────────────────────────────────────────────────
router.use('/auth',       authRoutes);
router.use('/shops',      shopRoutes);
router.use('/categories', categoryRoutes);
router.use('/products',   productRoutes);
router.use('/sales',      saleRoutes);
router.use('/stock',      stockRoutes);
router.use('/reports',    reportRoutes);
router.use('/customers',   customerRoutes);
router.use('/employees',   employeeRoutes);
router.use('/suppliers',   fournisseurRoutes);
router.use('/admin',       adminRoutes);

// ── Healthcheck ──────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API YAAHW fonctionne correctement.',
    version: '0.11.0',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
