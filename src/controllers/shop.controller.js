// src/controllers/shop.controller.js
const shopService = require('../services/shop.service');
const { success, error } = require('../utils/response.util');

/**
 * POST /api/shops
 * Créer la boutique du gérant connecté
 */
const create = async (req, res) => {
  try {
    const shop = await shopService.createShop(req.body, req.user.id);
    return success(res, { shop }, 'Boutique créée avec succès.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * GET /api/shops/mine
 * Ma boutique (gérant ou admin)
 */
const getMyShop = async (req, res) => {
  try {
    const shop = await shopService.getMyShop(req.user.id);
    return success(res, { shop }, 'Boutique récupérée.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * GET /api/shops
 * Toutes les boutiques — ADMIN uniquement
 */
const getAll = async (req, res) => {
  try {
    const shops = await shopService.getAllShops();
    return success(res, { shops }, `${shops.length} boutique(s) trouvée(s).`);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * PATCH /api/shops/mine
 * Mettre à jour sa boutique
 */
const update = async (req, res) => {
  try {
    const shop = await shopService.updateShop(req.user.id, req.body);
    return success(res, { shop }, 'Boutique mise à jour.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { create, getMyShop, getAll, update };
