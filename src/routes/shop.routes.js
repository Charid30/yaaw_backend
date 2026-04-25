// src/routes/shop.routes.js
const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createShopSchema } = require('../validators/shop.validator');
const { create, getMyShop, getAll, update } = require('../controllers/shop.controller');

// ── Routes ────────────────────────────────────────────────────

// POST /api/shops — Créer sa boutique (GÉRANT uniquement)
router.post(
  '/',
  authenticate,
  authorize('GERANT'),
  validate(createShopSchema),
  create
);

// GET /api/shops/mine — Récupérer sa boutique (authentifié)
router.get('/mine', authenticate, getMyShop);

// PATCH /api/shops/mine — Mettre à jour sa boutique (GÉRANT)
router.patch(
  '/mine',
  authenticate,
  authorize('GERANT'),
  update
);

// GET /api/shops — Toutes les boutiques (ADMIN)
router.get('/', authenticate, authorize('ADMIN'), getAll);

module.exports = router;
