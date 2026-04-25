// src/controllers/category.controller.js
const catService = require('../services/category.service');
const { success, error } = require('../utils/response.util');

const getAll = async (req, res) => {
  try {
    const cats = await catService.getAll(req.shop.id);
    return success(res, { categories: cats }, `${cats.length} catégorie(s) trouvée(s).`);
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const getOne = async (req, res) => {
  try {
    const cat = await catService.getById(req.params.id, req.shop.id);
    return success(res, { category: cat });
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const create = async (req, res) => {
  try {
    const cat = await catService.create(req.body, req.shop.id);
    return success(res, { category: cat }, 'Catégorie créée.', 201);
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const update = async (req, res) => {
  try {
    const cat = await catService.update(req.params.id, req.shop.id, req.body);
    return success(res, { category: cat }, 'Catégorie mise à jour.');
  } catch (err) { return error(res, err.message, err.status || 500); }
};

const remove = async (req, res) => {
  try {
    await catService.remove(req.params.id, req.shop.id);
    return success(res, null, 'Catégorie supprimée.');
  } catch (err) { return error(res, err.message, err.status || 500); }
};

module.exports = { getAll, getOne, create, update, remove };
