const { Router } = require('express');
const authController = require('./auth.controller');
const { authenticateUser } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @route POST /api/v1/auth/register
 * @desc Registers a new user (Visitante, Comunidad, Coordinador)
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticates user and returns JWT token
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route GET /api/v1/auth/me
 * @desc Returns profile of authenticated user
 */
router.get('/me', authenticateUser, (req, res, next) => authController.me(req, res, next));

module.exports = router;
