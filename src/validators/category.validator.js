// src/validators/category.validator.js
const Joi = require('joi');

const createCategorySchema = Joi.object({
  nom: Joi.string().min(1).max(80).required().messages({
    'string.min':    'Le nom doit contenir au moins 1 caractère.',
    'string.max':    'Le nom ne peut pas dépasser 80 caractères.',
    'any.required':  'Le nom de la catégorie est requis.',
    'string.empty':  'Le nom de la catégorie est requis.',
  }),
  couleur: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#6366f1')
    .messages({ 'string.pattern.base': 'La couleur doit être un code hexadécimal valide (ex: #6366f1).' }),
  icone: Joi.string().max(10).default('📦'),
});

const updateCategorySchema = Joi.object({
  nom:     Joi.string().min(1).max(80),
  couleur: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
  icone:   Joi.string().max(10),
}).min(1).messages({ 'object.min': 'Au moins un champ est requis pour la mise à jour.' });

module.exports = { createCategorySchema, updateCategorySchema };
