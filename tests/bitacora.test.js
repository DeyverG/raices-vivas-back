const request = require('supertest');
const app = require('../src/app');
const bitacoraService = require('../src/services/bitacora.service');
const db = require('../src/config/database');

describe('Módulo de Bitácora (Controller & Routes)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('GET /api/v1/audit-log should return list of logs', async () => {
    jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
    db.memoryDb.bitacora = [
      { id: 'log-1', action: 'TEST_ACTION', entity_type: 'Usuario' }
    ];

    const res = await request(app).get('/api/v1/audit-log');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/audit-log should handle service errors', async () => {
    jest.spyOn(bitacoraService, 'getAuditLogs').mockRejectedValue(new Error('Bitacora Fetch Failure'));

    const res = await request(app).get('/api/v1/audit-log');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Bitacora Fetch Failure');
  });
});
