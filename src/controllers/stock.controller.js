// src/controllers/stock.controller.js
const stockService = require('../services/stock.service');

// ── POST /api/stock/entries ───────────────────────────────────

exports.addStock = async (req, res, next) => {
  try {
    const shop_id = req.shop?.id ?? req.body.shop_id;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });

    const { product_id, quantite, motif } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'product_id requis.' });
    if (!quantite || isNaN(parseInt(quantite)))
      return res.status(400).json({ success: false, message: 'quantite doit être un entier positif.' });

    const result = await stockService.addStock({
      shop_id,
      product_id,
      quantite: parseInt(quantite),
      motif,
      user_id: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `Entrée de ${parseInt(quantite)} unité(s) enregistrée.`,
      data: result,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── POST /api/stock/exits ─────────────────────────────────────

exports.removeStock = async (req, res, next) => {
  try {
    const shop_id = req.shop?.id ?? req.body.shop_id;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });

    const { product_id, quantite, motif } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'product_id requis.' });
    if (!quantite || isNaN(parseInt(quantite)))
      return res.status(400).json({ success: false, message: 'quantite doit être un entier positif.' });

    const result = await stockService.removeStock({
      shop_id,
      product_id,
      quantite: parseInt(quantite),
      motif,
      user_id: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: `Sortie de ${parseInt(quantite)} unité(s) enregistrée.`,
      data: result,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── POST /api/stock/adjustments ───────────────────────────────

exports.adjustStock = async (req, res, next) => {
  try {
    const shop_id = req.shop?.id ?? req.body.shop_id;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });

    const { product_id, new_qty, motif } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'product_id requis.' });
    if (new_qty === undefined || new_qty === null || isNaN(parseInt(new_qty)))
      return res.status(400).json({ success: false, message: 'new_qty doit être un entier ≥ 0.' });

    const result = await stockService.adjustStock({
      shop_id,
      product_id,
      new_qty: parseInt(new_qty),
      motif,
      user_id: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Ajustement de stock enregistré.',
      data: result,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
};

// ── GET /api/stock/movements ──────────────────────────────────

exports.getMovements = async (req, res, next) => {
  try {
    const shop_id = req.shop?.id ?? req.query.shop_id;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });

    const { product_id, type, page = 1, limit = 30 } = req.query;
    const result = await stockService.getMovements({
      shop_id,
      product_id,
      type,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
    });

    res.json({ success: true, message: 'Mouvements récupérés.', ...result });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/stock/low ────────────────────────────────────────

exports.getLowStock = async (req, res, next) => {
  try {
    const shop_id = req.shop?.id ?? req.query.shop_id;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });

    const threshold = parseInt(req.query.threshold ?? '5');
    const products  = await stockService.getLowStock({ shop_id, threshold });

    res.json({
      success: true,
      message: `${products.length} produit(s) avec stock ≤ ${threshold}.`,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/stock/summary ────────────────────────────────────

exports.getStockSummary = async (req, res, next) => {
  try {
    const shop_id = req.shop?.id ?? req.query.shop_id;
    if (!shop_id) return res.status(400).json({ success: false, message: 'shop_id requis.' });

    const summary = await stockService.getStockSummary({ shop_id });
    res.json({ success: true, message: 'Résumé du stock.', data: summary });
  } catch (err) {
    next(err);
  }
};
