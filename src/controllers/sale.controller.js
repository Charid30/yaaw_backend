// src/controllers/sale.controller.js
const saleService = require('../services/sale.service');
const { success, error, paginate } = require('../utils/response.util');

/**
 * POST /api/sales — Enregistrer une vente
 */
const create = async (req, res) => {
  try {
    const sale = await saleService.createSale(req.body, req.shop.id, req.user.id);
    return success(res, { sale }, 'Vente enregistrée avec succès.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * GET /api/sales — Historique des ventes
 */
const getAll = async (req, res) => {
  try {
    const { page, limit, date_debut, date_fin, mode_paiement, customer_id, search } = req.query;
    const result = await saleService.getSales(req.shop.id, { page, limit, date_debut, date_fin, mode_paiement, customer_id, search });
    return paginate(res, result.sales, result.page, result.limit, result.total, `${result.total} vente(s).`);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/**
 * GET /api/sales/:id — Détail d'une vente
 */
const getOne = async (req, res) => {
  try {
    const sale = await saleService.getSaleById(req.params.id, req.shop.id);
    return success(res, { sale });
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { create, getAll, getOne };
