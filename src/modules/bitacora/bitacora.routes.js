const { Router } = require('express');
const bitacoraController = require('./bitacora.controller');
const { authenticateUser } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @route GET /api/v1/audit-log
 * @desc Get immutable Bitácora audit trace entries (RNF-010)
 */
router.get('/', (req, res, next) => bitacoraController.getLogs(req, res, next));

module.exports = router;
