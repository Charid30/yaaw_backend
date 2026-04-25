// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../models');
const { generateToken, decodeToken } = require('../utils/jwt.util');
const { revokeToken, isBlacklisted } = require('../utils/tokenBlacklist');

/**
 * Inscription d'un gérant (rôle GERANT par défaut)
 */
const register = async ({ nom, prenom, telephone, password }) => {
  // Vérifier si le téléphone existe déjà
  const existing = await User.findOne({ where: { telephone } });
  if (existing) {
    const err = new Error('Ce numéro de téléphone est déjà associé à un compte.');
    err.status = 409;
    throw err;
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 12);

  // Créer l'utilisateur
  const user = await User.create({
    id: uuidv4(),
    nom: nom.trim(),
    prenom: prenom.trim(),
    telephone: telephone.trim(),
    password: passwordHash,
    role: 'GERANT',
    is_active: 1,
  });

  // Générer le token
  const token = generateToken({
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    telephone: user.telephone,
    role: user.role,
  });

  return { user: _sanitize(user), token };
};

/**
 * Connexion
 */
const login = async ({ telephone, password }) => {
  // Trouver l'utilisateur
  const user = await User.findOne({ where: { telephone } });
  if (!user) {
    const err = new Error('Identifiants incorrects.');
    err.status = 401;
    throw err;
  }

  // Vérifier le compte actif
  if (!user.is_active) {
    const err = new Error('Compte désactivé. Contactez l\'administrateur.');
    err.status = 403;
    throw err;
  }

  // Vérifier le mot de passe
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Identifiants incorrects.');
    err.status = 401;
    throw err;
  }

  // Mettre à jour last_login
  await user.update({ last_login: new Date() });

  // Générer le token
  const tokenPayload = {
    id: user.id, nom: user.nom, prenom: user.prenom,
    telephone: user.telephone, role: user.role,
  };
  if (user.role === 'CAISSIER' && user.shop_id) {
    tokenPayload.shop_id = user.shop_id;
  }
  const token = generateToken(tokenPayload);

  return { user: _sanitize(user), token };
};

/**
 * Déconnexion — blacklister le token
 */
const logout = async (token, userId) => {
  const decoded = decodeToken(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 8 * 60 * 60 * 1000);

  await revokeToken(token, userId, expiresAt);
};

/**
 * Récupérer le profil de l'utilisateur connecté
 */
const getMe = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Utilisateur introuvable.');
    err.status = 404;
    throw err;
  }
  return _sanitize(user);
};

// Supprimer les champs sensibles avant de renvoyer
const _sanitize = (user) => {
  const { password, ...safe } = user.toJSON();
  return safe;
};

/**
 * Changer le mot de passe de l'utilisateur connecté
 */
const changePassword = async (userId, { ancien_mot_de_passe, nouveau_mot_de_passe }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Utilisateur introuvable.');
    err.status = 404;
    throw err;
  }

  const valid = await bcrypt.compare(ancien_mot_de_passe, user.password);
  if (!valid) {
    const err = new Error('Mot de passe actuel incorrect.');
    err.status = 400;
    throw err;
  }

  if (nouveau_mot_de_passe.length < 6) {
    const err = new Error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    err.status = 400;
    throw err;
  }

  const hash = await bcrypt.hash(nouveau_mot_de_passe, 12);
  await user.update({ password: hash });
};

module.exports = { register, login, logout, getMe, changePassword };
