// src/models/Customer.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define(
    'Customer',
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
      nom: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Le nom du client est requis.' },
        },
      },
      telephone: {
        type: DataTypes.STRING(30),
        allowNull: true,
        defaultValue: null,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: null,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: 'customers',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
