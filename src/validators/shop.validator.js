// src/validators/shop.validator.js
const Joi = require('joi');

const createShopSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères.',
    'string.max': 'Le nom ne peut pas dépasser 100 caractères.',
    'any.required': 'Le nom de la boutique est requis.',
    'string.empty': 'Le nom de la boutique est requis.',
  }),

  type_commerce: Joi.string()
    .valid('boutique', 'restaurant', 'pharmacie', 'cave')
    .required()
    .messages({
      'any.only': 'Type de commerce invalide (boutique, restaurant, pharmacie, cave).',
      'any.required': 'Le type de commerce est requis.',
      'string.empty': 'Le type de commerce est requis.',
    }),

  devise: Joi.string().max(10).default('FCFA').messages({
    'string.max': 'La devise ne peut pas dépasser 10 caractères.',
  }),

  tva_enabled: Joi.boolean().default(false),

  tva_rate: Joi.number().min(0).max(100).default(18).messages({
    'number.min': 'Le taux de TVA ne peut pas être négatif.',
    'number.max': 'Le taux de TVA ne peut pas dépasser 100 %.',
    'number.base': 'Le taux de TVA doit être un nombre.',
  }),

  modules: Joi.object({
    stock:     Joi.boolean().default(true),
    commandes: Joi.boolean().default(false),
    rapports:  Joi.boolean().default(true),
  }).default({ stock: true, commandes: false, rapports: true }),
});

module.exports = { createShopSchema };
