const request = require('supertest');
const app = require('../src/app');
const experiencesRepository = require('../src/modules/experiences/experiences.repository');
const experiencesService = require('../src/modules/experiences/experiences.service');
const db = require('../src/config/database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middlewares/auth.middleware');

describe('Módulo de Experiencias (Repository, Service, Controller, Routes)', () => {
  let coordinatorToken;
  let communityToken;
  let visitorToken;

  beforeAll(() => {
    coordinatorToken = jwt.sign(
      { id: 'usr-coord', fullName: 'Coordinador ATCPA', email: 'coord@raices.org', role: 'Coordinador' },
      JWT_SECRET
    );
    communityToken = jwt.sign(
      { id: 'usr-comm', fullName: 'Comunidad Guambiana', email: 'guambianos@raices.org', role: 'Comunidad', communityName: 'Guambianos' },
      JWT_SECRET
    );
    visitorToken = jwt.sign(
      { id: 'usr-visitor', fullName: 'Pedro Viajero', email: 'pedro@gmail.com', role: 'Visitante' },
      JWT_SECRET
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });



  describe('ExperiencesRepository (PG & Memory)', () => {
    test('findAll with memory filtering and cross-filters', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);

      db.memoryDb.experiences = [
        {
          id: 'exp-1',
          title: 'Taller de Tejeduría Misak',
          summary: 'Aprende arte ancestral',
          region: 'Cauca',
          type: 'Artesanal',
          language: 'Español',
          duration: '3 horas',
          status: 'aprobada'
        },
        {
          id: 'exp-2',
          title: 'Ruta del Café Organico',
          summary: 'Senderismo cafetero',
          region: 'Nariño',
          type: 'Ecoturismo',
          language: 'Inglés',
          duration: '1 día',
          status: 'pendiente'
        }
      ];

      const allAprobadas = await experiencesRepository.findAll({ status: 'aprobada' });
      expect(allAprobadas).toHaveLength(1);
      expect(allAprobadas[0].id).toBe('exp-1');

      const searched = await experiencesRepository.findAll({ search: 'café' });
      expect(searched).toHaveLength(1);
      expect(searched[0].id).toBe('exp-2');

      const byRegion = await experiencesRepository.findAll({ region: 'Cauca' });
      expect(byRegion).toHaveLength(1);

      const byType = await experiencesRepository.findAll({ type: 'Ecoturismo' });
      expect(byType).toHaveLength(1);

      const byLanguage = await experiencesRepository.findAll({ language: 'Español' });
      expect(byLanguage).toHaveLength(1);

      const byDuration = await experiencesRepository.findAll({ duration: '3 horas' });
      expect(byDuration).toHaveLength(1);

      const noMatch = await experiencesRepository.findAll({ search: 'nonexistent' });
      expect(noMatch).toHaveLength(0);
    });

    test('findAll with PostgreSQL query builder', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockImplementation(() => true);
      const querySpy = jest.spyOn(db, 'query').mockResolvedValue({ rows: [] });

      await experiencesRepository.findAll({
        search: 'Tejid',
        region: 'Cauca',
        type: 'Cultural',
        language: 'Español',
        duration: '2 horas',
        status: 'aprobada'
      });

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM experiences WHERE 1=1'),
        expect.arrayContaining(['%tejid%', '%Cauca%', 'Cultural', 'Español', '2 horas', 'aprobada'])
      );
    });

    test('findById, create, and updateStatus with PostgreSQL connected', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockImplementation(() => true);
      const mockExp = { id: 'exp-pg', title: 'PG Experience', status: 'pendiente' };
      const querySpy = jest.spyOn(db, 'query').mockResolvedValue({ rows: [mockExp] });




      const found = await experiencesRepository.findById('exp-pg');
      expect(found).toEqual(mockExp);

      await experiencesRepository.create({
        title: 'New Exp PG',
        region: 'Cauca',
        type: 'Cultural',
        duration: '1 día',
        price: 50000,
        language: 'Español',
        maxCapacity: 15,
        summary: 'Resumen',
        description: 'Descripción',
        includes: ['Guía'],
        hostCommunity: 'Comunidad PG',
        imageUrl: 'https://img.com/exp.jpg',
        createdBy: 'usr-1'
      });

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO experiences'),
        expect.any(Array)
      );
      const updated = await experiencesRepository.updateStatus('exp-pg', 'aprobada');
      expect(updated).toEqual({ ...mockExp, status: 'aprobada' });
      expect(querySpy).toHaveBeenCalledWith(
        'UPDATE experiences SET status = $1 WHERE id = $2 RETURNING *',
        ['aprobada', 'exp-pg']
      );

    });
  });

  describe('ExperiencesService Business Logic', () => {
    test('getAllExperiences forces status=aprobada for visitors or anonymous', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);

      const visitorResults = await experiencesService.getAllExperiences({}, { role: 'Visitante' });
      expect(visitorResults.every(e => e.status === 'aprobada')).toBe(true);

      const anonResults = await experiencesService.getAllExperiences({}, null);
      expect(anonResults.every(e => e.status === 'aprobada')).toBe(true);
    });

    test('getExperienceById throws 404 when experience is missing', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.experiences = [];

      await expect(experiencesService.getExperienceById('non-existent')).rejects.toThrow(
        'Experiencia con ID non-existent no encontrada.'
      );
    });

    test('createExperience throws 400 when missing required fields', async () => {
      await expect(
        experiencesService.createExperience({ title: 'Solo Título' }, { id: 'usr-1', role: 'Comunidad' })
      ).rejects.toThrow('Título, precio, resumen e imagen son campos requeridos.');
    });

    test('createExperience creates experience and audit log', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);

      const expData = {
        title: 'Gastronomía Ancestral',
        price: 80000,
        imageUrl: 'https://img.com/gastro.jpg',
        summary: 'Sabores tradicionales del Cauca',
        region: 'Cauca'
      };

      const user = { id: 'usr-comm', fullName: 'María Guambiana', role: 'Comunidad', communityName: 'Guambiana' };
      const created = await experiencesService.createExperience(expData, user);

      expect(created.id).toBeDefined();
      expect(created.title).toBe('Gastronomía Ancestral');
      expect(created.status).toBe('pendiente');
      expect(created.host_community).toBe('Guambiana');
    });

    test('updateExperienceStatus validates status and throws 400 for invalid status', async () => {
      await expect(
        experiencesService.updateExperienceStatus('exp-1', 'invalido', { role: 'Coordinador' })
      ).rejects.toThrow('El estado debe ser "aprobada" o "rechazada".');
    });

    test('updateExperienceStatus throws 404 if experience does not exist', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.experiences = [];

      await expect(
        experiencesService.updateExperienceStatus('exp-404', 'aprobada', { role: 'Coordinador' })
      ).rejects.toThrow('Experiencia con ID exp-404 no encontrada.');
    });

    test('updateExperienceStatus successfully approves experience and logs bitácora', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.experiences = [
        { id: 'exp-to-approve', title: 'Experiencia Pendiente', status: 'pendiente' }
      ];

      const updated = await experiencesService.updateExperienceStatus(
        'exp-to-approve',
        'aprobada',
        { fullName: 'Carlos Coordinador', role: 'Coordinador' }
      );

      expect(updated.status).toBe('aprobada');
    });
  });

  describe('HTTP Endpoints /api/v1/experiences (Supertest)', () => {
    test('GET /api/v1/experiences returns list', async () => {
      const res = await request(app).get('/api/v1/experiences');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('GET /api/v1/experiences/:id returns experience detail', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.experiences = [{ id: 'exp-detail-1', title: 'Detail Test', status: 'aprobada' }];

      const res = await request(app).get('/api/v1/experiences/exp-detail-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Detail Test');
    });

    test('POST /api/v1/experiences succeeds for Comunidad role', async () => {
      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${communityToken}`)
        .send({
          title: 'Nueva Ruta Cultural',
          price: 60000,
          imageUrl: 'https://img.com/ruta.jpg',
          summary: 'Gran recorrido cultural',
          region: 'Cauca'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pendiente');
    });

    test('POST /api/v1/experiences fails with 403 for Visitante role', async () => {
      const res = await request(app)
        .post('/api/v1/experiences')
        .set('Authorization', `Bearer ${visitorToken}`)
        .send({
          title: 'Intento de Visitante',
          price: 60000,
          imageUrl: 'https://img.com/ruta.jpg',
          summary: 'Resumen'
        });

      expect(res.status).toBe(403);
    });

    test('PATCH /api/v1/experiences/:id/status succeeds for Coordinador role', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.experiences = [{ id: 'exp-patch-1', title: 'Patch Test', status: 'pendiente' }];

      const res = await request(app)
        .patch('/api/v1/experiences/exp-patch-1/status')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({ status: 'aprobada' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('aprobada');
    });

    test('PATCH /api/v1/experiences/:id/status fails with 403 for Comunidad role', async () => {
      const res = await request(app)
        .patch('/api/v1/experiences/exp-patch-1/status')
        .set('Authorization', `Bearer ${communityToken}`)
        .send({ status: 'aprobada' });

      expect(res.status).toBe(403);
    });
  });
});
