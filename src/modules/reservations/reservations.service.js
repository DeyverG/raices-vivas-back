const reservationsRepository = require('./reservations.repository');
const experiencesRepository = require('../experiences/experiences.repository');
const { ApiError } = require('../../middlewares/error.middleware');
const { recordAuditLog } = require('../../services/bitacora.service');
const { sendEmailWithRetry } = require('../../services/email.service');

class ReservationsService {
  async getReservations(user) {
    return await reservationsRepository.findAll(user);
  }

  async getReservationById(id) {
    const res = await reservationsRepository.findById(id);
    if (!res) {
      throw ApiError.notFound(`Reserva con ID ${id} no encontrada.`);
    }
    return res;
  }

  /**
   * Request a new reservation (HU-01-03).
   * Validates authentication & future visit date.
   */
  async createReservation(payload, user) {
    const { experienceId, visitDate, travelersCount, specialRequests } = payload;

    if (!experienceId || !visitDate || !travelersCount) {
      throw ApiError.badRequest('ID de la experiencia, fecha de visita y cantidad de viajeros son obligatorios.');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (visitDate < todayStr) {
      throw ApiError.badRequest('La fecha de la reserva debe ser posterior o igual al día de hoy.');
    }

    const exp = await experiencesRepository.findById(experienceId);
    if (!exp) {
      throw ApiError.notFound(`La experiencia solicitada no existe.`);
    }

    const count = parseInt(travelersCount);
    if (count < 1 || count > (exp.max_capacity || exp.maxCapacity || 50)) {
      throw ApiError.badRequest(`La cantidad de viajeros debe estar entre 1 y ${exp.max_capacity || 50}.`);
    }

    const totalPrice = Number(exp.price) * count;

    const createdRes = await reservationsRepository.create({
      experienceId,
      experienceTitle: exp.title,
      visitorId: user.id,
      visitorName: user.fullName,
      visitorEmail: user.email,
      hostCommunity: exp.host_community || exp.hostCommunity,
      visitDate,
      travelersCount: count,
      totalPrice,
      specialRequests
    });

    // 1. Bitácora Audit Log (RNF-010)
    await recordAuditLog({
      entityId: createdRes.id,
      entityType: 'Reserva',
      userIdentifier: `${user.fullName} (${user.role})`,
      action: 'SOLICITUD_RESERVA_CREADA',
      details: `Solicitud de reserva en estado Pendiente enviada para la experiencia "${exp.title}" el ${visitDate} para ${count} persona(s). Total: $${totalPrice.toLocaleString('es-CO')} COP.`
    });

    // 2. Email Notification with Retries (HU-05-01)
    await sendEmailWithRetry({
      recipient: exp.host_community || 'comunidad@raicesvivas.org',
      subject: `Nueva Solicitud de Reserva [${createdRes.id}] - Raíces Vivas`,
      body: `Hola ${exp.host_community}, el viajero ${user.fullName} ha solicitado una reserva para "${exp.title}" el ${visitDate} para ${count} personas.`
    });

    return createdRes;
  }

  /**
   * Confirm or reject reservation (HU-02-03).
   */
  async updateReservationStatus(id, newStatus, actorUser) {
    if (!['confirmada', 'rechazada'].includes(newStatus)) {
      throw ApiError.badRequest('El estado de la reserva debe ser "confirmada" o "rechazada".');
    }

    const res = await reservationsRepository.findById(id);
    if (!res) {
      throw ApiError.notFound(`Reserva con ID ${id} no encontrada.`);
    }

    const updated = await reservationsRepository.updateStatus(id, newStatus);

    // 1. Bitácora Audit Log (RNF-010)
    await recordAuditLog({
      entityId: id,
      entityType: 'Reserva',
      userIdentifier: `${actorUser.fullName} (${actorUser.role})`,
      action: `RESERVA_${newStatus.toUpperCase()}`,
      details: `Solicitud de reserva ${id} fue ${newStatus.toUpperCase()} por la comunidad anfitriona.`
    });

    // 2. Email Notification with Retries (HU-05-01)
    await sendEmailWithRetry({
      recipient: res.visitor_email || res.visitorEmail || 'viajero@raicesvivas.org',
      subject: `Actualización de Estado de Reserva [${id}] - Raíces Vivas`,
      body: `Hola ${res.visitor_name || res.visitorName}, tu reserva para "${res.experience_title || res.experienceTitle}" ha sido ${newStatus.toUpperCase()} por la comunidad anfitriona.`
    });

    return updated;
  }
}

module.exports = new ReservationsService();
