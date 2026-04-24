// src/models/index.js
const { sequelize } = require('../config/database');

// =====================================================
// IMPORTER LES MODÈLES
// =====================================================
// Les modèles seront ajoutés au fur et à mesure des features.
// Exemple :
//   const User = require('./User')(sequelize);
//   const Product = require('./Product')(sequelize);

// =====================================================
// DÉFINIR LES ASSOCIATIONS
// =====================================================
// Exemple :
//   User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
//   Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// =====================================================
// EXPORT
// =====================================================
module.exports = {
  sequelize,
  // User,
  // Product,
};
