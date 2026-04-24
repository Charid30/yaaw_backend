// src/config/database.js
const { Sequelize } = require('sequelize');
const env = require('./env');

// Instance Sequelize
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie !');
  } catch (err) {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };
