// src/services/sale.service.js
const { Op } = require('sequelize');
const { sequelize, Sale, SaleItem, Product, Shop, StockMovement, Customer } = require('../models');

// ── Helpers ──────────────────────────────────────────────────

const sanitizeSale = (sale) => {
  const rawNom = sale.dataValues?.customer_nom ?? sale.customer_nom ?? null;
  return {
  id:              sale.id,
  shop_id:         sale.shop_id,
  caissier_id:     sale.caissier_id,
  customer_id:     sale.customer_id,
  customer_nom:    rawNom,
  customer: (() => {
    if (sale.customer) return { id: sale.customer.id, nom: sale.customer.nom };
    return rawNom ? { id: null, nom: rawNom } : null;
  })(),
  remise_montant:  parseFloat(sale.remise_montant ?? 0),
  montant_total:   parseFloat(sale.montant_total),
  montant_recu:    parseFloat(sale.montant_recu),
  monnaie_rendue:  parseFloat(sale.monnaie_rendue),
  mode_paiement:   sale.mode_paiement,
  tva_montant:     parseFloat(sale.tva_montant),
  note:            sale.note,
  items:           (sale.items || []).map(sanitizeItem),
  created_at:      sale.created_at,
  updated_at:      sale.updated_at,
  };
};

const sanitizeItem = (item) => ({
  id:            item.id,
  sale_id:       item.sale_id,
  product_id:    item.product_id,
  nom_produit:   item.nom_produit,
  prix_unitaire: parseFloat(item.prix_unitaire),
  quantite:      item.quantite,
  montant:       parseFloat(item.montant),
});

// ── Service ──────────────────────────────────────────────────

/**
 * Créer une vente avec décrément de stock atomique
 */
const createSale = async ({ items, mode_paiement, montant_recu, note, customer_id, customer_nom, remise_montant = 0 }, shop_id, caissier_id) => {
  // Vérifier que le client appartient bien à cette boutique
  if (customer_id) {
    const cust = await Customer.findOne({ where: { id: customer_id, shop_id } });
    if (!cust) customer_id = null; // client invalide → on ignore
  }
  // 1. Récupérer la boutique pour la TVA
  const shop = await Shop.findByPk(shop_id);
  const tvaRate = shop?.tva_enabled ? parseFloat(shop.tva_rate) / 100 : 0;

  // 2. Vérifier les produits et le stock
  const enrichedItems = [];
  for (const item of items) {
    const product = await Product.findOne({
      where: { id: item.product_id, shop_id, is_active: true },
    });

    if (!product) {
      const err = new Error(`Produit introuvable ou inactif.`);
      err.status = 404;
      throw err;
    }
    if (product.stock_qty < item.quantite) {
      const err = new Error(
        `Stock insuffisant pour « ${product.nom} » — disponible : ${product.stock_qty} ${product.unite}.`
      );
      err.status = 422;
      throw err;
    }

    enrichedItems.push({
      product_id:    product.id,
      nom_produit:   product.nom,
      prix_unitaire: parseFloat(product.prix),
      quantite:      item.quantite,
      montant:       parseFloat(product.prix) * item.quantite,
    });
  }

  // 3. Calculer les totaux
  const sousTotal        = enrichedItems.reduce((sum, i) => sum + i.montant, 0);
  const remise           = Math.min(Math.max(parseFloat(remise_montant) || 0, 0), sousTotal);
  const baseApresRemise  = parseFloat((sousTotal - remise).toFixed(2));
  const tva_montant      = parseFloat((baseApresRemise * tvaRate).toFixed(2));
  const montant_total    = parseFloat((baseApresRemise + tva_montant).toFixed(2));
  const monnaie_rendue   = mode_paiement === 'especes'
    ? parseFloat(Math.max(0, montant_recu - montant_total).toFixed(2))
    : 0;

  if (mode_paiement === 'especes' && montant_recu < montant_total) {
    const err = new Error(
      `Montant insuffisant — total : ${montant_total}, reçu : ${montant_recu}.`
    );
    err.status = 422;
    throw err;
  }

  // 4. Transaction atomique
  const sale = await sequelize.transaction(async (t) => {
    const newSale = await Sale.create(
      {
        shop_id, caissier_id,
        customer_id:  customer_id  || null,
        customer_nom: customer_id  ? null : (customer_nom?.trim() || null), // nom libre seulement si pas de client DB
        remise_montant: remise, montant_total, montant_recu, monnaie_rendue, mode_paiement, tva_montant,
        note: note || null,
      },
      { transaction: t }
    );

    await SaleItem.bulkCreate(
      enrichedItems.map(i => ({ ...i, sale_id: newSale.id })),
      { transaction: t }
    );

    // Décrémenter le stock + traçabilité
    for (const item of enrichedItems) {
      const prod = await Product.findByPk(item.product_id, { transaction: t, lock: t.LOCK.UPDATE });
      const stock_avant = prod.stock_qty;
      const stock_apres = stock_avant - item.quantite;

      await prod.update({ stock_qty: stock_apres }, { transaction: t });

      await StockMovement.create({
        shop_id,
        product_id:  item.product_id,
        type:        'vente',
        quantite:    item.quantite,
        stock_avant,
        stock_apres,
        motif:       `Vente #${newSale.id.substring(0, 8)}`,
        user_id:     caissier_id,
        sale_id:     newSale.id,
      }, { transaction: t });
    }

    return newSale;
  });

  // 5. Retourner la vente complète
  const full = await Sale.findByPk(sale.id, {
    include: [
      { model: SaleItem, as: 'items' },
      { model: Customer, as: 'customer', required: false, attributes: ['id', 'nom'] },
    ],
  });
  return sanitizeSale(full);
};

/**
 * Historique des ventes (paginé)
 */
const getSales = async (shop_id, { page = 1, limit = 20, date_debut, date_fin, mode_paiement, customer_id, search } = {}) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = { shop_id };
  if (mode_paiement) where.mode_paiement = mode_paiement;
  if (customer_id)   where.customer_id   = customer_id;
  if (date_debut || date_fin) {
    where.created_at = {};
    if (date_debut) where.created_at[Op.gte] = new Date(date_debut);
    if (date_fin) {
      const fin = new Date(date_fin);
      fin.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = fin;
    }
  }

  // Recherche textuelle : filtre sur le nom du client OU le nom d'un produit dans les items
  const includeCustomer = {
    model:      Customer,
    as:         'customer',
    required:   false,
    attributes: ['id', 'nom'],
    ...(search ? { where: { nom: { [Op.like]: `%${search}%` } } } : {}),
  };
  const includeItems = {
    model:      SaleItem,
    as:         'items',
    ...(search ? { where: { nom_produit: { [Op.like]: `%${search}%` } } } : {}),
    required:   !!search, // INNER JOIN si search, LEFT JOIN sinon
  };

  // Quand on cherche, on veut les ventes qui matchent SOIT par client SOIT par produit
  const findOpts = {
    where,
    order:  [['created_at', 'DESC']],
    limit:  parseInt(limit),
    offset,
    distinct: true,
  };

  if (search) {
    // Sous-requête : IDs de ventes qui ont un item avec ce nom
    const itemMatches = await SaleItem.findAll({
      where: { nom_produit: { [Op.like]: `%${search}%` } },
      attributes: ['sale_id'],
      raw: true,
    });
    const saleIdsFromItems = itemMatches.map(i => i.sale_id);

    // Sous-requête : IDs de ventes dont le client a ce nom
    const custMatches = await Customer.findAll({
      where: { nom: { [Op.like]: `%${search}%` }, shop_id },
      attributes: ['id'],
      raw: true,
    });
    const custIds = custMatches.map(c => c.id);
    const saleIdsFromCustomers = custIds.length ? await Sale.findAll({
      where: { shop_id, customer_id: { [Op.in]: custIds } },
      attributes: ['id'],
      raw: true,
    }).then(r => r.map(s => s.id)) : [];

    const matchingIds = [...new Set([...saleIdsFromItems, ...saleIdsFromCustomers])];
    if (matchingIds.length === 0) {
      return { sales: [], total: 0, page: parseInt(page), limit: parseInt(limit), totalPages: 0 };
    }
    findOpts.where = { ...where, id: { [Op.in]: matchingIds } };
  }

  const { count, rows } = await Sale.findAndCountAll({
    ...findOpts,
    include: [
      { model: SaleItem, as: 'items' },
      { model: Customer, as: 'customer', required: false, attributes: ['id', 'nom'] },
    ],
  });
  return {
    sales:      rows.map(sanitizeSale),
    total:      count,
    page:       parseInt(page),
    limit:      parseInt(limit),
    totalPages: Math.ceil(count / parseInt(limit)),
  };
};

/**
 * Détail d'une vente
 */
const getSaleById = async (id, shop_id) => {
  const sale = await Sale.findOne({
    where:   { id, shop_id },
    include: [
      { model: SaleItem, as: 'items' },
      { model: Customer, as: 'customer', required: false, attributes: ['id', 'nom'] },
    ],
  });
  if (!sale) {
    const err = new Error('Vente introuvable.');
    err.status = 404;
    throw err;
  }
  return sanitizeSale(sale);
};

module.exports = { createSale, getSales, getSaleById };
