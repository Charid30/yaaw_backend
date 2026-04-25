// src/services/report.service.js
const { sequelize, Sale, SaleItem, Product, Category } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// ── Helpers ──────────────────────────────────────────────────

const startOf = (date, unit) => {
  const d = new Date(date);
  if (unit === 'day')   { d.setHours(0,0,0,0); return d; }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); return d; }
  if (unit === 'year')  { d.setMonth(0,1); d.setHours(0,0,0,0); return d; }
  return d;
};

const endOf = (date, unit) => {
  const d = new Date(date);
  if (unit === 'day')   { d.setHours(23,59,59,999); return d; }
  if (unit === 'month') {
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23,59,59,999);
    return d;
  }
  if (unit === 'year')  { d.setMonth(11,31); d.setHours(23,59,59,999); return d; }
  return d;
};

// ── 1. KPI du tableau de bord rapports ───────────────────────

async function getKpis(shop_id) {
  const now   = new Date();
  const today = { [Op.between]: [startOf(now,'day'), endOf(now,'day')] };
  const month = { [Op.between]: [startOf(now,'month'), endOf(now,'month')] };

  const [todaySales, monthSales, totalSales] = await Promise.all([
    Sale.findAll({ where: { shop_id, created_at: today  }, attributes: ['montant_total'] }),
    Sale.findAll({ where: { shop_id, created_at: month  }, attributes: ['montant_total'] }),
    Sale.findAll({ where: { shop_id }, attributes: ['montant_total'] }),
  ]);

  const sum = arr => arr.reduce((s, r) => s + parseFloat(r.montant_total), 0);

  return {
    caAujourdhui:  parseFloat(sum(todaySales).toFixed(2)),
    caMois:        parseFloat(sum(monthSales).toFixed(2)),
    caTotal:       parseFloat(sum(totalSales).toFixed(2)),
    ventesAujourdhui: todaySales.length,
    ventesMois:    monthSales.length,
    ventesTotal:   totalSales.length,
    ticketMoyen:   monthSales.length
      ? parseFloat((sum(monthSales) / monthSales.length).toFixed(2))
      : 0,
  };
}

// ── 2. Évolution CA — 30 derniers jours ──────────────────────

async function getCaByDay(shop_id, days = 30) {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0,0,0,0);

  const rows = await Sale.findAll({
    where: {
      shop_id,
      created_at: { [Op.gte]: from },
    },
    attributes: [
      [fn('DATE', col('created_at')), 'date'],
      [fn('SUM', col('montant_total')), 'ca'],
      [fn('COUNT', col('id')), 'nb_ventes'],
    ],
    group: [fn('DATE', col('created_at'))],
    order: [[fn('DATE', col('created_at')), 'ASC']],
    raw: true,
  });

  // Remplir les jours manquants avec 0
  const map = {};
  rows.forEach(r => { map[r.date] = { ca: parseFloat(r.ca), nb_ventes: parseInt(r.nb_ventes) }; });

  const result = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0,10);
    result.push({ date: key, ca: map[key]?.ca ?? 0, nb_ventes: map[key]?.nb_ventes ?? 0 });
  }

  return result;
}

// ── 3. Évolution CA — 12 derniers mois ───────────────────────

async function getCaByMonth(shop_id, months = 12) {
  const from = new Date();
  from.setMonth(from.getMonth() - (months - 1), 1);
  from.setHours(0,0,0,0);

  const rows = await Sale.findAll({
    where: {
      shop_id,
      created_at: { [Op.gte]: from },
    },
    attributes: [
      [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'mois'],
      [fn('SUM', col('montant_total')), 'ca'],
      [fn('COUNT', col('id')), 'nb_ventes'],
    ],
    group: [fn('DATE_FORMAT', col('created_at'), '%Y-%m')],
    order: [[fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'ASC']],
    raw: true,
  });

  const map = {};
  rows.forEach(r => { map[r.mois] = { ca: parseFloat(r.ca), nb_ventes: parseInt(r.nb_ventes) }; });

  const result = [];
  const base = new Date(from);
  for (let i = 0; i < months; i++) {
    const d = new Date(base);
    d.setMonth(base.getMonth() + i);
    const key = d.toISOString().slice(0,7);
    result.push({ mois: key, ca: map[key]?.ca ?? 0, nb_ventes: map[key]?.nb_ventes ?? 0 });
  }

  return result;
}

// ── 4. Top produits vendus (quantité) ────────────────────────

async function getTopProducts(shop_id, limit = 10, period = 'month') {
  const now  = new Date();
  const from = period === 'day'   ? startOf(now, 'day')
             : period === 'month' ? startOf(now, 'month')
             : period === 'year'  ? startOf(now, 'year')
             : new Date(0); // all time

  const rows = await SaleItem.findAll({
    include: [{
      model: Sale,
      as:    'sale',
      where: { shop_id, created_at: { [Op.gte]: from } },
      attributes: [],
    }],
    attributes: [
      'product_id',
      'nom_produit',
      [fn('SUM', col('quantite')),   'total_qte'],
      [fn('SUM', col('montant')),    'total_ca'],
      [fn('COUNT', col('SaleItem.id')), 'nb_ventes'],
    ],
    group: ['product_id', 'nom_produit'],
    order: [[fn('SUM', col('quantite')), 'DESC']],
    limit,
    raw: true,
  });

  return rows.map(r => ({
    product_id:  r.product_id,
    nom:         r.nom_produit,
    total_qte:   parseInt(r.total_qte),
    total_ca:    parseFloat(parseFloat(r.total_ca).toFixed(2)),
    nb_ventes:   parseInt(r.nb_ventes),
  }));
}

// ── 5. Répartition par mode de paiement ──────────────────────

async function getPaymentBreakdown(shop_id, period = 'month') {
  const now  = new Date();
  const from = period === 'day'   ? startOf(now, 'day')
             : period === 'month' ? startOf(now, 'month')
             : period === 'year'  ? startOf(now, 'year')
             : new Date(0);

  const rows = await Sale.findAll({
    where: { shop_id, created_at: { [Op.gte]: from } },
    attributes: [
      'mode_paiement',
      [fn('COUNT', col('id')),             'nb'],
      [fn('SUM', col('montant_total')),     'ca'],
    ],
    group: ['mode_paiement'],
    raw: true,
  });

  const total = rows.reduce((s, r) => s + parseFloat(r.ca), 0);

  return rows.map(r => ({
    mode:       r.mode_paiement,
    nb:         parseInt(r.nb),
    ca:         parseFloat(parseFloat(r.ca).toFixed(2)),
    pourcentage: total > 0 ? parseFloat(((parseFloat(r.ca) / total) * 100).toFixed(1)) : 0,
  }));
}

// ── 6. Ventes récentes ────────────────────────────────────────

async function getRecentSales(shop_id, limit = 10) {
  const sales = await Sale.findAll({
    where: { shop_id },
    include: [{ model: SaleItem, as: 'items' }],
    order: [['created_at', 'DESC']],
    limit,
  });

  return sales.map(s => ({
    id:             s.id,
    montant_total:  parseFloat(s.montant_total),
    mode_paiement:  s.mode_paiement,
    nb_articles:    s.items.reduce((sum, i) => sum + i.quantite, 0),
    created_at:     s.created_at,
  }));
}

module.exports = {
  getKpis,
  getCaByDay,
  getCaByMonth,
  getTopProducts,
  getPaymentBreakdown,
  getRecentSales,
};
