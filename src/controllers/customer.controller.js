// src/controllers/customer.controller.js
const customerService = require('../services/customer.service');
const { success, error } = require('../utils/response.util');

/** GET /api/customers */
const getAll = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await customerService.getCustomers(req.shop.id, { page, limit, search });
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** POST /api/customers */
const create = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.shop.id, req.body);
    return success(res, { customer }, 'Client créé.', 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** PATCH /api/customers/:id */
const update = async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.shop.id, req.body);
    return success(res, { customer }, 'Client mis à jour.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

/** DELETE /api/customers/:id */
const remove = async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id, req.shop.id);
    return success(res, null, 'Client supprimé.');
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAll, create, update, remove };
