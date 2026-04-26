// src/validators/sale.validator.js
const Joi = require('joi');

const createSaleSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().uuid().required().messages({
          'any.required': 'L\'identifiant du produit est requis.',
          'string.uuid':  'L\'identifiant du produit est invalide.',
        }),
        quantite: Joi.number().integer().min(1).required().messages({
          'number.min':   'La quantité doit être au moins 1.',
          'any.required': 'La quantité est requise.',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min':    'Le panier ne peut pas être vide.',
      'any.required': 'Les articles de la vente sont requis.',
    }),

  mode_paiement: Joi.string()
    .valid('especes', 'orange_money', 'moov_money')
    .required()
    .messages({
      'any.only':     'Mode de paiement invalide (especes, orange_money, moov_money).',
      'any.required': 'Le mode de paiement est requis.',
    }),

  montant_recu: Joi.number().min(0).required().messages({
    'number.min':   'Le montant reçu ne peut pas être négatif.',
    'any.required': 'Le montant reçu est requis.',
  }),

  note:          Joi.string().max(500).allow('', null).default(null),
  customer_id:   Joi.string().uuid().allow(null).default(null),
  customer_nom:  Joi.string().max(150).allow('', null).default(null),
  remise_montant: Joi.number().min(0).default(0),
});

module.exports = { createSaleSchema };
