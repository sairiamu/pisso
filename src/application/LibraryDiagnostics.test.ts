import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibraryManager, LibraryDiagnosticError } from './LibraryManager';
import { LibraryApi } from '../infrastructure/tauri/library-api';

vi.mock('../infrastructure/tauri/library-api');
vi.mock('../infrastructure/tauri/system-api');
vi.mock('../infrastructure/tauri/project-api');

describe('LibraryManager Structured Diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report network failure during installation', async () => {
    const mockLib = {
      name: 'NetLib',
      source: 'online',
      url: 'http://example.com/lib.zip',
      installed: false
    } as any;

    vi.mocked(LibraryApi.downloadAndInstallLibrary).mockRejectedValue(new Error('Failed to fetch: network unreachable'));

    try {
      await LibraryManager.install(mockLib);
      expect.fail('Should have thrown LibraryDiagnosticError');
    } catch (err) {
      expect(err).toBeInstanceOf(LibraryDiagnosticError);
      const diag = (err as LibraryDiagnosticError).diagnostic;
      expect(diag.library).toBe('NetLib');
      expect(diag.stage).toBe('installation');
      expect(diag.reason).toBe('network failure');
      expect(diag.suggestion).toContain('internet connection');
    }
  });

  it('should report invalid ZIP failure', async () => {
    const mockLib = {
      name: 'BadZip',
      source: 'online',
      url: 'http://example.com/bad.zip',
      installed: false
    } as any;

    vi.mocked(LibraryApi.downloadAndInstallLibrary).mockRejectedValue(new Error('Checksum mismatch. Expected: SHA-256:abc, Actual: def'));

    try {
      await LibraryManager.install(mockLib);
      expect.fail('Should have thrown LibraryDiagnosticError');
    } catch (err) {
      expect(err).toBeInstanceOf(LibraryDiagnosticError);
      const diag = (err as LibraryDiagnosticError).diagnostic;
      expect(diag.reason).toBe('invalid ZIP');
      expect(diag.suggestion).toContain('integrity validation');
    }
  });

  it('should report unsupported architecture', async () => {
    const mockLib = {
      name: 'SamdOnly',
      architectures: 'samd',
      installed: false
    } as any;

    try {
      await LibraryManager.install(mockLib, null, 'avr');
      expect.fail('Should have thrown LibraryDiagnosticError');
    } catch (err) {
      expect(err).toBeInstanceOf(LibraryDiagnosticError);
      const diag = (err as LibraryDiagnosticError).diagnostic;
      expect(diag.reason).toBe('unsupported architecture');
      expect(diag.stage).toBe('architecture check');
    }
  });

  it('should report dependency cycles', async () => {
      const mockLibA = { name: 'LibA', dependencies: ['LibB'], source: 'bundled', installed: false } as any;
      const mockLibB = { name: 'LibB', dependencies: ['LibA'], source: 'bundled', installed: false } as any;

      vi.spyOn(LibraryManager, 'resolve').mockImplementation(async (name) => {
          if (name === 'LibA') return mockLibA;
          if (name === 'LibB') return mockLibB;
          return null;
      });

      try {
          await LibraryManager.install(mockLibA);
          expect.fail('Should have thrown LibraryDiagnosticError');
      } catch (err) {
          expect(err).toBeInstanceOf(LibraryDiagnosticError);
          const diag = (err as LibraryDiagnosticError).diagnostic;
          expect(diag.reason).toBe('dependency failure');
          expect(diag.details).toContain('Cycle');
      }
  });
});
