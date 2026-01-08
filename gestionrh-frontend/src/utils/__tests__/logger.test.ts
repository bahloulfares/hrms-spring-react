import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('debug', () => {
    it('should log in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      // Simuler mode DEV
      vi.stubEnv('DEV', true);
      
      logger.debug('test message', { data: 'value' });
      
      expect(consoleSpy).toHaveBeenCalledWith('test message', { data: 'value' });
      
      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    it('should not log in production mode', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      // Simuler mode PROD
      vi.stubEnv('DEV', false);
      vi.stubEnv('PROD', true);
      
      logger.debug('test message');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });

  describe('error', () => {
    it('should not log in production mode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simuler mode PROD
      vi.stubEnv('PROD', true);
      vi.stubEnv('DEV', false);
      
      logger.error('error message', new Error('test'));
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    it('should log in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simuler mode DEV
      vi.stubEnv('DEV', true);
      vi.stubEnv('PROD', false);
      
      const error = new Error('test error');
      logger.error('error occurred:', error);
      
      expect(consoleSpy).toHaveBeenCalledWith('error occurred:', error);
      
      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });

    it('should accept multiple arguments', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.stubEnv('DEV', true);
      vi.stubEnv('PROD', false);
      
      logger.error('Error:', 'message', { code: 500 }, ['detail1', 'detail2']);
      
      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'message', { code: 500 }, ['detail1', 'detail2']);
      
      consoleSpy.mockRestore();
      vi.unstubAllEnvs();
    });
  });
});
