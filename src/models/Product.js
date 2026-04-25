// src/models/Product.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      nom: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      prix: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Prix de vente',
      },
      prix_achat: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
        comment: 'Prix d achat (pour calcul de marge)',
      },
      categorie_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        defaultValue: null,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE',
      },
      stock_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantité en stock',
      },
      unite: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pièce',
        comment: 'Unité de mesure (pièce, kg, L…)',
      },
      code_barre: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'products',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
