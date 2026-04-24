// src/utils/tokenBlacklist.js
const { RevokedToken } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Ajouter un token à la blacklist
 * @param {string} token
 * @param {string} userId
 * @param {Date}   expiresAt
 */
const revokeToken = async (token, userId, expiresAt) => {
  await RevokedToken.create({
    id: uuidv4(),
    token,
    user_id: userId,
    expires_at: expiresAt,
  });
};

/**
 * Vérifier si un token est blacklisté
 * @param {string} token
 * @returns {boolean}
 */
const isBlacklisted = async (token) => {
  const found = await RevokedToken.findOne({ where: { token } });
  return !!found;
};

/**
 * Purger les tokens expirés (à appeler via un cron job)
 */
const purgeExpired = async () => {
  const deleted = await RevokedToken.destroy({
    where: { expires_at: { [Op.lt]: new Date() } },
  });
  if (deleted > 0) {
    console.log(`🗑️  ${deleted} token(s) expirés purgés.`);
  }
};

module.exports = { revokeToken, isBlacklisted, purgeExpired };
