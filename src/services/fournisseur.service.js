// src/services/fournisseur.service.js
const { Op } = require('sequelize');
const { Fournisseur } = require('../models');

// ── Helpers ────────────────────────────────────────────────────

const notFound = (msg = 'Fournisseur introuvable.', status = 404) => {
  const err = new Error(msg);
  err.status = status;
  return err;
};

const sanitize = (f) => ({
  id:         f.id,
  shop_id:    f.shop_id,
  nom:        f.nom,
  telephone:  f.telephone,
  email:      f.email,
  adresse:    f.adresse,
  note:       f.note,
  created_at: f.created_at,
  updated_at: f.updated_at,
});

// ── Service ────────────────────────────────────────────────────

/**
 * Liste paginée des fournisseurs d'une boutique
 */
const getFournisseurs = async (shop_id, { page = 1, limit = 20, search } = {}) => {
  const offset = (page - 1) * limit;

  const where = { shop_id };
  if (search) {
    where[Op.or] = [
      { nom:       { [Op.like]: `%${search}%` } },
      { telephone: { [Op.like]: `%${search}%` } },
      { email:     { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Fournisseur.findAndCountAll({
    where,
    order: [['nom', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  return {
    fournisseurs: rows.map(sanitize),
    pagination: {
      total:      count,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Créer un fournisseur
 */
const createFournisseur = async (shop_id, { nom, telephone, email, adresse, note }) => {
  if (!nom?.trim()) {
    const err = new Error('Le nom du fournisseur est requis.');
    err.status = 400;
    throw err;
  }

  const fournisseur = await Fournisseur.create({
    shop_id,
    nom:       nom.trim(),
    telephone: telephone?.trim() || null,
    email:     email?.trim()     || null,
    adresse:   adresse?.trim()   || null,
    note:      note?.trim()      || null,
  });

  return sanitize(fournisseur);
};

/**
 * Mettre à jour un fournisseur
 */
const updateFournisseur = async (id, shop_id, { nom, telephone, email, adresse, note }) => {
  const fournisseur = await Fournisseur.findOne({ where: { id, shop_id } });
  if (!fournisseur) throw notFound();

  await fournisseur.update({
    nom:       nom?.trim()       ?? fournisseur.nom,
    telephone: telephone?.trim() ?? fournisseur.telephone,
    email:     email?.trim()     ?? fournisseur.email,
    adresse:   adresse?.trim()   ?? fournisseur.adresse,
    note:      note?.trim()      ?? fournisseur.note,
  });

  return sanitize(fournisseur);
};

/**
 * Supprimer un fournisseur
 */
const deleteFournisseur = async (id, shop_id) => {
  const fournisseur = await Fournisseur.findOne({ where: { id, shop_id } });
  if (!fournisseur) throw notFound();
  await fournisseur.destroy();
};

module.exports = { getFournisseurs, createFournisseur, updateFournisseur, deleteFournisseur };
