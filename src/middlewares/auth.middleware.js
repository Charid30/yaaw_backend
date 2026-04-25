// src/middlewares/auth.middleware.js
const { verifyToken } = require('../utils/jwt.util');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const { error } = require('../utils/response.util');

const extractToken = (req) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.split(';').find((c) => c.trim().startsWith('token='));
    if (match) {
      const value = match.split('=').slice(1).join('=').trim();
      if (value) return decodeURIComponent(value);
    }
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Vérification JWT + blacklist
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return error(res, 'Token manquant ou invalide.', 401);

    // Vérifier si blacklisté (déconnexion explicite)
    if (await isBlacklisted(token)) return error(res, 'Token invalide ou expiré.', 401);

    const decoded = verifyToken(token);
    if (!decoded) return error(res, 'Token invalide ou expiré.', 401);

    req.token = token;
    req.user = {
      id:        decoded.id,
      nom:       decoded.nom,
      prenom:    decoded.prenom,
      telephone: decoded.telephone,
      role:      decoded.role,
      shop_id:   decoded.shop_id || null,
    };

    next();
  } catch (err) {
    return error(res, "Erreur d'authentification.", 401);
  }
};

/**
 * Vérification de rôle
 * Usage : authorize('ADMIN') ou authorize(['ADMIN', 'GERANT'])
 */
const authorize = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user) return error(res, 'Non authentifié.', 401);
    if (!roles.includes(req.user.role))
      return error(res, 'Accès refusé : permissions insuffisantes.', 403);
    next();
  };
};

module.exports = { authenticate, authorize };
