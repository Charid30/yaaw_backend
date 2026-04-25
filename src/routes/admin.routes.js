// src/routes/admin.routes.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Toutes les routes admin nécessitent auth + rôle ADMIN
router.use(authenticate, authorize(['ADMIN']));

router.get('/overview',            ctrl.overview);
router.get('/shops',               ctrl.getShops);
router.patch('/shops/:id',         ctrl.updateShop);
router.get('/users',               ctrl.getUsers);
router.patch('/users/:id/toggle',  ctrl.toggleUser);
router.post('/gerants',            ctrl.createGerant);
router.delete('/gerants/:id',      ctrl.deleteGerant);
router.get('/activity',            ctrl.getActivity);

module.exports = router;
