// src/models/StockMovement.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  const StockMovement = sequelize.define('StockMovement', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      // entree  = réapprovisionnement / stock initial
      // sortie  = perte / correction manuelle
      // ajustement = remise à niveau (inventaire)
      // vente   = généré automatiquement par une vente
      type: DataTypes.ENUM('entree', 'sortie', 'ajustement', 'vente'),
      allowNull: false,
    },
    quantite: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_avant: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock_apres: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motif: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    user_id: {
      // auteur du mouvement (NULL pour les ventes caisse)
      type: DataTypes.UUID,
      allowNull: true,
    },
    sale_id: {
      // lien vers la vente qui a généré ce mouvement
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    tableName: 'stock_movements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  return StockMovement;
};
