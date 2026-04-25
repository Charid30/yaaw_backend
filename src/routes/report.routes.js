// src/routes/report.routes.js
const express  = require('express');
const router   = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { attachShop }   = require('../middlewares/shop.middleware');
const ctrl             = require('../controllers/report.controller');

router.use(authenticate);
router.use(attachShop);

router.get('/kpis',     ctrl.getKpis);
router.get('/ca/day',   ctrl.getCaByDay);
router.get('/ca/month', ctrl.getCaByMonth);
router.get('/top',      ctrl.getTopProducts);
router.get('/payments', ctrl.getPaymentBreakdown);
router.get('/recent',   ctrl.getRecentSales);

module.exports = router;
