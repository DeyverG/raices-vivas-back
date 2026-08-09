const { hashPasswordSHA256, verifyPasswordSHA256 } = require('../src/utils/crypto');
const logger = require('../src/utils/logger');

describe('Utils - Crypto & Logger', () => {
  describe('crypto.js', () => {
    test('hashPasswordSHA256 should generate a valid 64-character hex string', () => {
      const hash = hashPasswordSHA256('password123');
      expect(hash).toHaveLength(64);
      expect(typeof hash).toBe('string');
    });

    test('hashPasswordSHA256 should throw an error when password is not a valid string', () => {
      expect(() => hashPasswordSHA256('')).toThrow('La contraseña a cifrar debe ser una cadena válida.');
      expect(() => hashPasswordSHA256(null)).toThrow('La contraseña a cifrar debe ser una cadena válida.');
      expect(() => hashPasswordSHA256(12345)).toThrow('La contraseña a cifrar debe ser una cadena válida.');
    });

    test('verifyPasswordSHA256 should correctly compare plain text with hash', () => {
      const password = 'mySecretPassword';
      const hash = hashPasswordSHA256(password);
      expect(verifyPasswordSHA256(password, hash)).toBe(true);
      expect(verifyPasswordSHA256('wrongPassword', hash)).toBe(false);
    });
  });

  describe('logger.js', () => {
    let logSpy, warnSpy, errorSpy;

    beforeEach(() => {
      logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      logSpy.mockRestore();
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test('info logs message without metadata', () => {
      logger.info('Info test');
      expect(logSpy).toHaveBeenCalled();
    });

    test('info logs message with metadata', () => {
      logger.info('Info test', { key: 'val' });
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Info test'), { key: 'val' });
    });

    test('warn logs message without metadata', () => {
      logger.warn('Warn test');
      expect(warnSpy).toHaveBeenCalled();
    });

    test('warn logs message with metadata', () => {
      logger.warn('Warn test', { key: 'val' });
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Warn test'), { key: 'val' });
    });

    test('error logs message without metadata', () => {
      logger.error('Error test');
      expect(errorSpy).toHaveBeenCalled();
    });

    test('error logs message with metadata', () => {
      logger.error('Error test', { key: 'val' });
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error test'), { key: 'val' });
    });
  });
});
