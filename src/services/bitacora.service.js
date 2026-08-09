const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Inserts an immutable audit log entry into the Bitácora.
 * Fulfills RNF-010 requirements.
 */
async function recordAuditLog({ entityId, entityType, userIdentifier, action, details }) {
  const logId = `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();

  const entry = {
    id: logId,
    timestamp,
    entity_id: entityId,
    entity_type: entityType,
    user_identifier: userIdentifier,
    action,
    details
  };

  logger.info(`[BITÁCORA] [${action}] ${entityType}:${entityId} por ${userIdentifier} - ${details}`);

  if (db.getIsPgConnected()) {
    try {
      await db.query(
        `INSERT INTO bitacora (id, timestamp, entity_id, entity_type, user_identifier, action, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [logId, timestamp, entityId, entityType, userIdentifier, action, details]
      );
    } catch (err) {
      logger.error('Fallo al escribir en la bitácora PostgreSQL:', err.message);
    }
  }

  // Always keep in memory buffer for immediate API retrieval
  db.memoryDb.bitacora.unshift(entry);
  return entry;
}

async function getAuditLogs() {
  if (db.getIsPgConnected()) {
    try {
      const res = await db.query(`SELECT * FROM bitacora ORDER BY timestamp DESC LIMIT 100`);
      return res.rows;
    } catch (err) {
      logger.error('Error al consultar bitácora en PostgreSQL:', err.message);
    }
  }
  return db.memoryDb.bitacora;
}

module.exports = {
  recordAuditLog,
  getAuditLogs
};

