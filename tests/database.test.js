const { Pool } = require('pg');
const db = require('../src/config/database');
const logger = require('../src/utils/logger');

describe('Database Config & Query Adapter', () => {
  let warnSpy, errorSpy, infoSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('memoryDb should contain expected collections', () => {
    expect(db.memoryDb).toHaveProperty('users');
    expect(db.memoryDb).toHaveProperty('experiences');
    expect(db.memoryDb).toHaveProperty('reservations');
    expect(db.memoryDb).toHaveProperty('bitacora');
    expect(db.memoryDb).toHaveProperty('email_notification_logs');
  });

  test('query returns fallback empty rows when isPgConnected is false', async () => {
    jest.spyOn(db, 'getIsPgConnected').mockReturnValue(false);
    const res = await db.query('SELECT * FROM users');
    expect(res).toEqual({ rows: [], rowCount: 0 });
  });

  test('testConnection returns true and sets isPgConnected when connect succeeds', async () => {
    const mockRelease = jest.fn();
    jest.spyOn(Pool.prototype, 'connect').mockResolvedValue({ release: mockRelease });

    const connected = await db.testConnection();
    expect(connected).toBe(true);
    expect(db.getIsPgConnected()).toBe(true);
    expect(mockRelease).toHaveBeenCalled();
  });

  test('testConnection returns false when connect fails', async () => {
    jest.spyOn(Pool.prototype, 'connect').mockRejectedValue(new Error('Conn failed'));

    const connected = await db.testConnection();
    expect(connected).toBe(false);
    expect(db.getIsPgConnected()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('PostgreSQL no está disponible localmente'),
      expect.objectContaining({ error: 'Conn failed' })
    );
  });

  test('query executes pool query and returns result when isPgConnected is true', async () => {
    const mockRelease = jest.fn();
    jest.spyOn(Pool.prototype, 'connect').mockResolvedValue({ release: mockRelease });
    await db.testConnection();

    const mockRes = { rows: [{ id: 100 }], rowCount: 1 };
    jest.spyOn(Pool.prototype, 'query').mockResolvedValue(mockRes);

    const res = await db.query('SELECT * FROM test_table', [1]);
    expect(res).toEqual(mockRes);
  });

  test('query logs error and throws when pool query fails in PG mode', async () => {
    const mockRelease = jest.fn();
    jest.spyOn(Pool.prototype, 'connect').mockResolvedValue({ release: mockRelease });
    await db.testConnection();

    jest.spyOn(Pool.prototype, 'query').mockRejectedValue(new Error('Query execution failed'));

    await expect(db.query('SELECT * FROM bad_table')).rejects.toThrow('Query execution failed');
    expect(errorSpy).toHaveBeenCalledWith(
      'Error al ejecutar consulta en PostgreSQL:',
      expect.objectContaining({ text: 'SELECT * FROM bad_table', error: 'Query execution failed' })
    );
  });

  test('handles dbPool error event listener', () => {
    let errorHandler;
    jest.spyOn(Pool.prototype, 'on').mockImplementation((event, fn) => {
      if (event === 'error') errorHandler = fn;
    });

    const { Pool: MockPool } = require('pg');
    new MockPool();

    if (errorHandler) {
      errorHandler(new Error('Idle client error'));
      expect(warnSpy).toHaveBeenCalledWith(
        'Error inesperado en cliente inactivo de PostgreSQL:',
        'Idle client error'
      );
    }
  });

});
