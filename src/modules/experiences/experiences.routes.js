const { Router } = require('express');
const experiencesController = require('./experiences.controller');
const { authenticateUser, authorizeRoles } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @route GET /api/v1/experiences
 * @desc Get catalog of experiences with cross-filtering
 */
router.get('/', (req, res, next) => experiencesController.getAll(req, res, next));

/**
 * @route GET /api/v1/experiences/:id
 * @desc Get full detail of an experience by ID
 */
router.get('/:id', (req, res, next) => experiencesController.getById(req, res, next));

/**
 * @route POST /api/v1/experiences
 * @desc Publish a new experience (Host Community / Coordinator only)
 */
router.post(
  '/',
  authenticateUser,
  authorizeRoles('Comunidad', 'Coordinador'),
  (req, res, next) => experiencesController.create(req, res, next)
);

/**
 * @route PATCH /api/v1/experiences/:id/status
 * @desc Approve or reject experience (Coordinador ATCPA only)
 */
router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('Coordinador'),
  (req, res, next) => experiencesController.updateStatus(req, res, next)
);

module.exports = router;
