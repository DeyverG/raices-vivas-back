const reservationsService = require('./reservations.service');

class ReservationsController {
  async getAll(req, res, next) {
    try {
      const result = await reservationsService.getReservations(req.user);
      res.status(200).json({
        success: true,
        count: result.length,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await reservationsService.getReservationById(req.params.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const result = await reservationsService.createReservation(req.body, req.user);
      res.status(201).json({
        success: true,
        message: 'Solicitud de reserva enviada en estado pendiente.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const result = await reservationsService.updateReservationStatus(req.params.id, status, req.user);
      res.status(200).json({
        success: true,
        message: `Reserva ${req.params.id} fue actualizada a estado ${status}.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async confirm(req, res, next) {
    try {
      const result = await reservationsService.updateReservationStatus(req.params.id, 'confirmada', req.user);
      res.status(200).json({
        success: true,
        message: `Reserva ${req.params.id} confirmada exitosamente.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async reject(req, res, next) {
    try {
      const result = await reservationsService.updateReservationStatus(req.params.id, 'rechazada', req.user);
      res.status(200).json({
        success: true,
        message: `Reserva ${req.params.id} fue rechazada.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReservationsController();
