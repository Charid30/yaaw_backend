// src/routes/employee.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { attachShop }              = require('../middlewares/shop.middleware');

router.use(authenticate, authorize(['GERANT', 'ADMIN']), attachShop);

router.get('/',               ctrl.getAll);
router.post('/',              ctrl.create);
router.patch('/:id',          ctrl.update);
router.patch('/:id/toggle',   ctrl.toggle);
router.patch('/:id/password', ctrl.resetPwd);
router.delete('/:id',         ctrl.remove);

module.exports = router;
