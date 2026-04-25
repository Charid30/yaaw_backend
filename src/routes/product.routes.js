// src/routes/product.routes.js
const express = require('express');
const router  = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { attachShop }              = require('../middlewares/shop.middleware');
const validate                    = require('../middlewares/validate.middleware');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const ctrl = require('../controllers/product.controller');

// Tous les accès nécessitent un compte connecté + une boutique
router.use(authenticate, authorize(['ADMIN', 'GERANT', 'CAISSIER']), attachShop);

router.get('/',       ctrl.getAll);
router.get('/:id',    ctrl.getOne);

// Création/modification réservées aux GÉRANT et ADMIN
router.post('/',
  authorize(['ADMIN', 'GERANT']),
  validate(createProductSchema),
  ctrl.create
);
router.patch('/:id',
  authorize(['ADMIN', 'GERANT']),
  validate(updateProductSchema),
  ctrl.update
);
router.delete('/:id',
  authorize(['ADMIN', 'GERANT']),
  ctrl.remove
);

module.exports = router;
