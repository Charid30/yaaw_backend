// src/routes/stock.routes.js
const express    = require('express');
const router     = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { attachShop }              = require('../middlewares/shop.middleware');
const ctrl                        = require('../controllers/stock.controller');

// Toutes les routes stock nécessitent une auth
router.use(authenticate);
router.use(attachShop);

// Lecture — GÉRANT et CAISSIER peuvent consulter
router.get('/summary',   ctrl.getStockSummary);
router.get('/movements', ctrl.getMovements);
router.get('/low',       ctrl.getLowStock);

// Écriture — GÉRANT uniquement (+ ADMIN)
router.post('/entries',     authorize(['GERANT', 'ADMIN']), ctrl.addStock);
router.post('/exits',       authorize(['GERANT', 'ADMIN']), ctrl.removeStock);
router.post('/adjustments', authorize(['GERANT', 'ADMIN']), ctrl.adjustStock);

module.exports = router;
