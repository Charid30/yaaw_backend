// src/services/customer.service.js
const { Op } = require('sequelize');
const { Customer } = require('../models');

// ── Helpers ────────────────────────────────────────────────────

const notFound = (msg = 'Client introuvable.', status = 404) => {
  const err = new Error(msg);
  err.status = status;
  return err;
};

const sanitize = (c) => ({
  id:         c.id,
  shop_id:    c.shop_id,
  nom:        c.nom,
  telephone:  c.telephone,
  email:      c.email,
  note:       c.note,
  created_at: c.created_at,
  updated_at: c.updated_at,
});

// ── Service ────────────────────────────────────────────────────

/**
 * Liste paginée des clients d'une boutique
 */
const getCustomers = async (shop_id, { page = 1, limit = 20, search } = {}) => {
  const offset = (page - 1) * limit;

  const where = { shop_id };
  if (search) {
    where[Op.or] = [
      { nom:       { [Op.like]: `%${search}%` } },
      { telephone: { [Op.like]: `%${search}%` } },
      { email:     { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Customer.findAndCountAll({
    where,
    order: [['nom', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    customers:  rows.map(sanitize),
    pagination: {
      total:      count,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Créer un client
 */
const createCustomer = async (shop_id, { nom, telephone, email, note }) => {
  if (!nom?.trim()) {
    const err = new Error('Le nom du client est requis.');
    err.status = 400;
    throw err;
  }

  const customer = await Customer.create({
    shop_id,
    nom:       nom.trim(),
    telephone: telephone?.trim() || null,
    email:     email?.trim()     || null,
    note:      note?.trim()      || null,
  });

  return sanitize(customer);
};

/**
 * Mettre à jour un client
 */
const updateCustomer = async (id, shop_id, { nom, telephone, email, note }) => {
  const customer = await Customer.findOne({ where: { id, shop_id } });
  if (!customer) throw notFound();

  await customer.update({
    nom:       nom?.trim()       ?? customer.nom,
    telephone: telephone?.trim() ?? customer.telephone,
    email:     email?.trim()     ?? customer.email,
    note:      note?.trim()      ?? customer.note,
  });

  return sanitize(customer);
};

/**
 * Supprimer un client
 */
const deleteCustomer = async (id, shop_id) => {
  const customer = await Customer.findOne({ where: { id, shop_id } });
  if (!customer) throw notFound();
  await customer.destroy();
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
