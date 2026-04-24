// src/models/RevokedToken.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RevokedToken = sequelize.define(
    'RevokedToken',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'revoked_tokens',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return RevokedToken;
};
