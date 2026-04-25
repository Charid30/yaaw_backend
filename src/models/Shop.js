// src/models/Shop.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define(
    'Shop',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type_commerce: {
        type: DataTypes.ENUM('boutique', 'restaurant', 'pharmacie', 'cave'),
        allowNull: false,
      },
      devise: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'FCFA',
      },
      tva_enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tva_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 18.0,
      },
      modules: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { stock: true, commandes: false, rapports: true },
      },
      owner_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      is_configured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'shops',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
