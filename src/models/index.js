// src/models/index.js
const { sequelize } = require('../config/database');

// ── Modèles ──────────────────────────────────────────────────
const User         = require('./User')(sequelize);
const RevokedToken = require('./RevokedToken')(sequelize);

// ── Associations ─────────────────────────────────────────────
User.hasMany(RevokedToken, { foreignKey: 'user_id', as: 'revokedTokens' });
RevokedToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ── Export ───────────────────────────────────────────────────
module.exports = {
  sequelize,
  User,
  RevokedToken,
};
