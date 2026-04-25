// src/middlewares/error.middleware.js

/**
 * Middleware 404
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route non trouvée - ${req.originalUrl}`);
  res.status(404);
  next(err);
};

/**
 * Middleware global de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  // body-parser (et d'autres middlewares) posent leur code sur err.status / err.statusCode
  // plutôt que sur res.statusCode — on les prend en priorité
  const statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  // Log côté serveur uniquement, jamais renvoyé au client
  if (process.env.NODE_ENV !== 'test') {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message}`
    );
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  // En développement on expose le vrai message pour faciliter le debug.
  // En production on masque les erreurs 500 (sécurité : ne pas fuiter l'état interne).
  const isDev = process.env.NODE_ENV !== 'production';
  const message =
    statusCode === 500 && !isDev
      ? 'Une erreur interne est survenue.'
      : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
