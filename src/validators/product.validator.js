// src/validators/product.validator.js
const Joi = require('joi');

const createProductSchema = Joi.object({
  nom: Joi.string().min(1).max(150).required().messages({
    'string.min':   'Le nom doit contenir au moins 1 caractère.',
    'string.max':   'Le nom ne peut pas dépasser 150 caractères.',
    'any.required': 'Le nom du produit est requis.',
    'string.empty': 'Le nom du produit est requis.',
  }),
  description: Joi.string().max(1000).allow('', null).default(null),
  prix: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Le prix doit être supérieur à 0.',
    'any.required':    'Le prix de vente est requis.',
  }),
  prix_achat: Joi.number().min(0).precision(2).allow(null).default(null),
  categorie_id: Joi.string().uuid().allow(null).default(null),
  stock_qty: Joi.number().integer().min(0).default(0),
  unite: Joi.string()
    .valid('pièce', 'kg', 'g', 'L', 'cl', 'boîte', 'sachet', 'carton', 'lot')
    .default('pièce'),
  code_barre: Joi.string().max(100).allow('', null).default(null),
  is_active: Joi.boolean().default(true),
});

const updateProductSchema = Joi.object({
  nom:          Joi.string().min(1).max(150),
  description:  Joi.string().max(1000).allow('', null),
  prix:         Joi.number().positive().precision(2),
  prix_achat:   Joi.number().min(0).precision(2).allow(null),
  categorie_id: Joi.string().uuid().allow(null),
  stock_qty:    Joi.number().integer().min(0),
  unite:        Joi.string().valid('pièce', 'kg', 'g', 'L', 'cl', 'boîte', 'sachet', 'carton', 'lot'),
  code_barre:   Joi.string().max(100).allow('', null),
  is_active:    Joi.boolean(),
}).min(1).messages({ 'object.min': 'Au moins un champ est requis pour la mise à jour.' });

module.exports = { createProductSchema, updateProductSchema };
