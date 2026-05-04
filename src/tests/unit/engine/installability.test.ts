import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  installabilityChecks,
  beforeInstallPromptCheck,
  webAppManifestCheck,
  standaloneDisplayModeCheck,
} from '../../../engine/checks/installability';

describe('installability checks', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('performance', { now: () => 0 });
    vi.stubGlobal('window', { isSecureContext: true, matchMedia: () => ({ matches: false }) });
  });

  it('exports installabilityChecks array with 5 items', () => {
    expect(installabilityChecks).toHaveLength(5);
  });

  describe('beforeInstallPromptCheck', () => {
    it('returns not_supported when BeforeInstallPromptEvent missing', async () => {
      vi.stubGlobal('window', { isSecureContext: true });
      const result = await beforeInstallPromptCheck.run();
      expect(result.status).toBe('not_supported');
      expect(result.id).toBe('before-install-prompt');
    });

    it('returns supported when BeforeInstallPromptEvent present regardless of secure context', async () => {
      vi.stubGlobal('window', { isSecureContext: false, BeforeInstallPromptEvent: class {} });
      const result = await beforeInstallPromptCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns supported when BeforeInstallPromptEvent present in secure context', async () => {
      vi.stubGlobal('window', { isSecureContext: true, BeforeInstallPromptEvent: class {} });
      const result = await beforeInstallPromptCheck.run();
      expect(result.status).toBe('supported');
    });
  });

  describe('webAppManifestCheck', () => {
    it('returns not_supported when no manifest link', async () => {
      vi.stubGlobal('document', { querySelector: () => null });
      const result = await webAppManifestCheck.run();
      expect(result.status).toBe('not_supported');
    });

    it('returns supported when manifest link present', async () => {
      vi.stubGlobal('document', { querySelector: () => ({ href: '/manifest.json' }) });
      const result = await webAppManifestCheck.run();
      expect(result.status).toBe('supported');
    });
  });

  describe('standaloneDisplayModeCheck', () => {
    it('returns supported when matchMedia standalone matches', async () => {
      vi.stubGlobal('window', {
        isSecureContext: true,
        matchMedia: (q: string) => ({ matches: q === '(display-mode: standalone)' }),
      });
      const result = await standaloneDisplayModeCheck.run();
      expect(result.status).toBe('supported');
    });

    it('returns partial when not standalone (browser supports it, app not installed)', async () => {
      vi.stubGlobal('window', {
        isSecureContext: true,
        matchMedia: () => ({ matches: false }),
      });
      const result = await standaloneDisplayModeCheck.run();
      expect(result.status).toBe('partial');
    });
  });
});
