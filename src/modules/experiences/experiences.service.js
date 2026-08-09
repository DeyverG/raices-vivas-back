const experiencesRepository = require('./experiences.repository');
const { ApiError } = require('../../middlewares/error.middleware');
const { recordAuditLog } = require('../../services/bitacora.service');

class ExperiencesService {
  async getAllExperiences(filters, user) {
    // If visitor or public, show approved experiences. If coordinator/host community, allow seeing all
    if (!user || user.role === 'Visitante') {
      filters.status = 'aprobada';
    }
    return await experiencesRepository.findAll(filters);
  }

  async getExperienceById(id) {
    const exp = await experiencesRepository.findById(id);
    if (!exp) {
      throw ApiError.notFound(`Experiencia con ID ${id} no encontrada.`);
    }
    return exp;
  }

  async createExperience(expData, user) {
    if (!expData.title || !expData.price || !expData.imageUrl || !expData.summary) {
      throw ApiError.badRequest('Título, precio, resumen e imagen son campos requeridos.');
    }

    const hostCommunity = user.communityName || user.fullName || expData.hostCommunity || 'Comunidad Anfitriona';

    const created = await experiencesRepository.create({
      ...expData,
      hostCommunity,
      createdBy: user.id
    });

    // Record audit log entry in Bitácora (RNF-010)
    await recordAuditLog({
      entityId: created.id,
      entityType: 'Experiencia',
      userIdentifier: `${user.fullName} (${user.role})`,
      action: 'NUEVA_EXPERIENCIA_PUBLICADA',
      details: `Propuesta de experiencia "${created.title}" registrada en estado Pendiente de Aprobación.`
    });

    return created;
  }

  async updateExperienceStatus(id, newStatus, coordinatorUser) {
    if (!['aprobada', 'rechazada'].includes(newStatus)) {
      throw ApiError.badRequest('El estado debe ser "aprobada" o "rechazada".');
    }

    const exp = await experiencesRepository.findById(id);
    if (!exp) {
      throw ApiError.notFound(`Experiencia con ID ${id} no encontrada.`);
    }

    const updated = await experiencesRepository.updateStatus(id, newStatus);

    // Record audit log entry in Bitácora (RNF-010)
    await recordAuditLog({
      entityId: id,
      entityType: 'Experiencia',
      userIdentifier: `${coordinatorUser.fullName} (${coordinatorUser.role})`,
      action: `EXPERIENCIA_${newStatus.toUpperCase()}`,
      details: `La experiencia "${exp.title}" fue ${newStatus} por el Coordinador ATCPA.`
    });

    return updated;
  }
}

module.exports = new ExperiencesService();
