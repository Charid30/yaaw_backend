// src/controllers/report.controller.js
const reportService = require('../services/report.service');

const getShopId = (req) => req.shop?.id ?? req.query.shop_id;

exports.getKpis = async (req, res, next) => {
  try {
    const shop_id = getShopId(req);
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });
    const data = await reportService.getKpis(shop_id);
    res.json({ success: true, message: 'KPIs récupérés.', data });
  } catch (err) { next(err); }
};

exports.getCaByDay = async (req, res, next) => {
  try {
    const shop_id = getShopId(req);
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });
    const days = Math.min(parseInt(req.query.days ?? '30'), 90);
    const data = await reportService.getCaByDay(shop_id, days);
    res.json({ success: true, message: 'CA par jour.', data });
  } catch (err) { next(err); }
};

exports.getCaByMonth = async (req, res, next) => {
  try {
    const shop_id = getShopId(req);
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });
    const months = Math.min(parseInt(req.query.months ?? '12'), 24);
    const data = await reportService.getCaByMonth(shop_id, months);
    res.json({ success: true, message: 'CA par mois.', data });
  } catch (err) { next(err); }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const shop_id = getShopId(req);
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });
    const limit  = Math.min(parseInt(req.query.limit ?? '10'), 20);
    const period = req.query.period ?? 'month';
    const data = await reportService.getTopProducts(shop_id, limit, period);
    res.json({ success: true, message: 'Top produits.', data });
  } catch (err) { next(err); }
};

exports.getPaymentBreakdown = async (req, res, next) => {
  try {
    const shop_id = getShopId(req);
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });
    const period = req.query.period ?? 'month';
    const data = await reportService.getPaymentBreakdown(shop_id, period);
    res.json({ success: true, message: 'Répartition paiements.', data });
  } catch (err) { next(err); }
};

exports.getRecentSales = async (req, res, next) => {
  try {
    const shop_id = getShopId(req);
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });
    const limit = Math.min(parseInt(req.query.limit ?? '10'), 50);
    const data = await reportService.getRecentSales(shop_id, limit);
    res.json({ success: true, message: 'Ventes récentes.', data });
  } catch (err) { next(err); }
};
