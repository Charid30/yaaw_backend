// src/controllers/employee.controller.js
const svc = require('../services/employee.service');
const { success, error } = require('../utils/response.util');

const getAll      = async (req, res) => { try { return success(res, { employees: await svc.getEmployees(req.shop.id) }); } catch (e) { return error(res, e.message, e.status || 500); } };
const create      = async (req, res) => { try { return success(res, { employee: await svc.createEmployee(req.shop.id, req.body) }, 'Caissier créé.', 201); } catch (e) { return error(res, e.message, e.status || 500); } };
const update      = async (req, res) => { try { return success(res, { employee: await svc.updateEmployee(req.params.id, req.shop.id, req.body) }, 'Caissier mis à jour.'); } catch (e) { return error(res, e.message, e.status || 500); } };
const toggle      = async (req, res) => { try { return success(res, { employee: await svc.toggleEmployee(req.params.id, req.shop.id) }, 'Statut modifié.'); } catch (e) { return error(res, e.message, e.status || 500); } };
const resetPwd    = async (req, res) => { try { await svc.resetPassword(req.params.id, req.shop.id, req.body.nouveau_mot_de_passe); return success(res, null, 'Mot de passe réinitialisé.'); } catch (e) { return error(res, e.message, e.status || 500); } };
const remove      = async (req, res) => { try { await svc.deleteEmployee(req.params.id, req.shop.id); return success(res, null, 'Caissier supprimé.'); } catch (e) { return error(res, e.message, e.status || 500); } };

module.exports = { getAll, create, update, toggle, resetPwd, remove };
