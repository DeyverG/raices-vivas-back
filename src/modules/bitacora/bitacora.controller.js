const bitacoraService = require('../../services/bitacora.service');

class BitacoraController {
  async getLogs(req, res, next) {
    try {
      const logs = await bitacoraService.getAuditLogs();
      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BitacoraController();

