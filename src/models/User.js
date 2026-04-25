// src/models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Le nom est requis.' },
          len: { args: [2, 100], msg: 'Le nom doit contenir entre 2 et 100 caractères.' },
        },
      },
      prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Le prénom est requis.' },
          len: { args: [2, 100], msg: 'Le prénom doit contenir entre 2 et 100 caractères.' },
        },
      },
      telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: { msg: 'Ce numéro de téléphone est déjà utilisé.' },
        validate: {
          notEmpty: { msg: 'Le numéro de téléphone est requis.' },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'GERANT', 'CAISSIER'),
        allowNull: false,
        defaultValue: 'GERANT',
      },
      is_active: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 1,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        defaultValue: null,
        comment: 'FK → shops.id (pour les CAISSIERS uniquement)',
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return User;
};
