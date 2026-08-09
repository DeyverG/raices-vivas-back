const jwt = require('jsonwebtoken');
const { ApiError, errorHandler } = require('../src/middlewares/error.middleware');
const { authenticateUser, authorizeRoles, JWT_SECRET } = require('../src/middlewares/auth.middleware');
const logger = require('../src/utils/logger');

describe('Middlewares - Error & Auth', () => {
  describe('error.middleware.js', () => {
    test('ApiError static constructors should return instances with proper status codes and messages', () => {
      const badReq = ApiError.badRequest('Bad request msg', { field: 'name' });
      expect(badReq.statusCode).toBe(400);
      expect(badReq.message).toBe('Bad request msg');
      expect(badReq.details).toEqual({ field: 'name' });

      const unauth = ApiError.unauthorized();
      expect(unauth.statusCode).toBe(401);
      expect(unauth.message).toBe('Acceso no autorizado. Inicie sesión.');

      const forb = ApiError.forbidden();
      expect(forb.statusCode).toBe(403);
      expect(forb.message).toBe('No tiene permisos suficientes para realizar esta acción.');

      const notFound = ApiError.notFound();
      expect(notFound.statusCode).toBe(404);

      const internal = ApiError.internal();
      expect(internal.statusCode).toBe(500);
    });

    test('errorHandler should handle ApiError and send formatted JSON response', () => {
      const err = ApiError.badRequest('Invalid input', { key: 'val' });
      const req = { method: 'POST', originalUrl: '/api/v1/test' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Invalid input',
            statusCode: 400,
            details: { key: 'val' }
          })
        })
      );
      loggerSpy.mockRestore();
    });

    test('errorHandler should handle standard Error with default 500 status code and message', () => {
      const err = new Error();
      const req = { method: 'GET', originalUrl: '/api/v1/unknown' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Error interno en la API',
            statusCode: 500,
            details: null
          })
        })
      );
      loggerSpy.mockRestore();
    });
  });

  describe('auth.middleware.js', () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = {};
      next = jest.fn();
    });

    test('authenticateUser: missing authorization header without x-user-role header should set default Visitante req.user', () => {
      authenticateUser(req, res, next);
      expect(req.user).toEqual({
        id: 'usr-demo',
        fullName: 'Usuario Demo',
        email: 'demo@raicesvivas.org',
        role: 'Visitante'
      });
      expect(next).toHaveBeenCalledWith();
    });


    test('authenticateUser: missing authorization header with x-user-role header should set req.user', () => {
      req.headers['x-user-role'] = 'Comunidad';
      req.headers['x-user-id'] = 'usr-123';
      req.headers['x-user-name'] = 'Comunidad Test';
      req.headers['x-user-email'] = 'comunidad@test.org';

      authenticateUser(req, res, next);

      expect(req.user).toEqual({
        id: 'usr-123',
        fullName: 'Comunidad Test',
        email: 'comunidad@test.org',
        role: 'Comunidad'
      });
      expect(next).toHaveBeenCalledWith();
    });

    test('authenticateUser: missing authorization header with x-user-role fallback defaults', () => {
      req.headers['x-user-role'] = 'Visitante';

      authenticateUser(req, res, next);

      expect(req.user).toEqual({
        id: 'usr-demo',
        fullName: 'Usuario Demo',
        email: 'demo@raicesvivas.org',
        role: 'Visitante'
      });
      expect(next).toHaveBeenCalledWith();
    });

    test('authenticateUser: authorization header without token should fail', () => {
      req.headers.authorization = 'Bearer';

      authenticateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Formato de token de autorización inválido.');
    });

    test('authenticateUser: valid Bearer token populates req.user', () => {
      const payload = { id: 'usr-456', fullName: 'John Doe', email: 'john@example.com', role: 'Coordinador' };
      const token = jwt.sign(payload, JWT_SECRET);
      req.headers.authorization = `Bearer ${token}`;

      authenticateUser(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('usr-456');
      expect(req.user.role).toBe('Coordinador');
      expect(next).toHaveBeenCalledWith();
    });

    test('authenticateUser: invalid or expired Bearer token should fail with 401', () => {
      req.headers.authorization = 'Bearer invalid_token_xyz';

      authenticateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Token inválido o expirado.');
    });

    test('authorizeRoles: missing req.user should fail with 401', () => {
      const middleware = authorizeRoles('Coordinador');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(401);
    });

    test('authorizeRoles: role not allowed should fail with 403', () => {
      req.user = { role: 'Visitante' };
      const middleware = authorizeRoles('Comunidad', 'Coordinador');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.message).toContain('Su rol actual (Visitante) no tiene permisos');
    });

    test('authorizeRoles: role allowed should call next()', () => {
      req.user = { role: 'Coordinador' };
      const middleware = authorizeRoles('Comunidad', 'Coordinador');
      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
