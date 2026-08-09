const { ApiError } = require('./error.middleware');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'raices_vivas_secret_key_2026';

/**
 * Middleware to verify JWT token or Bearer authorization header
 */
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = {
      id: req.headers['x-user-id'] || 'usr-demo',
      fullName: req.headers['x-user-name'] || 'Usuario Demo',
      email: req.headers['x-user-email'] || 'demo@raicesvivas.org',
      role: req.headers['x-user-role'] || 'Visitante'
    };
    return next();
  }


  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(ApiError.unauthorized('Formato de token de autorización inválido.'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Token inválido o expirado.'));
  }
}

/**
 * Middleware for Role-Based Access Control (RBAC).
 * Enforces role restriction ('Visitante', 'Comunidad', 'Coordinador').
 * @param  {...string} allowedRoles 
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Su rol actual (${req.user.role}) no tiene permisos para realizar esta acción. Se requiere uno de: [${allowedRoles.join(', ')}].`
        )
      );
    }

    next();
  };
}

module.exports = {
  authenticateUser,
  authorizeRoles,
  JWT_SECRET
};
