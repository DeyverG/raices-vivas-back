const authService = require('./auth.service');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: { user: req.user }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
