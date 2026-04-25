// src/models/Sale.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define(
    'Sale',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE',
      },
      caissier_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
      },
      montant_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Total de la vente (avec TVA si applicable)',
      },
      montant_recu: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Montant remis par le client',
      },
      monnaie_rendue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Monnaie à rendre au client',
      },
      mode_paiement: {
        type: DataTypes.ENUM('especes', 'orange_money', 'moov_money'),
        allowNull: false,
        defaultValue: 'especes',
      },
      tva_montant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Montant TVA inclus dans le total',
      },
      remise_montant: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Remise appliquée (en valeur absolue)',
      },
      customer_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        defaultValue: null,
        comment: 'FK → customers.id (optionnel)',
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'sales',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
