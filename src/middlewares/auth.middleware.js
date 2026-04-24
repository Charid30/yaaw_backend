// src/middlewares/auth.middleware.js
const { verifyToken } = require('../utils/jwt.util');
const { error } = require('../utils/response.util');

/**
 * Extrait le token JWT depuis le cookie HttpOnly en priorité,
 * puis depuis le header Authorization (Bearer) en fallback.
 */
const extractToken = (req) => {
  // 1) Cookie HttpOnly (prioritaire — non lisible par JS)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.split(';').find((c) => c.trim().startsWith('token='));
    if (match) {
      const value = match.split('=').slice(1).join('=').trim();
      if (value) return decodeURIComponent(value);
    }
  }
  // 2) Header Authorization Bearer
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
};

/**
 * Middleware d'authentification JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return error(res, 'Token manquant ou invalide', 401);
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return error(res, 'Token invalide ou expiré', 401);
    }

    req.token = token;
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      roleId: decoded.roleId || null,
      shopId: decoded.shopId || null,
    };

    next();
  } catch (err) {
    return error(res, "Erreur d'authentification", 401);
  }
};

/**
 * Middleware de vérification des rôles
 * Usage : authorize('ADMIN', 'GERANT') ou authorize(['ADMIN', 'CAISSIER'])
 */
const authorize = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Non authentifié', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 'Accès refusé : permissions insuffisantes', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
