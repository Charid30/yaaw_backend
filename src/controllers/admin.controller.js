// src/controllers/admin.controller.js
const adminService = require('../services/admin.service');
const { success, error } = require('../utils/response.util');

/** GET /api/admin/overview */
const overview = async (req, res) => {
  try {
    const data = await adminService.getOverview();
    return success(res, data);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** GET /api/admin/shops */
const getShops = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await adminService.getShops({ page, limit, search });
    return success(res, data);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** PATCH /api/admin/shops/:id */
const updateShop = async (req, res) => {
  try {
    const shop = await adminService.updateShopModules(req.params.id, req.body);
    return success(res, { shop }, 'Boutique mise à jour.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** GET /api/admin/users */
const getUsers = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const data = await adminService.getUsers({ page, limit, search });
    return success(res, data);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** PATCH /api/admin/users/:id/toggle */
const toggleUser = async (req, res) => {
  try {
    const result = await adminService.toggleUser(req.params.id);
    return success(res, result, result.is_active ? 'Compte activé.' : 'Compte désactivé.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** GET /api/admin/activity */
const getActivity = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await adminService.getActivity({ page, limit });
    return success(res, data);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { overview, getShops, updateShop, getUsers, toggleUser, getActivity };
