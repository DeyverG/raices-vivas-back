const logger = require('../utils/logger');

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }

  static badRequest(msg, details = null) {
    return new ApiError(400, msg, details);
  }

  static unauthorized(msg = 'Acceso no autorizado. Inicie sesión.') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'No tiene permisos suficientes para realizar esta acción.') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'El recurso solicitado no existe.') {
    return new ApiError(404, msg);
  }

  static internal(msg = 'Error interno del servidor.') {
    return new ApiError(500, msg);
  }
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno en la API';

  logger.error(`[${req.method}] ${req.originalUrl} - Error ${statusCode}: ${message}`, {
    stack: err.stack,
    details: err.details
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details: err.details || null,
      timestamp: new Date().toISOString()
    }
  });
}

module.exports = {
  ApiError,
  errorHandler
};
