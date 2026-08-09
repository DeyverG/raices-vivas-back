const request = require('supertest');
const app = require('../src/app');
const reservationsRepository = require('../src/modules/reservations/reservations.repository');
const reservationsService = require('../src/modules/reservations/reservations.service');
const experiencesRepository = require('../src/modules/experiences/experiences.repository');
const db = require('../src/config/database');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middlewares/auth.middleware');

describe('Módulo de Reservas (Repository, Service, Controller, Routes)', () => {
  let visitorUser;
  let visitorToken;
  let communityToken;

  beforeAll(() => {
    visitorUser = { id: 'usr-vis-1', fullName: 'Juan Viajero', email: 'juan@viajero.com', role: 'Visitante' };
    visitorToken = jwt.sign(visitorUser, JWT_SECRET);
    communityToken = jwt.sign(
      { id: 'usr-comm-1', fullName: 'Comunidad Misak', email: 'misak@raices.org', role: 'Comunidad' },
      JWT_SECRET
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ReservationsRepository (PG & Memory)', () => {
    test('findAll filtering for Visitante vs all for Community in memory', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.reservations = [
        { id: 'RES-1', visitor_id: 'usr-vis-1', visitor_email: 'juan@viajero.com' },
        { id: 'RES-2', visitor_id: 'usr-other', visitor_email: 'other@viajero.com' }
      ];

      const visitorRes = await reservationsRepository.findAll(visitorUser);
      expect(visitorRes).toHaveLength(1);
      expect(visitorRes[0].id).toBe('RES-1');

      const allRes = await reservationsRepository.findAll({ role: 'Comunidad' });
      expect(allRes).toHaveLength(2);
    });

    test('findAll, findById, create, and updateStatus with PostgreSQL connected', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockImplementation(() => true);
      const mockResRecord = { id: 'RES-PG', experience_id: 'exp-1', visitor_id: 'usr-vis-1' };
      const querySpy = jest.spyOn(db, 'query').mockResolvedValue({ rows: [mockResRecord] });




      const allPg = await reservationsRepository.findAll(visitorUser);
      expect(allPg).toEqual([mockResRecord]);
      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM reservations WHERE visitor_id = $1'),
        ['usr-vis-1']
      );

      const updated = await reservationsRepository.updateStatus('RES-PG', 'confirmada');
      expect(updated).toEqual({ ...mockResRecord, status: 'confirmada' });

      const found = await reservationsRepository.findById('RES-PG');
      expect(found).toEqual(mockResRecord);

      await reservationsRepository.create({
        experienceId: 'exp-1',
        experienceTitle: 'Exp PG',
        visitorId: 'usr-vis-1',
        visitorName: 'Juan',
        visitorEmail: 'juan@test.com',
        hostCommunity: 'Community PG',
        visitDate: '2026-10-10',
        travelersCount: 2,
        totalPrice: 100000,
        specialRequests: 'Ninguna'
      });

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO reservations'),
        expect.any(Array)
      );

      await reservationsRepository.updateStatus('RES-PG', 'confirmada');
      expect(querySpy).toHaveBeenCalledWith(
        'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
        ['confirmada', 'RES-PG']
      );

    });
  });

  describe('ReservationsService Business Logic', () => {
    test('getReservationById throws 404 if missing', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.reservations = [];

      await expect(reservationsService.getReservationById('RES-404')).rejects.toThrow(
        'Reserva con ID RES-404 no encontrada.'
      );
    });

    test('createReservation throws 400 when missing fields', async () => {
      await expect(reservationsService.createReservation({}, visitorUser)).rejects.toThrow(
        'ID de la experiencia, fecha de visita y cantidad de viajeros son obligatorios.'
      );
    });

    test('createReservation throws 400 when visitDate is in the past', async () => {
      await expect(
        reservationsService.createReservation(
          { experienceId: 'exp-1', visitDate: '2020-01-01', travelersCount: 2 },
          visitorUser
        )
      ).rejects.toThrow('La fecha de la reserva debe ser posterior o igual al día de hoy.');
    });

    test('createReservation throws 404 if experience does not exist', async () => {
      jest.spyOn(experiencesRepository, 'findById').mockResolvedValue(null);

      const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

      await expect(
        reservationsService.createReservation(
          { experienceId: 'exp-missing', visitDate: futureDate, travelersCount: 2 },
          visitorUser
        )
      ).rejects.toThrow('La experiencia solicitada no existe.');
    });

    test('createReservation throws 400 if travelersCount exceeds capacity or is invalid', async () => {
      jest.spyOn(experiencesRepository, 'findById').mockResolvedValue({
        id: 'exp-cap',
        title: 'Cap Test',
        price: 50000,
        max_capacity: 5
      });

      const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

      await expect(
        reservationsService.createReservation(
          { experienceId: 'exp-cap', visitDate: futureDate, travelersCount: 10 },
          visitorUser
        )
      ).rejects.toThrow('La cantidad de viajeros debe estar entre 1 y 5.');

    });

    test('createReservation succeeds and creates reservation', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      jest.spyOn(experiencesRepository, 'findById').mockResolvedValue({
        id: 'exp-ok',
        title: 'Ruta Ancestral',
        price: 40000,
        max_capacity: 10,
        host_community: 'Misak'
      });

      const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

      const res = await reservationsService.createReservation(
        { experienceId: 'exp-ok', visitDate: futureDate, travelersCount: 3, specialRequests: 'Vegetariano' },
        visitorUser
      );

      expect(res.id).toBeDefined();
      expect(res.total_price).toBe(120000);
      expect(res.status).toBe('pendiente');
    });

    test('updateReservationStatus validates status and updates state', async () => {
      await expect(
        reservationsService.updateReservationStatus('RES-1', 'invalid', visitorUser)
      ).rejects.toThrow('El estado de la reserva debe ser "confirmada" o "rechazada".');

      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.reservations = [];
      await expect(
        reservationsService.updateReservationStatus('RES-MISSING', 'confirmada', visitorUser)
      ).rejects.toThrow('Reserva con ID RES-MISSING no encontrada.');

      db.memoryDb.reservations = [
        { id: 'RES-VALID', experience_title: 'Exp Title', visitor_name: 'Juan', visitor_email: 'juan@test.com', status: 'pendiente' }
      ];

      const updated = await reservationsService.updateReservationStatus(
        'RES-VALID',
        'confirmada',
        { fullName: 'Líder Misak', role: 'Comunidad' }
      );

      expect(updated.status).toBe('confirmada');
    });
  });

  describe('HTTP Endpoints /api/v1/reservations (Supertest)', () => {
    test('GET /api/v1/reservations list and detail', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.reservations = [
        { id: 'RES-HTTP-1', visitor_id: visitorUser.id, status: 'pendiente' }
      ];

      const listRes = await request(app)
        .get('/api/v1/reservations')
        .set('Authorization', `Bearer ${visitorToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);

      const detailRes = await request(app)
        .get('/api/v1/reservations/RES-HTTP-1')
        .set('Authorization', `Bearer ${visitorToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.id).toBe('RES-HTTP-1');
    });

    test('POST /api/v1/reservations creates reservation', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.experiences = [
        { id: 'exp-res-test', title: 'Exp Res Test', price: 50000, max_capacity: 10, status: 'aprobada' }
      ];

      const futureDate = new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0];

      const res = await request(app)
        .post('/api/v1/reservations')
        .set('Authorization', `Bearer ${visitorToken}`)
        .send({
          experienceId: 'exp-res-test',
          visitDate: futureDate,
          travelersCount: 2
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pendiente');
    });

    test('PATCH /api/v1/reservations/:id/status updates status', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.reservations = [
        { id: 'RES-PATCH-1', visitor_id: visitorUser.id, status: 'pendiente' }
      ];

      const res = await request(app)
        .patch('/api/v1/reservations/RES-PATCH-1/status')
        .set('Authorization', `Bearer ${communityToken}`)
        .send({ status: 'confirmada' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmada');
    });

    test('POST /api/v1/reservations/:id/confirm & /reject endpoints', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      db.memoryDb.reservations = [
        { id: 'RES-CONFIRM-1', visitor_id: visitorUser.id, status: 'pendiente' },
        { id: 'RES-REJECT-1', visitor_id: visitorUser.id, status: 'pendiente' }
      ];

      const confirmRes = await request(app)
        .post('/api/v1/reservations/RES-CONFIRM-1/confirm')
        .set('Authorization', `Bearer ${communityToken}`);

      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.status).toBe('confirmada');

      const rejectRes = await request(app)
        .post('/api/v1/reservations/RES-REJECT-1/reject')
        .set('Authorization', `Bearer ${communityToken}`);

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.status).toBe('rechazada');
    });
  });
});
