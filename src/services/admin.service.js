// src/services/admin.service.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize, Shop, User, Sale, SaleItem, Customer } = require('../models');

// ── Overview (KPIs globaux) ───────────────────────────────────

const getOverview = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalShops,
    configuredShops,
    totalGerants,
    activeGerants,
    salesToday,
    caTodayRaw,
    caMonthRaw,
    recentSales,
    shopsByType,
  ] = await Promise.all([
    Shop.count(),
    Shop.count({ where: { is_configured: true } }),
    User.count({ where: { role: 'GERANT' } }),
    User.count({ where: { role: 'GERANT', is_active: true } }),
    Sale.count({ where: { created_at: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
    Sale.sum('montant_total', { where: { created_at: { [Op.gte]: today, [Op.lt]: tomorrow } } }),
    Sale.sum('montant_total', { where: { created_at: { [Op.gte]: firstOfMonth } } }),
    Sale.findAll({
      limit: 8,
      order: [['created_at', 'DESC']],
      include: [
        { model: Shop, as: 'shop', attributes: ['id', 'nom'] },
      ],
      attributes: ['id', 'montant_total', 'mode_paiement', 'created_at', 'shop_id'],
    }),
    sequelize.query(
      `SELECT type_commerce, COUNT(*) AS total FROM shops GROUP BY type_commerce`,
      { type: sequelize.QueryTypes.SELECT }
    ),
  ]);

  return {
    boutiques: {
      total:       totalShops,
      configurees: configuredShops,
    },
    gerants: {
      total:  totalGerants,
      actifs: activeGerants,
    },
    ventes: {
      aujourd_hui: salesToday,
      ca_jour:     parseFloat(caTodayRaw  ?? 0),
      ca_mois:     parseFloat(caMonthRaw  ?? 0),
    },
    recentSales: recentSales.map(s => ({
      id:             s.id,
      shop:           s.shop ? { id: s.shop.id, nom: s.shop.nom } : null,
      montant_total:  parseFloat(s.montant_total),
      mode_paiement:  s.mode_paiement,
      created_at:     s.created_at,
    })),
    shopsByType: shopsByType.map(r => ({ type: r.type_commerce, total: parseInt(r.total) })),
  };
};

// ── Boutiques ────────────────────────────────────────────────

const getShops = async ({ page = 1, limit = 20, search } = {}) => {
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where.nom = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Shop.findAndCountAll({
    where,
    include: [
      { model: User, as: 'owner', attributes: ['id', 'nom', 'prenom', 'telephone', 'is_active'] },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  // Stats ventes par boutique
  const shopIds = rows.map(s => s.id);
  const salesStats = shopIds.length ? await Sale.findAll({
    where: { shop_id: shopIds },
    attributes: [
      'shop_id',
      [sequelize.fn('COUNT', sequelize.col('id')), 'nb_ventes'],
      [sequelize.fn('SUM', sequelize.col('montant_total')), 'ca_total'],
      [sequelize.fn('MAX', sequelize.col('created_at')), 'derniere_vente'],
    ],
    group: ['shop_id'],
    raw: true,
  }) : [];

  const statsMap = {};
  for (const s of salesStats) {
    statsMap[s.shop_id] = {
      nb_ventes:     parseInt(s.nb_ventes),
      ca_total:      parseFloat(s.ca_total ?? 0),
      derniere_vente: s.derniere_vente,
    };
  }

  const shops = rows.map(shop => ({
    id:            shop.id,
    nom:           shop.nom,
    type_commerce: shop.type_commerce,
    devise:        shop.devise,
    tva_enabled:   shop.tva_enabled,
    tva_rate:      parseFloat(shop.tva_rate),
    modules:       shop.modules,
    is_configured: shop.is_configured,
    created_at:    shop.created_at,
    owner:         shop.owner ? {
      id:        shop.owner.id,
      nom:       shop.owner.nom,
      prenom:    shop.owner.prenom,
      telephone: shop.owner.telephone,
      is_active: shop.owner.is_active,
    } : null,
    stats: statsMap[shop.id] ?? { nb_ventes: 0, ca_total: 0, derniere_vente: null },
  }));

  return {
    shops,
    pagination: {
      total:      count,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const updateShopModules = async (shopId, data) => {
  if (!shopId) {
    const err = new Error('ID boutique manquant.');
    err.status = 400;
    throw err;
  }

  const shop = await Shop.findByPk(shopId);
  if (!shop) {
    const err = new Error('Boutique introuvable.');
    err.status = 404;
    throw err;
  }

  const { modules, is_configured } = data || {};

  // Sequelize ne détecte pas toujours les changements sur les champs JSON :
  // on force explicitement le dirty-tracking avec changed() + save()
  if (modules !== undefined) {
    // Sécurité : n'accepter que les clés de modules reconnues et leurs valeurs booléennes.
    // Empêche de stocker en base n'importe quoi envoyé par le client
    // (ex: objet corrompu {0:"{", 1:"s", ...} issu d'un spread de string).
    const KNOWN_MODULES = ['stock', 'rapports', 'commandes'];
    const sanitized = {};
    for (const key of KNOWN_MODULES) {
      if (key in modules) {
        sanitized[key] = !!modules[key]; // force boolean
      }
    }
    // Fusionner avec les modules actuels pour ne pas perdre les clés non envoyées
    const current = shop.modules || {};
    shop.modules = { ...current, ...sanitized };
    shop.changed('modules', true);
  }
  if (is_configured !== undefined) {
    shop.is_configured = is_configured;
    shop.changed('is_configured', true);
  }

  await shop.save();

  return {
    id:            shop.id,
    nom:           shop.nom,
    modules:       shop.modules,
    is_configured: shop.is_configured,
  };
};

// ── Gérants ──────────────────────────────────────────────────

const getUsers = async ({ page = 1, limit = 20, search } = {}) => {
  const offset = (page - 1) * limit;

  const where = { role: 'GERANT' };
  if (search) {
    where[Op.or] = [
      { nom:       { [Op.like]: `%${search}%` } },
      { prenom:    { [Op.like]: `%${search}%` } },
      { telephone: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'nom', 'type_commerce'] },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
    attributes: ['id', 'nom', 'prenom', 'telephone', 'role', 'is_active', 'last_login', 'created_at'],
  });

  return {
    users: rows.map(u => ({
      id:         u.id,
      nom:        u.nom,
      prenom:     u.prenom,
      telephone:  u.telephone,
      role:       u.role,
      is_active:  u.is_active,
      last_login: u.last_login,
      created_at: u.created_at,
      shop:       u.shop ? { id: u.shop.id, nom: u.shop.nom, type_commerce: u.shop.type_commerce } : null,
    })),
    pagination: {
      total:      count,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

const toggleUser = async (userId) => {
  const user = await User.findOne({ where: { id: userId, role: 'GERANT' } });
  if (!user) {
    const err = new Error('Gérant introuvable.');
    err.status = 404;
    throw err;
  }
  await user.update({ is_active: !user.is_active });
  return { id: user.id, is_active: user.is_active };
};

// ── Activité (dernières ventes globales) ─────────────────────

const getActivity = async ({ page = 1, limit = 30 } = {}) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await Sale.findAndCountAll({
    include: [
      { model: Shop,     as: 'shop',     attributes: ['id', 'nom', 'type_commerce'] },
      { model: SaleItem, as: 'items',    attributes: ['nom_produit', 'quantite', 'montant'] },
      { model: Customer, as: 'customer', required: false, attributes: ['id', 'nom'] },
    ],
    order: [['created_at', 'DESC']],
    limit:  parseInt(limit),
    offset,
  });

  return {
    sales: rows.map(s => ({
      id:            s.id,
      shop:          s.shop ? { id: s.shop.id, nom: s.shop.nom, type: s.shop.type_commerce } : null,
      customer:      s.customer ? { id: s.customer.id, nom: s.customer.nom } : null,
      montant_total: parseFloat(s.montant_total),
      remise_montant: parseFloat(s.remise_montant ?? 0),
      tva_montant:   parseFloat(s.tva_montant),
      mode_paiement: s.mode_paiement,
      items:         (s.items || []).map(i => ({
        nom: i.nom_produit, quantite: i.quantite, montant: parseFloat(i.montant),
      })),
      created_at:    s.created_at,
    })),
    pagination: {
      total:      count,
      page:       parseInt(page),
      limit:      parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  };
};

// ── Création d'un gérant ─────────────────────────────────────

const createGerant = async ({ nom, prenom, telephone, password }) => {
  if (!nom?.trim() || !prenom?.trim() || !telephone?.trim() || !password) {
    const err = new Error('Tous les champs sont requis.'); err.status = 400; throw err;
  }
  if (password.length < 6) {
    const err = new Error('Le mot de passe doit contenir au moins 6 caractères.'); err.status = 400; throw err;
  }

  const existing = await User.findOne({ where: { telephone: telephone.trim() } });
  if (existing) {
    const err = new Error('Ce numéro de téléphone est déjà utilisé.'); err.status = 409; throw err;
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    id:        uuidv4(),
    nom:       nom.trim(),
    prenom:    prenom.trim(),
    telephone: telephone.trim(),
    password:  hash,
    role:      'GERANT',
    is_active: 1,
  });

  return {
    id:         user.id,
    nom:        user.nom,
    prenom:     user.prenom,
    telephone:  user.telephone,
    role:       user.role,
    is_active:  !!user.is_active,
    created_at: user.created_at,
    shop:       null,
  };
};

// ── Suppression d'un gérant ──────────────────────────────────

const deleteGerant = async (userId) => {
  const user = await User.findOne({ where: { id: userId, role: 'GERANT' } });
  if (!user) {
    const err = new Error('Gérant introuvable.'); err.status = 404; throw err;
  }
  // Dissocier la boutique avant suppression (ne pas supprimer la boutique)
  await Shop.update({ owner_id: null }, { where: { owner_id: userId } });
  await user.destroy();
};

module.exports = { getOverview, getShops, updateShopModules, getUsers, toggleUser, getActivity, createGerant, deleteGerant };
