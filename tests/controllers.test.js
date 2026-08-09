const authController = require('../src/modules/auth/auth.controller');
const authService = require('../src/modules/auth/auth.service');

const experiencesController = require('../src/modules/experiences/experiences.controller');
const experiencesService = require('../src/modules/experiences/experiences.service');

const reservationsController = require('../src/modules/reservations/reservations.controller');
const reservationsService = require('../src/modules/reservations/reservations.service');

const bitacoraController = require('../src/modules/bitacora/bitacora.controller');
const bitacoraService = require('../src/services/bitacora.service');

describe('Controllers Exception Catch Block Coverage', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.restoreAllMocks();
  });

  describe('AuthController Error Catching', () => {
    test('register calls next(err) on error', async () => {
      const err = new Error('Register error');
      jest.spyOn(authService, 'register').mockRejectedValue(err);
      await authController.register(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('login calls next(err) on error', async () => {
      const err = new Error('Login error');
      jest.spyOn(authService, 'login').mockRejectedValue(err);
      await authController.login(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('me calls next(err) on error', async () => {
      const errorRes = {
        status: jest.fn().mockImplementation(() => {
          throw new Error('Response error');
        })
      };
      await authController.me(req, errorRes, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('ExperiencesController Error Catching', () => {
    test('getAll calls next(err) on error', async () => {
      const err = new Error('GetAll error');
      jest.spyOn(experiencesService, 'getAllExperiences').mockRejectedValue(err);
      await experiencesController.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('getById calls next(err) on error', async () => {
      const err = new Error('GetById error');
      jest.spyOn(experiencesService, 'getExperienceById').mockRejectedValue(err);
      await experiencesController.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('create calls next(err) on error', async () => {
      const err = new Error('Create error');
      jest.spyOn(experiencesService, 'createExperience').mockRejectedValue(err);
      await experiencesController.create(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('updateStatus calls next(err) on error', async () => {
      const err = new Error('UpdateStatus error');
      jest.spyOn(experiencesService, 'updateExperienceStatus').mockRejectedValue(err);
      await experiencesController.updateStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('ReservationsController Error Catching', () => {
    test('getAll calls next(err) on error', async () => {
      const err = new Error('GetAll error');
      jest.spyOn(reservationsService, 'getReservations').mockRejectedValue(err);
      await reservationsController.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('getById calls next(err) on error', async () => {
      const err = new Error('GetById error');
      jest.spyOn(reservationsService, 'getReservationById').mockRejectedValue(err);
      await reservationsController.getById(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('create calls next(err) on error', async () => {
      const err = new Error('Create error');
      jest.spyOn(reservationsService, 'createReservation').mockRejectedValue(err);
      await reservationsController.create(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('updateStatus calls next(err) on error', async () => {
      const err = new Error('UpdateStatus error');
      jest.spyOn(reservationsService, 'updateReservationStatus').mockRejectedValue(err);
      await reservationsController.updateStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('confirm calls next(err) on error', async () => {
      const err = new Error('Confirm error');
      jest.spyOn(reservationsService, 'updateReservationStatus').mockRejectedValue(err);
      await reservationsController.confirm(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    test('reject calls next(err) on error', async () => {
      const err = new Error('Reject error');
      jest.spyOn(reservationsService, 'updateReservationStatus').mockRejectedValue(err);
      await reservationsController.reject(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('BitacoraController Error Catching', () => {
    test('getLogs calls next(err) on error', async () => {
      const err = new Error('Bitacora service error');
      jest.spyOn(bitacoraService, 'getAuditLogs').mockRejectedValue(err);
      await bitacoraController.getLogs(req, res, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
