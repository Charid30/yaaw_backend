// src/routes/fournisseur.routes.js
const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/fournisseur.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { attachShop }              = require('../middlewares/shop.middleware');

// Toutes les routes nécessitent auth + shop lié
router.use(authenticate, attachShop);

router.get('/',      ctrl.getAll);
router.post('/',     authorize(['GERANT', 'ADMIN']), ctrl.create);
router.patch('/:id', authorize(['GERANT', 'ADMIN']), ctrl.update);
router.delete('/:id', authorize(['GERANT', 'ADMIN']), ctrl.remove);

module.exports = router;
