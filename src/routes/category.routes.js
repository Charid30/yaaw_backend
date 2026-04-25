// src/routes/category.routes.js
const express = require('express');
const router  = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { attachShop }              = require('../middlewares/shop.middleware');
const validate                    = require('../middlewares/validate.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');
const ctrl = require('../controllers/category.controller');

// Tous les accès nécessitent un compte connecté + une boutique
router.use(authenticate, authorize(['ADMIN', 'GERANT']), attachShop);

router.get('/',        ctrl.getAll);
router.get('/:id',     ctrl.getOne);
router.post('/',       validate(createCategorySchema), ctrl.create);
router.patch('/:id',   validate(updateCategorySchema), ctrl.update);
router.delete('/:id',  ctrl.remove);

module.exports = router;
