// src/controllers/product.controller.js
const productService = require('../services/product.service');
const { success, error, paginate } = require('../utils/response.util');

const getAll = async (req, res) => {
  try {
    const { page, limit, categorie_id, search, is_active } = req.query;
    const result = await productService.getAll(req.shop.id, { page, limit, categorie_id, search, is_active });
    return paginate(
      res,
      result.products,
      result.page,
      result.limit,
      result.total,
      `${result.total} produit(s) trouvé(s).`
    );
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const getOne = async (req, res) => {
  try {
    const product = await productService.getById(req.params.id, req.shop.id);
    return success(res, { product });
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const create = async (req, res) => {
  try {
    const product = await productService.create(req.body, req.shop.id);
    return success(res, { product }, 'Produit créé.', 201);
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const product = await productService.update(req.params.id, req.shop.id, req.body);
    return success(res, { product }, 'Produit mis à jour.');
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await productService.remove(req.params.id, req.shop.id);
    return success(res, null, 'Produit supprimé.');
  } catch (err) { return error(res, err.message, err.status || 500); }
};

module.exports = { getAll, getOne, create, update, remove };
