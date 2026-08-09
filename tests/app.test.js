const request = require('supertest');
const app = require('../src/app');
const logger = require('../src/utils/logger');

describe('App Express Core & Health Check', () => {
  let loggerSpy;

  beforeEach(() => {
    loggerSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    loggerSpy.mockRestore();
  });

  test('GET /health returns status 200 UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('Raíces Vivas REST API');
    expect(res.body.timestamp).toBeDefined();
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('HTTP GET /health'));
  });

  test('GET non-existent route returns 404', async () => {
    const res = await request(app).get('/api/v1/non-existent-route-path');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('no existe en esta API.');
  });

  test('GET /api-docs serves Swagger documentation UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect([200, 301, 302]).toContain(res.status);
  });
});
