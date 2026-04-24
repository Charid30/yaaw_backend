// src/validators/auth.validator.js
const Joi = require('joi');

const telephone = Joi.string()
  .trim()
  .min(8)
  .max(20)
  .pattern(/^\+?[\d\s\-().]{8,20}$/)
  .required()
  .messages({
    'string.pattern.base': 'Numéro de téléphone invalide.',
    'string.min': 'Numéro trop court (minimum 8 caractères).',
    'string.max': 'Numéro trop long (maximum 20 caractères).',
    'any.required': 'Le numéro de téléphone est requis.',
  });

const password = Joi.string()
  .min(8)
  .max(128)
  .required()
  .messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères.',
    'any.required': 'Le mot de passe est requis.',
  });

// POST /api/auth/register
const registerSchema = Joi.object({
  nom: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères.',
    'any.required': 'Le nom est requis.',
  }),
  prenom: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères.',
    'any.required': 'Le prénom est requis.',
  }),
  telephone,
  password,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Les mots de passe ne correspondent pas.',
    'any.required': 'La confirmation du mot de passe est requise.',
  }),
});

// POST /api/auth/login
const loginSchema = Joi.object({
  telephone,
  password,
});

module.exports = { registerSchema, loginSchema };
