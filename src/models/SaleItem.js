// src/models/SaleItem.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define(
    'SaleItem',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      sale_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'sales', key: 'id' },
        onDelete: 'CASCADE',
      },
      product_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        defaultValue: null,
        comment: 'Nullable si le produit a été supprimé depuis',
      },
      nom_produit: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Snapshot du nom au moment de la vente',
      },
      prix_unitaire: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Snapshot du prix au moment de la vente',
      },
      quantite: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      montant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'prix_unitaire × quantite',
      },
    },
    {
      tableName: 'sale_items',
      timestamps: false,
    }
  );
};
