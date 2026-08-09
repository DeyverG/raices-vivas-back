const authRepository = require('./auth.repository');
const { hashPasswordSHA256, verifyPasswordSHA256 } = require('../../utils/crypto');
const { ApiError } = require('../../middlewares/error.middleware');
const { recordAuditLog } = require('../../services/bitacora.service');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../middlewares/auth.middleware');

class AuthService {
  /**
   * Registers a new user.
   * Enforces Ley 1581 data consent and encrypts password with SHA-256.
   */
  async register({ fullName, email, password, role, communityName, dataConsent }) {
    if (!fullName || !email || !password || !role) {
      throw ApiError.badRequest('Todos los campos obligatorios deben ser diligenciados.');
    }

    // Critical Ley 1581 / RGPD compliance check
    if (!dataConsent) {
      throw ApiError.badRequest('Debe aceptar explícitamente la Política de Tratamiento de Datos (Ley 1581 de 2012 / RGPD).');
    }

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw ApiError.badRequest('Ya existe un usuario registrado con este correo electrónico.');
    }

    // Encrypt password using SHA-256
    const passwordHash = hashPasswordSHA256(password);
    const userId = `usr-${Date.now()}`;
    const consentTimestamp = new Date().toISOString();

    const createdUser = await authRepository.createUser({
      id: userId,
      fullName,
      email,
      passwordHash,
      role,
      communityName,
      dataConsent,
      consentTimestamp
    });

    // Record in Bitácora (RNF-010)
    await recordAuditLog({
      entityId: userId,
      entityType: 'Usuario',
      userIdentifier: `${fullName} (${role})`,
      action: 'REGISTRO_USUARIO',
      details: `Usuario registrado con rol ${role} y consentimiento Ley 1581 explícito.`
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: createdUser.id, fullName: createdUser.full_name, email: createdUser.email, role: createdUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: createdUser.id,
        fullName: createdUser.full_name,
        email: createdUser.email,
        role: createdUser.role,
        communityName: createdUser.community_name,
        dataConsent: createdUser.data_consent
      },
      token
    };
  }

  /**
   * Authenticates user credentials using SHA-256 hash comparison.
   */
  async login({ email, password }) {
    if (!email || !password) {
      throw ApiError.badRequest('Por favor ingrese correo electrónico y contraseña.');
    }

    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Credenciales inválidas. Verifique su correo y contraseña.');
    }

    const isMatch = verifyPasswordSHA256(password, user.password_hash);
    if (!isMatch) {
      throw ApiError.unauthorized('Credenciales inválidas. Verifique su correo y contraseña.');
    }

    const token = jwt.sign(
      { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        communityName: user.community_name,
        dataConsent: user.data_consent
      },
      token
    };
  }
}

module.exports = new AuthService();
