const app = require('../src/app');
const db = require('../src/config/database');
const logger = require('../src/utils/logger');
const { startServer } = require('../server');

describe('Server Initialization', () => {
  let listenSpy, testConnSpy, infoSpy;

  beforeEach(() => {
    testConnSpy = jest.spyOn(db, 'testConnection').mockResolvedValue(true);
    infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
    listenSpy = jest.spyOn(app, 'listen').mockImplementation((port, cb) => {
      if (typeof cb === 'function') cb();
      return { close: jest.fn() };
    });
  });

  afterEach(() => {
    testConnSpy.mockRestore();
    infoSpy.mockRestore();
    listenSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test('startServer tests database connection and starts listening', async () => {
    await startServer();

    expect(testConnSpy).toHaveBeenCalled();
    expect(listenSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('Servidor API REST Raíces Vivas escuchando'));
  });

  test('server.js exports startServer function', () => {
    const serverModule = require('../server');
    expect(typeof serverModule.startServer).toBe('function');
  });
});
