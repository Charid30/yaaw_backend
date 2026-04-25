// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const env = require('../config/env');

// POST /api/auth/register  (désactivé par défaut ; l'admin crée les comptes)
router.post('/register', (req, res, next) => {
  if (!env.ALLOW_PUBLIC_REGISTER) {
    return res.status(403).json({
      success: false,
      message: 'L\'inscription publique est désactivée. Contactez l\'administrateur.',
    });
  }
  next();
}, validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/logout  (protégé)
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me  (protégé)
router.get('/me', authenticate, authController.me);

// PATCH /api/auth/password  (protégé)
router.patch('/password', authenticate, authController.changePassword);

module.exports = router;
