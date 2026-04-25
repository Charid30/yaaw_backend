// src/models/index.js
const { sequelize } = require('../config/database');

// ── Modèles ──────────────────────────────────────────────────
const User         = require('./User')(sequelize);
const RevokedToken = require('./RevokedToken')(sequelize);
const Shop         = require('./Shop')(sequelize);
const Category     = require('./Category')(sequelize);
const Product      = require('./Product')(sequelize);
const Sale          = require('./Sale')(sequelize);
const SaleItem      = require('./SaleItem')(sequelize);
const StockMovement = require('./StockMovement')(sequelize);
const Customer      = require('./Customer')(sequelize);
const Fournisseur   = require('./Fournisseur')(sequelize);

// ── Associations ─────────────────────────────────────────────
User.hasMany(RevokedToken, { foreignKey: 'user_id', as: 'revokedTokens' });
RevokedToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Shop,  { foreignKey: 'owner_id', as: 'shop' });
Shop.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Shop.hasMany(Category, { foreignKey: 'shop_id', as: 'categories' });
Category.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

Shop.hasMany(Product, { foreignKey: 'shop_id', as: 'products' });
Product.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

Category.hasMany(Product,  { foreignKey: 'categorie_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categorie_id', as: 'categorie' });

Shop.hasMany(Sale,  { foreignKey: 'shop_id', as: 'sales' });
Sale.belongsTo(Shop, { foreignKey: 'shop_id', as: 'shop' });

User.hasMany(Sale,  { foreignKey: 'caissier_id', as: 'sales' });
Sale.belongsTo(User, { foreignKey: 'caissier_id', as: 'caissier' });

Sale.hasMany(SaleItem,  { foreignKey: 'sale_id', as: 'items' });
SaleItem.belongsTo(Sale, { foreignKey: 'sale_id', as: 'sale' });

SaleItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Shop.hasMany(StockMovement,    { foreignKey: 'shop_id',    as: 'stockMovements' });
StockMovement.belongsTo(Shop,  { foreignKey: 'shop_id',    as: 'shop' });

Product.hasMany(StockMovement,    { foreignKey: 'product_id', as: 'stockMovements' });
StockMovement.belongsTo(Product,  { foreignKey: 'product_id', as: 'product' });

User.hasMany(StockMovement,    { foreignKey: 'user_id',    as: 'stockMovements' });
StockMovement.belongsTo(User,  { foreignKey: 'user_id',    as: 'user' });

Sale.hasMany(StockMovement,    { foreignKey: 'sale_id',    as: 'stockMovements' });
StockMovement.belongsTo(Sale,  { foreignKey: 'sale_id',    as: 'sale' });

Shop.hasMany(Customer,    { foreignKey: 'shop_id', as: 'customers' });
Customer.belongsTo(Shop,  { foreignKey: 'shop_id', as: 'shop' });

// Caissiers liés à une boutique via shop_id sur User
Shop.hasMany(User,   { foreignKey: 'shop_id', as: 'employees', scope: { role: 'CAISSIER' } });
User.belongsTo(Shop, { foreignKey: 'shop_id', as: 'employerShop' });

// Ventes liées à un client
Sale.belongsTo(Customer,  { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Sale,    { foreignKey: 'customer_id', as: 'sales' });

// Fournisseurs
Shop.hasMany(Fournisseur,    { foreignKey: 'shop_id', as: 'fournisseurs' });
Fournisseur.belongsTo(Shop,  { foreignKey: 'shop_id', as: 'shop' });

// ── Export ───────────────────────────────────────────────────
module.exports = {
  sequelize,
  User,
  RevokedToken,
  Shop,
  Category,
  Product,
  Sale,
  SaleItem,
  StockMovement,
  Customer,
  Fournisseur,
};
