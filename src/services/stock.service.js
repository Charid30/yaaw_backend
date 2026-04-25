// src/services/stock.service.js
const { Product, StockMovement, Category, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// ── Helpers ──────────────────────────────────────────────────

const productInclude = [
  { model: Category, as: 'categorie', attributes: ['id', 'nom', 'couleur', 'icone'] },
];

const userInclude = [
  { model: User, as: 'user', attributes: ['id', 'prenom', 'nom'], required: false },
];

// ── 1. Entrée de stock ────────────────────────────────────────

async function addStock({ shop_id, product_id, quantite, motif, user_id }) {
  if (!Number.isInteger(quantite) || quantite <= 0)
    throw { status: 400, message: 'La quantité doit être un entier positif.' };

  return sequelize.transaction(async (t) => {
    const product = await Product.findOne({
      where: { id: product_id, shop_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!product) throw { status: 404, message: 'Produit introuvable.' };

    const stock_avant = product.stock_qty;
    const stock_apres = stock_avant + quantite;

    await product.update({ stock_qty: stock_apres }, { transaction: t });

    const movement = await StockMovement.create({
      shop_id,
      product_id,
      type: 'entree',
      quantite,
      stock_avant,
      stock_apres,
      motif: motif || null,
      user_id: user_id || null,
    }, { transaction: t });

    return { product, movement };
  });
}

// ── 2. Sortie de stock ────────────────────────────────────────

async function removeStock({ shop_id, product_id, quantite, motif, user_id }) {
  if (!Number.isInteger(quantite) || quantite <= 0)
    throw { status: 400, message: 'La quantité doit être un entier positif.' };

  return sequelize.transaction(async (t) => {
    const product = await Product.findOne({
      where: { id: product_id, shop_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!product) throw { status: 404, message: 'Produit introuvable.' };

    if (product.stock_qty < quantite)
      throw { status: 400, message: `Stock insuffisant (disponible : ${product.stock_qty}).` };

    const stock_avant = product.stock_qty;
    const stock_apres = stock_avant - quantite;

    await product.update({ stock_qty: stock_apres }, { transaction: t });

    const movement = await StockMovement.create({
      shop_id,
      product_id,
      type: 'sortie',
      quantite,
      stock_avant,
      stock_apres,
      motif: motif || null,
      user_id: user_id || null,
    }, { transaction: t });

    return { product, movement };
  });
}

// ── 3. Ajustement (inventaire) ────────────────────────────────

async function adjustStock({ shop_id, product_id, new_qty, motif, user_id }) {
  if (!Number.isInteger(new_qty) || new_qty < 0)
    throw { status: 400, message: 'La nouvelle quantité doit être un entier ≥ 0.' };

  return sequelize.transaction(async (t) => {
    const product = await Product.findOne({
      where: { id: product_id, shop_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!product) throw { status: 404, message: 'Produit introuvable.' };

    const stock_avant = product.stock_qty;
    const delta = new_qty - stock_avant;

    await product.update({ stock_qty: new_qty }, { transaction: t });

    const movement = await StockMovement.create({
      shop_id,
      product_id,
      type: 'ajustement',
      quantite: Math.abs(delta),
      stock_avant,
      stock_apres: new_qty,
      motif: motif || 'Ajustement inventaire',
      user_id: user_id || null,
    }, { transaction: t });

    return { product, movement };
  });
}

// ── 4. Historique des mouvements ──────────────────────────────

async function getMovements({ shop_id, product_id, type, page = 1, limit = 30 }) {
  const where = { shop_id };
  if (product_id) where.product_id = product_id;
  if (type) where.type = type;

  const offset = (page - 1) * limit;

  const { rows, count } = await StockMovement.findAndCountAll({
    where,
    include: [
      { model: Product, as: 'product', attributes: ['id', 'nom', 'unite'], include: productInclude },
      ...userInclude,
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

// ── 5. Produits avec stock faible ─────────────────────────────

async function getLowStock({ shop_id, threshold = 5 }) {
  const products = await Product.findAll({
    where: {
      shop_id,
      is_active: true,
      stock_qty: { [Op.lte]: threshold },
    },
    include: productInclude,
    order: [['stock_qty', 'ASC']],
  });
  return products;
}

// ── 6. Résumé stock ───────────────────────────────────────────

async function getStockSummary({ shop_id }) {
  const products = await Product.findAll({
    where: { shop_id, is_active: true },
    attributes: ['id', 'nom', 'stock_qty', 'prix', 'prix_achat', 'unite'],
    include: productInclude,
    order: [['nom', 'ASC']],
  });

  const totalProducts = products.length;
  const outOfStock    = products.filter(p => p.stock_qty === 0).length;
  const lowStock      = products.filter(p => p.stock_qty > 0 && p.stock_qty <= 5).length;
  const stockValue    = products.reduce((sum, p) => sum + (p.prix_achat ?? p.prix) * p.stock_qty, 0);
  const saleValue     = products.reduce((sum, p) => sum + p.prix * p.stock_qty, 0);

  return {
    totalProducts,
    outOfStock,
    lowStock,
    stockValue: parseFloat(stockValue.toFixed(2)),
    saleValue:  parseFloat(saleValue.toFixed(2)),
    products,
  };
}

module.exports = { addStock, removeStock, adjustStock, getMovements, getLowStock, getStockSummary };
