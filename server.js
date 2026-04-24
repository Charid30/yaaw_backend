// server.js
const os = require('os');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = require('./src/app');
const env = require('./src/config/env');
const { testConnection } = require('./src/config/database');
const db = require('./src/models');

const PORT = env.PORT;

// Obtenir l'IP locale (pour afficher l'URL réseau au démarrage)
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const startServer = async () => {
  try {
    // 1. Connexion DB
    await testConnection();

    // 2. Synchronisation des modèles (à activer quand les modèles seront définis)
    // await db.sequelize.sync({ alter: true });
    console.log('✅ Modèles chargés.');

    // 3. HTTPS en production si certificats fournis, sinon HTTP
    const sslKeyPath = process.env.SSL_KEY_PATH;
    const sslCertPath = process.env.SSL_CERT_PATH;
    const useHttps =
      env.NODE_ENV === 'production' &&
      sslKeyPath &&
      sslCertPath &&
      fs.existsSync(sslKeyPath) &&
      fs.existsSync(sslCertPath);

    const banner = () => {
      const protocol = useHttps ? 'https' : 'http';
      console.log('=================================');
      console.log(`🚀 Serveur ${env.APP_NAME} démarré`);
      console.log(`📍 URL locale: ${protocol}://localhost:${PORT}`);
      console.log(`📍 URL réseau: ${protocol}://${getLocalIP()}:${PORT}`);
      console.log(`🌍 Environnement: ${env.NODE_ENV}`);
      console.log(`🔌 Port: ${PORT}`);
      console.log(
        `🔒 HTTPS: ${useHttps ? 'actif' : 'inactif (mode HTTP)'}`
      );
      console.log('=================================');
    };

    if (useHttps) {
      const sslOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      };
      https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', banner);
    } else {
      http.createServer(app).listen(PORT, '0.0.0.0', banner);
    }
  } catch (err) {
    console.error('❌ Erreur au démarrage:', err.message);
    process.exit(1);
  }
};

startServer();
