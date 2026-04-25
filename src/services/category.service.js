// src/services/category.service.js
const { Category, Product } = require('../models');

// ── Helpers ──────────────────────────────────────────────────

const notFound = (msg = 'Catégorie introuvable.') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const sanitize = (cat) => ({
  id:         cat.id,
  nom:        cat.nom,
  couleur:    cat.couleur,
  icone:      cat.icone,
  shop_id:    cat.shop_id,
  created_at: cat.created_at,
  updated_at: cat.updated_at,
});

// ── Service ──────────────────────────────────────────────────

const getAll = async (shop_id) => {
  const cats = await Category.findAll({
    where: { shop_id },
    order: [['nom', 'ASC']],
  });
  return cats.map(sanitize);
};

const getById = async (id, shop_id) => {
  const cat = await Category.findOne({ where: { id, shop_id } });
  if (!cat) throw notFound();
  return sanitize(cat);
};

const create = async ({ nom, couleur, icone }, shop_id) => {
  const cat = await Category.create({ nom: nom.trim(), couleur, icone, shop_id });
  return sanitize(cat);
};

const update = async (id, shop_id, fields) => {
  const cat = await Category.findOne({ where: { id, shop_id } });
  if (!cat) throw notFound();
  await cat.update({
    nom:     fields.nom     ? fields.nom.trim() : cat.nom,
    couleur: fields.couleur ?? cat.couleur,
    icone:   fields.icone   ?? cat.icone,
  });
  return sanitize(cat);
};

const remove = async (id, shop_id) => {
  const cat = await Category.findOne({ where: { id, shop_id } });
  if (!cat) throw notFound();

  // Dissocier les produits avant suppression
  await Product.update({ categorie_id: null }, { where: { categorie_id: id } });
  await cat.destroy();
};

module.exports = { getAll, getById, create, update, remove };
