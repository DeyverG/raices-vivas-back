require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await db.testConnection();


  app.listen(PORT, () => {
    logger.info(`=============================================================`);
    logger.info(`🚀 Servidor API REST Raíces Vivas escuchando en puerto ${PORT}`);
    logger.info(`📄 Documentación Swagger OpenAPI disponible en http://localhost:${PORT}/api-docs`);
    logger.info(`=============================================================`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
