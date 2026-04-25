// src/routes/sale.routes.js
const express = require('express');
const router  = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { attachShop }              = require('../middlewares/shop.middleware');
const validate                    = require('../middlewares/validate.middleware');
const { createSaleSchema }        = require('../validators/sale.validator');
const { create, getAll, getOne }  = require('../controllers/sale.controller');

// Tous les accès nécessitent une session + boutique
router.use(authenticate, authorize(['ADMIN', 'GERANT', 'CAISSIER']), attachShop);

router.post('/',    validate(createSaleSchema), create);
router.get('/',     getAll);
router.get('/:id',  getOne);

module.exports = router;
