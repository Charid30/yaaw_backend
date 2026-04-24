// src/utils/response.util.js

/**
 * Réponse de succès
 */
const success = (res, data = null, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Réponse d'erreur
 */
const error = (res, message = 'Erreur', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Réponse paginée
 */
const paginate = (res, data, page, limit, total, message = 'Succès') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { success, error, paginate };
