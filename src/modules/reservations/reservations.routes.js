const { Router } = require('express');
const reservationsController = require('./reservations.controller');
const { authenticateUser, authorizeRoles } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @route GET /api/v1/reservations
 * @desc Get reservation list (Filtered by visitor or full list for community)
 */
router.get('/', authenticateUser, (req, res, next) => reservationsController.getAll(req, res, next));

/**
 * @route GET /api/v1/reservations/:id
 * @desc Get reservation details
 */
router.get('/:id', authenticateUser, (req, res, next) => reservationsController.getById(req, res, next));

/**
 * @route POST /api/v1/reservations
 * @desc Request a new reservation (Visitor / Authenticated User)
 */
router.post(
  '/',
  authenticateUser,
  authorizeRoles('Visitante', 'Comunidad', 'Coordinador'),
  (req, res, next) => reservationsController.create(req, res, next)
);

/**
 * @route PATCH /api/v1/reservations/:id/status
 * @desc Update status of a reservation
 */
router.patch(
  '/:id/status',
  authenticateUser,
  authorizeRoles('Comunidad', 'Coordinador'),
  (req, res, next) => reservationsController.updateStatus(req, res, next)
);

/**
 * @route POST /api/v1/reservations/:id/confirm
 * @desc Confirm reservation (Host Community)
 */
router.post(
  '/:id/confirm',
  authenticateUser,
  authorizeRoles('Comunidad', 'Coordinador'),
  (req, res, next) => reservationsController.confirm(req, res, next)
);

/**
 * @route POST /api/v1/reservations/:id/reject
 * @desc Reject reservation (Host Community)
 */
router.post(
  '/:id/reject',
  authenticateUser,
  authorizeRoles('Comunidad', 'Coordinador'),
  (req, res, next) => reservationsController.reject(req, res, next)
);

module.exports = router;
