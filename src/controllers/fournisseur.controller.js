// src/controllers/fournisseur.controller.js
const fournisseurService = require('../services/fournisseur.service');
const { success, error } = require('../utils/response.util');

/** GET /api/suppliers */
const getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await fournisseurService.getFournisseurs(req.shop.id, { page, limit, search });
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** POST /api/suppliers */
const create = async (req, res) => {
  try {
    const fournisseur = await fournisseurService.createFournisseur(req.shop.id, req.body);
    return success(res, { fournisseur }, 'Fournisseur créé.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** PATCH /api/suppliers/:id */
const update = async (req, res) => {
  try {
    const fournisseur = await fournisseurService.updateFournisseur(req.params.id, req.shop.id, req.body);
    return success(res, { fournisseur }, 'Fournisseur mis à jour.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** DELETE /api/suppliers/:id */
const remove = async (req, res) => {
  try {
    await fournisseurService.deleteFournisseur(req.params.id, req.shop.id);
    return success(res, null, 'Fournisseur supprimé.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAll, create, update, remove };
