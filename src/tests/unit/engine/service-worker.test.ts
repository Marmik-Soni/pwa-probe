import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  serviceWorkerChecks,
  serviceWorkerCheck,
  backgroundSyncCheck,
  periodicSyncCheck,
} from '../../../engine/checks/service-worker';

describe('service-worker checks', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('performance', { now: () => 0 });
    vi.stubGlobal('window', { isSecureContext: true });
  });

  it('exports serviceWorkerChecks array with 5 items', () => {
    expect(serviceWorkerChecks).toHaveLength(5);
  });

  describe('serviceWorkerCheck', () => {
    it('returns https_required when serviceWorker present but not secure context', async () => {
      vi.stubGlobal('window', { isSecureContext: false });
      vi.stubGlobal('navigator', { serviceWorker: {} });
      const result = await serviceWorkerCheck.run();
      expect(result.status).toBe('https_required');
    });

    it('returns not_supported when serviceWorker missing from navigator', async () => {
      vi.stubGlobal('window', { isSecureContext: true });
      vi.stubGlobal('navigator', {});
      const result = await serviceWorkerCheck.run();
      expect(result.status).toBe('not_supported');
    });

    it('returns supported when serviceWorker present in secure context', async () => {
      vi.stubGlobal('window', { isSecureContext: true });
      vi.stubGlobal('navigator', { serviceWorker: {} });
      const result = await serviceWorkerCheck.run();
      expect(result.status).toBe('supported');
    });
  });

  describe('backgroundSyncCheck', () => {
    it('returns not_supported when SyncManager missing', async () => {
      vi.stubGlobal('window', { isSecureContext: true });
      const result = await backgroundSyncCheck.run();
      expect(result.status).toBe('not_supported');
    });

    it('returns supported when SyncManager present', async () => {
      vi.stubGlobal('window', { isSecureContext: true, SyncManager: class {} });
      const result = await backgroundSyncCheck.run();
      expect(result.status).toBe('supported');
    });
  });

  describe('periodicSyncCheck', () => {
    it('returns not_supported when PeriodicSyncManager missing', async () => {
      vi.stubGlobal('window', { isSecureContext: true });
      const result = await periodicSyncCheck.run();
      expect(result.status).toBe('not_supported');
    });

    it('returns supported when PeriodicSyncManager present', async () => {
      vi.stubGlobal('window', { isSecureContext: true, PeriodicSyncManager: class {} });
      const result = await periodicSyncCheck.run();
      expect(result.status).toBe('supported');
    });
  });
});
