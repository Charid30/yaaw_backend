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
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log côté serveur uniquement, jamais renvoyé au client
  if (process.env.NODE_ENV !== 'test') {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${err.message}`
    );
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Une erreur interne est survenue.' : err.message,
  });
};

module.exports = { notFound, errorHandler };
