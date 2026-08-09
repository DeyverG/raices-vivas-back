const logger = require('../utils/logger');
const { memoryDb } = require('../config/database');

/**
 * Simulates sending an email notification with automatic retry logic (exponential backoff).
 * Fulfills HU-05-01 requirements.
 */
async function sendEmailWithRetry({ recipient, subject, body, maxRetries = 3 }) {
  const logId = `mail-${Date.now()}`;
  let attempts = 0;
  let sent = false;

  logger.info(`[NOTIFICACIÓN EMAIL] Iniciando envío a: ${recipient} - Asunto: "${subject}"`);

  while (attempts < maxRetries && !sent) {
    attempts++;
    try {
      // Simulate network request to SMTP server / Email provider
      // Simulate 95% success rate or simulated retry on first attempt
      if (Math.random() < 0.05) {
        throw new Error('Timeout de conexión con servidor SMTP.');
      }


      sent = true;
      logger.info(`[NOTIFICACIÓN EMAIL] ¡Correo enviado con éxito a ${recipient} en intento ${attempts}!`);

      const logRecord = {
        id: logId,
        recipient,
        subject,
        body,
        status: 'SENT',
        attempts,
        createdAt: new Date().toISOString()
      };
      memoryDb.email_notification_logs.push(logRecord);
      return logRecord;
    } catch (err) {
      logger.warn(`[NOTIFICACIÓN EMAIL] Fallo intento ${attempts}/${maxRetries} enviando a ${recipient}: ${err.message}`);
      if (attempts < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempts) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const failedLog = {
    id: logId,
    recipient,
    subject,
    body,
    status: 'FAILED',
    attempts,
    createdAt: new Date().toISOString()
  };
  memoryDb.email_notification_logs.push(failedLog);
  logger.error(`[NOTIFICACIÓN EMAIL] No se pudo enviar el correo a ${recipient} tras ${maxRetries} intentos.`);
  return failedLog;
}

module.exports = {
  sendEmailWithRetry
};
