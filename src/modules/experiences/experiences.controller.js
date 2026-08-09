const experiencesService = require('./experiences.service');

class ExperiencesController {
  async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        region: req.query.region,
        type: req.query.type,
        language: req.query.language,
        duration: req.query.duration,
        status: req.query.status
      };
      const result = await experiencesService.getAllExperiences(filters, req.user);
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
      const result = await experiencesService.getExperienceById(req.params.id);
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
      const result = await experiencesService.createExperience(req.body, req.user);
      res.status(201).json({
        success: true,
        message: 'Experiencia registrada y enviada para aprobación.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const result = await experiencesService.updateExperienceStatus(req.params.id, status, req.user);
      res.status(200).json({
        success: true,
        message: `Estado de la experiencia actualizado a ${status}.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExperiencesController();
