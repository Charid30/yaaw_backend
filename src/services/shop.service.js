// src/services/shop.service.js
const { Shop } = require('../models');

// ── Helpers ───────────────────────────────────────────────────

const sanitize = (shop) => ({
  id:            shop.id,
  nom:           shop.nom,
  type_commerce: shop.type_commerce,
  devise:        shop.devise,
  tva_enabled:   shop.tva_enabled,
  tva_rate:      parseFloat(shop.tva_rate),
  modules:       shop.modules,
  owner_id:      shop.owner_id,
  is_configured: shop.is_configured,
  created_at:    shop.created_at,
  updated_at:    shop.updated_at,
});

const notFound = (msg = 'Boutique introuvable.', status = 404) => {
  const err = new Error(msg);
  err.status = status;
  return err;
};

// ── Service ───────────────────────────────────────────────────

/**
 * Crée la boutique d'un gérant (une seule boutique par gérant)
 */
const createShop = async (
  { nom, type_commerce, devise, tva_enabled, tva_rate, modules },
  owner_id
) => {
  const existing = await Shop.findOne({ where: { owner_id } });
  if (existing) throw notFound('Vous avez déjà une boutique configurée.', 409);

  const shop = await Shop.create({
    nom:           nom.trim(),
    type_commerce,
    devise:        devise    ?? 'FCFA',
    tva_enabled:   tva_enabled ?? false,
    tva_rate:      tva_rate  ?? 18,
    modules:       modules   ?? { stock: true, commandes: false, rapports: true },
    owner_id,
    is_configured: true,
  });

  return sanitize(shop);
};

/**
 * Récupère la boutique du gérant connecté
 */
const getMyShop = async (owner_id) => {
  const shop = await Shop.findOne({ where: { owner_id } });
  if (!shop) throw notFound('Aucune boutique configurée pour ce compte.');
  return sanitize(shop);
};

const getShopById = async (shopId) => {
  const shop = await Shop.findByPk(shopId);
  if (!shop) throw notFound('Boutique introuvable.');
  return sanitize(shop);
};

/**
 * Toutes les boutiques — ADMIN uniquement
 */
const getAllShops = async () => {
  const shops = await Shop.findAll({ order: [['created_at', 'DESC']] });
  return shops.map(sanitize);
};

/**
 * Mise à jour de la boutique
 */
const updateShop = async (owner_id, updates) => {
  const shop = await Shop.findOne({ where: { owner_id } });
  if (!shop) throw notFound('Boutique introuvable.');

  await shop.update({
    nom:         updates.nom         ?? shop.nom,
    devise:      updates.devise      ?? shop.devise,
    tva_enabled: updates.tva_enabled ?? shop.tva_enabled,
    tva_rate:    updates.tva_rate    ?? shop.tva_rate,
    modules:     updates.modules     ?? shop.modules,
  });

  return sanitize(shop);
};

module.exports = { createShop, getMyShop, getShopById, getAllShops, updateShop };
