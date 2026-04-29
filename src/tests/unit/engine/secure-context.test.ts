import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  secureContextCheck,
  crossOriginIsolatedCheck,
  permissionsApiCheck,
  httpsDetectionCheck,
} from '../../../engine/checks/secure-context';

describe('secure-context checks', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('performance', { now: () => 0 });
  });

  describe('secureContextCheck', () => {
    it('returns supported when isSecureContext is true', async () => {
      vi.stubGlobal('window', { isSecureContext: true, crossOriginIsolated: false });
      const result = await secureContextCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns not_supported when isSecureContext is false', async () => {
      vi.stubGlobal('window', { isSecureContext: false, crossOriginIsolated: false });
      const result = await secureContextCheck.run();
      expect(result.status).toBe('not_supported');
    });
  });

  describe('crossOriginIsolatedCheck', () => {
    it('returns supported when crossOriginIsolated is true', async () => {
      vi.stubGlobal('window', { isSecureContext: true, crossOriginIsolated: true });
      const result = await crossOriginIsolatedCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns not_supported when crossOriginIsolated is false', async () => {
      vi.stubGlobal('window', { isSecureContext: true, crossOriginIsolated: false });
      const result = await crossOriginIsolatedCheck.run();
      expect(result.status).toBe('not_supported');
    });
  });

  describe('permissionsApiCheck', () => {
    it('returns supported when permissions in navigator', async () => {
      vi.stubGlobal('navigator', { permissions: {} });
      const result = await permissionsApiCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns not_supported when permissions missing', async () => {
      vi.stubGlobal('navigator', {});
      const result = await permissionsApiCheck.run();
      expect(result.status).toBe('not_supported');
    });
  });

  describe('httpsDetectionCheck', () => {
    it('returns supported for https protocol', async () => {
      vi.stubGlobal('location', { protocol: 'https:', hostname: 'example.com' });
      const result = await httpsDetectionCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns supported for localhost', async () => {
      vi.stubGlobal('location', { protocol: 'http:', hostname: 'localhost' });
      const result = await httpsDetectionCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns not_supported for http on non-localhost', async () => {
      vi.stubGlobal('location', { protocol: 'http:', hostname: 'example.com' });
      const result = await httpsDetectionCheck.run();
      expect(result.status).toBe('not_supported');
    });
  });
});
