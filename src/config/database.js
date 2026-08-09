const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../utils/logger');
const { hashPasswordSHA256 } = require('../utils/crypto');

// PostgreSQL Pool configuration
const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

const poolConfig = connectionString ? {
  connectionString,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
} : {
  host: process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : (process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432),
  user: process.env.POSTGRES_USER || process.env.PGUSER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD || 'postgres',
  database: process.env.POSTGRES_DATABASE || process.env.PGDATABASE || 'raices_vivas_db',
  ssl: (process.env.POSTGRES_HOST || process.env.PGHOST) &&
       (process.env.POSTGRES_HOST !== 'localhost' && process.env.PGHOST !== 'localhost') &&
       process.env.PGSSL !== 'false'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};

let dbPool = null;
// Default to true if a production connection string or remote host is provided so repositories route queries to PostgreSQL
let isPgConnected = Boolean(connectionString || (process.env.POSTGRES_HOST && process.env.POSTGRES_HOST !== 'localhost'));

try {
  dbPool = new Pool(poolConfig);
  dbPool.on('error', (err) => {
    logger.warn('Error inesperado en cliente inactivo de PostgreSQL:', err.message);
  });
} catch (err) {
  logger.warn('No se pudo instanciar la piscina de PostgreSQL:', err.message);
  isPgConnected = false;
}

// Automatically verify connection on load if pool exists (skipped during Jest tests)
if (dbPool && process.env.NODE_ENV !== 'test') {
  testConnection().catch(() => {});
}

// In-Memory Store limpiado para que el backend opere 100% sobre PostgreSQL / datos reales
const memoryDb = {
  users: [],
  experiences: [],
  reservations: [],
  bitacora: [],
  email_notification_logs: []
};

// Database Query Adapter: executes against PostgreSQL pool or memory fallback
async function query(text, params = []) {
  if (dbPool && module.exports.getIsPgConnected()) {
    try {
      const res = await dbPool.query(text, params);
      return res;
    } catch (err) {
      logger.error('Error al ejecutar consulta en PostgreSQL:', { text, error: err.message });
      throw err;
    }
  }
  // Return dummy object compatible with pg result format for memory store queries
  return { rows: [], rowCount: 0 };
}

// Test database connection
async function testConnection() {
  if (!dbPool) return false;
  try {
    const client = await dbPool.connect();
    logger.info('Conexión exitosa con la base de datos PostgreSQL.');
    isPgConnected = true;
    client.release();
    return true;
  } catch (err) {
    logger.warn('PostgreSQL no está disponible localmente.', { error: err.message });
    if (!connectionString && (!process.env.POSTGRES_HOST || process.env.POSTGRES_HOST === 'localhost')) {
      isPgConnected = false;
    }
    return false;
  }
}

module.exports = {
  query,
  testConnection,
  memoryDb,
  getIsPgConnected: () => isPgConnected
};


