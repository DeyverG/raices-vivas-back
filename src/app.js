const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

const authRoutes = require('./modules/auth/auth.routes');
const experiencesRoutes = require('./modules/experiences/experiences.routes');
const reservationsRoutes = require('./modules/reservations/reservations.routes');
const bitacoraRoutes = require('./modules/bitacora/bitacora.routes');

const { errorHandler, ApiError } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`HTTP ${req.method} ${req.url}`);
  next();
});

// Swagger API Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/experiences', experiencesRoutes);
app.use('/api/v1/reservations', reservationsRoutes);
app.use('/api/v1/audit-log', bitacoraRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Raíces Vivas REST API',
    documentation: '/api-docs',
    health: '/health',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Raíces Vivas REST API',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`La ruta ${req.originalUrl} no existe en esta API.`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
