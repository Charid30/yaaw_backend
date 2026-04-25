// src/config/env.js
require('dotenv').config();

// JWT_SECRET obligatoire : arrêt immédiat si absent
if (!process.env.JWT_SECRET) {
  console.error(
    '\x1b[31m%s\x1b[0m',
    '❌ ERREUR CRITIQUE : JWT_SECRET non défini. Ajoutez JWT_SECRET dans votre fichier .env et redémarrez.'
  );
  process.exit(1);
}

module.exports = {
  // Serveur
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  // Base de données
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_NAME: process.env.DB_NAME || 'yaahw_db',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',

  // Inscription publique : mettre à "true" seulement en dev/demo.
  // En production, seul l'admin crée les comptes gérant.
  ALLOW_PUBLIC_REGISTER: process.env.ALLOW_PUBLIC_REGISTER === 'true',

  // Application
  APP_NAME: process.env.APP_NAME || 'YAAHW',
  APP_URL:
    process.env.NODE_ENV === 'production'
      ? process.env.PROD_APP_URL || 'https://app.yaahw.com'
      : process.env.APP_URL || 'http://localhost:5000',

  FRONTEND_URL:
    process.env.NODE_ENV === 'production'
      ? process.env.PROD_FRONTEND_URL || 'https://app.yaahw.com'
      : process.env.FRONTEND_URL || 'http://localhost:4200',
};
