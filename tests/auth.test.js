const request = require('supertest');
const app = require('../src/app');
const authRepository = require('../src/modules/auth/auth.repository');
const authService = require('../src/modules/auth/auth.service');
const { hashPasswordSHA256, verifyPasswordSHA256 } = require('../src/utils/crypto');
const db = require('../src/config/database');

describe('Módulo de Autenticación & Cifrado SHA-256 (Completo)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Cifrado de Contraseñas (RNF Seguridad)', () => {
    test('Debe generar un hash SHA-256 hexadecimal de 64 caracteres', () => {
      const password = 'miContraseñaSegura123';
      const hash = hashPasswordSHA256(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
      expect(hash).not.toBe(password);
    });

    test('Debe verificar correctamente una contraseña contra su hash SHA-256', () => {
      const password = 'claveSecreta2026';
      const hash = hashPasswordSHA256(password);

      expect(verifyPasswordSHA256(password, hash)).toBe(true);
      expect(verifyPasswordSHA256('claveIncorrecta', hash)).toBe(false);
    });
  });

  describe('AuthRepository (PG & Memory)', () => {
    test('findByEmail & findById with PostgreSQL connected', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockImplementation(() => true);
      const mockUser = { id: 'usr-1', email: 'pg@test.com', full_name: 'PG User' };
      jest.spyOn(db, 'query').mockResolvedValue({ rows: [mockUser] });

      const foundByEmail = await authRepository.findByEmail('PG@TEST.COM');
      expect(foundByEmail).toEqual(mockUser);

      const foundById = await authRepository.findById('usr-1');
      expect(foundById).toEqual(mockUser);
    });

    test('findById in memory mode', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockImplementation(() => false);
      db.memoryDb.users.push({ id: 'usr-mem-1', email: 'mem@test.com', full_name: 'Mem User' });

      const found = await authRepository.findById('usr-mem-1');
      expect(found).toBeDefined();
      expect(found.id).toBe('usr-mem-1');
    });

    test('createUser with PostgreSQL connected', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockImplementation(() => true);
      const querySpy = jest.spyOn(db, 'query').mockResolvedValue({ rowCount: 1 });


      const created = await authRepository.createUser({
        id: 'usr-pg-create',
        fullName: 'New PG User',
        email: 'newpg@test.com',
        passwordHash: 'hash123',
        role: 'Comunidad',
        communityName: 'Comunidad San Jacinto',
        dataConsent: true
      });

      expect(created.id).toBe('usr-pg-create');
      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.any(Array)
      );
    });
  });

  describe('AuthService Validation & Logic', () => {
    test('Debe rechazar el registro si faltan campos obligatorios', async () => {
      await expect(authService.register({})).rejects.toThrow('Todos los campos obligatorios deben ser diligenciados.');
    });

    test('Debe rechazar el registro si el usuario NO acepta la política de datos (dataConsent: false)', async () => {
      const payload = {
        fullName: 'Test Usuario',
        email: `test_${Date.now()}@ejemplo.com`,
        password: 'password123',
        role: 'Visitante',
        dataConsent: false
      };

      await expect(authService.register(payload)).rejects.toThrow(
        'Debe aceptar explícitamente la Política de Tratamiento de Datos (Ley 1581 de 2012 / RGPD).'
      );
    });

    test('Debe rechazar el registro si el correo ya existe', async () => {
      const email = `duplicado_${Date.now()}@raicesvivas.org`;
      const payload = {
        fullName: 'Usuario 1',
        email,
        password: 'password123',
        role: 'Visitante',
        dataConsent: true
      };
      await authService.register(payload);

      await expect(authService.register(payload)).rejects.toThrow(
        'Ya existe un usuario registrado con este correo electrónico.'
      );
    });

    test('Debe registrar exitosamente un usuario cuando dataConsent es true y cifrar su clave en SHA-256', async () => {
      const email = `usuario_exito_${Date.now()}@raicesvivas.org`;
      const payload = {
        fullName: 'Usuario Prueba Éxito',
        email,
        password: 'password123',
        role: 'Visitante',
        dataConsent: true
      };

      const result = await authService.register(payload);
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.dataConsent).toBe(true);
      expect(result.token).toBeDefined();
    });

    test('Debe rechazar el login si faltan credenciales', async () => {
      await expect(authService.login({})).rejects.toThrow('Por favor ingrese correo electrónico y contraseña.');
    });

    test('Debe rechazar el login si el usuario no existe', async () => {
      await expect(authService.login({ email: 'no_existe@test.com', password: '123' })).rejects.toThrow(
        'Credenciales inválidas. Verifique su correo y contraseña.'
      );
    });

    test('Debe rechazar el login si la contraseña es incorrecta', async () => {
      const email = `login_wrong_pass_${Date.now()}@raicesvivas.org`;
      await authService.register({
        fullName: 'Login Test',
        email,
        password: 'correctPassword',
        role: 'Visitante',
        dataConsent: true
      });

      await expect(authService.login({ email, password: 'wrongPassword' })).rejects.toThrow(
        'Credenciales inválidas. Verifique su correo y contraseña.'
      );
    });

    test('Debe autenticar exitosamente y retornar token JWT', async () => {
      const email = `login_success_${Date.now()}@raicesvivas.org`;
      await authService.register({
        fullName: 'Login Success',
        email,
        password: 'correctPassword',
        role: 'Visitante',
        dataConsent: true
      });

      const res = await authService.login({ email, password: 'correctPassword' });
      expect(res.user.email).toBe(email);
      expect(res.token).toBeDefined();
    });
  });

  describe('HTTP Endpoints /api/v1/auth (Supertest)', () => {
    test('POST /api/v1/auth/register success', async () => {
      const email = `http_reg_${Date.now()}@raicesvivas.org`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'HTTP User',
          email,
          password: 'password123',
          role: 'Visitante',
          dataConsent: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('POST /api/v1/auth/login success', async () => {
      const email = `http_login_${Date.now()}@raicesvivas.org`;
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'HTTP User Login',
          email,
          password: 'password123',
          role: 'Visitante',
          dataConsent: true
        });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('GET /api/v1/auth/me success with token', async () => {
      const email = `http_me_${Date.now()}@raicesvivas.org`;
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'HTTP User Me',
          email,
          password: 'password123',
          role: 'Visitante',
          dataConsent: true
        });

      const token = regRes.body.data.token;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(email);
    });

    test('GET /api/v1/auth/me without token returns default demo user profile', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('Visitante');
    });

  });
});
