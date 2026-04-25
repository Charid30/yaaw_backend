// src/services/product.service.js
const { Op } = require('sequelize');
const { Product, Category } = require('../models');

// ── Helpers ──────────────────────────────────────────────────

const notFound = (msg = 'Produit introuvable.') => {
  const err = new Error(msg);
  err.status = 404;
  return err;
};

const sanitize = (p) => ({
  id:           p.id,
  nom:          p.nom,
  description:  p.description,
  prix:         parseFloat(p.prix),
  prix_achat:   p.prix_achat !== null ? parseFloat(p.prix_achat) : null,
  categorie_id: p.categorie_id,
  categorie:    p.categorie ? {
    id:      p.categorie.id,
    nom:     p.categorie.nom,
    couleur: p.categorie.couleur,
    icone:   p.categorie.icone,
  } : null,
  shop_id:      p.shop_id,
  stock_qty:    p.stock_qty,
  unite:        p.unite,
  code_barre:   p.code_barre,
  is_active:    p.is_active,
  created_at:   p.created_at,
  updated_at:   p.updated_at,
});

const categoryInclude = {
  model:      Category,
  as:         'categorie',
  attributes: ['id', 'nom', 'couleur', 'icone'],
  required:   false,
};

// ── Service ──────────────────────────────────────────────────

const getAll = async (shop_id, { page = 1, limit = 30, categorie_id, search, is_active } = {}) => {
  const where = { shop_id };

  if (categorie_id) where.categorie_id = categorie_id;
  if (is_active !== undefined && is_active !== '') where.is_active = is_active === 'true' || is_active === true;
  if (search) where.nom = { [Op.like]: `%${search.trim()}%` };

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: [categoryInclude],
    order:   [['created_at', 'DESC']],
    limit:   parseInt(limit),
    offset,
  });

  return {
    products:   rows.map(sanitize),
    total:      count,
    page:       parseInt(page),
    limit:      parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
  };
};

const getById = async (id, shop_id) => {
  const p = await Product.findOne({ where: { id, shop_id }, include: [categoryInclude] });
  if (!p) throw notFound();
  return sanitize(p);
};

const create = async (data, shop_id) => {
  // Vérifier l'unicité du code-barre dans la boutique
  if (data.code_barre) {
    const exists = await Product.findOne({ where: { code_barre: data.code_barre, shop_id } });
    if (exists) {
      const err = new Error('Ce code-barre est déjà utilisé dans votre boutique.');
      err.status = 409;
      throw err;
    }
  }
  const p = await Product.create({ ...data, nom: data.nom.trim(), shop_id });
  const fresh = await Product.findByPk(p.id, { include: [categoryInclude] });
  return sanitize(fresh);
};

const update = async (id, shop_id, data) => {
  const p = await Product.findOne({ where: { id, shop_id } });
  if (!p) throw notFound();

  // Vérifier l'unicité du code-barre si on le change
  if (data.code_barre && data.code_barre !== p.code_barre) {
    const exists = await Product.findOne({
      where: { code_barre: data.code_barre, shop_id, id: { [Op.ne]: id } },
    });
    if (exists) {
      const err = new Error('Ce code-barre est déjà utilisé dans votre boutique.');
      err.status = 409;
      throw err;
    }
  }

  await p.update(data);
  const fresh = await Product.findByPk(id, { include: [categoryInclude] });
  return sanitize(fresh);
};

const remove = async (id, shop_id) => {
  const p = await Product.findOne({ where: { id, shop_id } });
  if (!p) throw notFound();
  await p.destroy();
};

module.exports = { getAll, getById, create, update, remove };
