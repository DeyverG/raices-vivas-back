const bitacoraService = require('../src/services/bitacora.service');
const emailService = require('../src/services/email.service');
const db = require('../src/config/database');
const logger = require('../src/utils/logger');

describe('Services - Bitácora & Email', () => {
  describe('bitacora.service.js', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('recordAuditLog should record entry in memoryDb.bitacora', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);

      const entry = await bitacoraService.recordAuditLog({
        entityId: 'exp-101',
        entityType: 'Experiencia',
        userIdentifier: 'Test User',
        action: 'CREAR_EXPERIENCIA',
        details: 'Detalles de prueba'
      });

      expect(entry).toBeDefined();
      expect(entry.entity_id).toBe('exp-101');
      expect(entry.action).toBe('CREAR_EXPERIENCIA');
      expect(db.memoryDb.bitacora[0].id).toBe(entry.id);
    });

    test('recordAuditLog should execute PostgreSQL query when isPgConnected is true', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(true);
      const querySpy = jest.spyOn(db, 'query').mockResolvedValue({ rowCount: 1 });

      const entry = await bitacoraService.recordAuditLog({
        entityId: 'exp-102',
        entityType: 'Experiencia',
        userIdentifier: 'User PG',
        action: 'UPDATE',
        details: 'PG Details'
      });

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO bitacora'),
        expect.arrayContaining(['exp-102', 'Experiencia', 'User PG', 'UPDATE', 'PG Details'])
      );
    });

    test('recordAuditLog should handle PostgreSQL query error gracefully', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(true);
      jest.spyOn(db, 'query').mockRejectedValue(new Error('PG Write Error'));
      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

      const entry = await bitacoraService.recordAuditLog({
        entityId: 'exp-103',
        entityType: 'Experiencia',
        userIdentifier: 'User Error',
        action: 'DELETE',
        details: 'Error details'
      });

      expect(entry).toBeDefined();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Fallo al escribir en la bitácora PostgreSQL:', 'PG Write Error');
    });

    test('getAuditLogs should return memoryDb logs when PG is not connected', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
      const logs = await bitacoraService.getAuditLogs();
      expect(Array.isArray(logs)).toBe(true);
    });

    test('getAuditLogs should return PostgreSQL rows when PG is connected', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(true);
      const mockRows = [{ id: 'log-1', action: 'TEST' }];
      jest.spyOn(db, 'query').mockResolvedValue({ rows: mockRows });

      const logs = await bitacoraService.getAuditLogs();
      expect(logs).toEqual(mockRows);
    });

    test('getAuditLogs should fallback to memoryDb when PG query fails', async () => {
      jest.spyOn(db, 'getIsPgConnected').mockReturnValue(true);
      jest.spyOn(db, 'query').mockRejectedValue(new Error('PG Read Error'));
      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

      const logs = await bitacoraService.getAuditLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error al consultar bitácora en PostgreSQL:', 'PG Read Error');
    });
  });

  describe('email.service.js', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('sendEmailWithRetry should send email successfully on first attempt when random >= 0.05', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const result = await emailService.sendEmailWithRetry({
        recipient: 'test@raicesvivas.org',
        subject: 'Test Subject',
        body: 'Test Body'
      });

      expect(result.status).toBe('SENT');
      expect(result.attempts).toBe(1);
      expect(db.memoryDb.email_notification_logs.pop().id).toBe(result.id);
    });

    test('sendEmailWithRetry should retry and succeed when first attempt fails', async () => {
      // First attempt triggers exception (< 0.05), second attempt succeeds (0.5)
      let count = 0;
      jest.spyOn(Math, 'random').mockImplementation(() => {
        count++;
        return count === 1 ? 0.01 : 0.5;
      });

      const result = await emailService.sendEmailWithRetry({
        recipient: 'retry@raicesvivas.org',
        subject: 'Retry Subject',
        body: 'Retry Body',
        maxRetries: 2
      });

      expect(result.status).toBe('SENT');
      expect(result.attempts).toBe(2);
    });

    test('sendEmailWithRetry should fail after maxRetries when all attempts fail', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.01);
      const loggerErrorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

      const result = await emailService.sendEmailWithRetry({
        recipient: 'failed@raicesvivas.org',
        subject: 'Failed Subject',
        body: 'Failed Body',
        maxRetries: 2
      });

      expect(result.status).toBe('FAILED');
      expect(result.attempts).toBe(2);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('No se pudo enviar el correo a failed@raicesvivas.org')
      );
    });
  });
});
