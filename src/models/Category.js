// src/models/Category.js
const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  return sequelize.define(
    'Category',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      nom: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      couleur: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: '#6366f1',
        comment: 'Couleur hexadécimale (ex: #6366f1)',
      },
      icone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: '📦',
        comment: 'Emoji ou code icône',
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: { model: 'shops', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'categories',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};
