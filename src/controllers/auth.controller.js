// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { success, error } = require('../utils/response.util');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { user, token } = await authService.register(req.body);

    // Cookie HttpOnly (sécurisé en production)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8h
    });

    return success(res, { user, token }, 'Compte créé avec succès.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return success(res, { user, token }, 'Connexion réussie.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    await authService.logout(req.token, req.user.id);

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return success(res, null, 'Déconnexion réussie.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * GET /api/auth/me
 */
const me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    return success(res, { user });
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { register, login, logout, me };
