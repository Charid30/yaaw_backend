// src/middlewares/shop.middleware.js
const { Shop } = require('../models');
const { error } = require('../utils/response.util');

/**
 * Attache la boutique du gérant connecté à req.shop.
 * À utiliser APRÈS authenticate sur toutes les routes
 * qui nécessitent un contexte boutique.
 */
const attachShop = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') {
      req.shop = null;
      return next();
    }

    let shop;
    if (req.user.role === 'CAISSIER') {
      if (!req.user.shop_id) {
        return error(res, 'Aucune boutique associée à ce compte caissier.', 403);
      }
      shop = await Shop.findByPk(req.user.shop_id);
    } else {
      shop = await Shop.findOne({ where: { owner_id: req.user.id } });
    }

    if (!shop) {
      return error(res, "Boutique non configurée. Veuillez terminer l'assistant d'installation.", 403);
    }

    req.shop = shop;
    next();
  } catch (err) {
    return error(res, 'Erreur lors de la récupération de la boutique.', 500);
  }
};

module.exports = { attachShop };
