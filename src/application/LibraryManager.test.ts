import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibraryManager, LibraryInfo } from './LibraryManager';
import { LibraryApi } from '../infrastructure/tauri/library-api';

vi.mock('../infrastructure/tauri/library-api', () => ({
  LibraryApi: {
    installBundledLibrary: vi.fn(),
    listInstalledLibraries: vi.fn(),
    getLibraryCatalog: vi.fn(),
    removeLibrary: vi.fn(),
    installLibraryFromZip: vi.fn(),
  }
}));

vi.mock('../infrastructure/tauri/system-api', () => ({
  SystemApi: {
    fetch: vi.fn(),
    writeTempFile: vi.fn(),
    openZipDialog: vi.fn(),
  }
}));

describe('LibraryManager Dependency Resolution', () => {
  const mockLibs: LibraryInfo[] = [
    {
      name: 'LibA',
      author: 'A',
      version: '1.0.0',
      description: 'Lib A',
      source: 'bundled',
      installed: false,
      dependencies: ['LibB']
    },
    {
      name: 'LibB',
      author: 'B',
      version: '1.0.0',
      description: 'Lib B',
      source: 'bundled',
      installed: false,
      dependencies: ['LibC']
    },
    {
      name: 'LibC',
      author: 'C',
      version: '1.0.0',
      description: 'Lib C',
      source: 'bundled',
      installed: false,
      architectures: 'avr'
    },
    {
      name: 'CycleX',
      author: 'X',
      version: '1.0.0',
      description: 'Cycle X',
      source: 'bundled',
      installed: false,
      dependencies: ['CycleY']
    },
    {
      name: 'CycleY',
      author: 'Y',
      version: '1.0.0',
      description: 'Cycle Y',
      source: 'bundled',
      installed: false,
      dependencies: ['CycleX']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // We need to mock LibraryManager methods that are called internally
    // Note: LibraryManager is a constant object, we can mock its methods directly
    LibraryManager.resolve = vi.fn().mockImplementation(async (name) => {
        return mockLibs.find(l => l.name === name) || null;
    });
    LibraryManager.search = vi.fn().mockImplementation(async (query) => {
        if (!query) return mockLibs;
        return mockLibs.filter(l => l.name === query);
    });
  });

  it('should resolve and install dependencies recursively (A -> B -> C)', async () => {
    await LibraryManager.install('LibA', 'test-path');

    // Should install LibC, then LibB, then LibA
    expect(LibraryApi.installBundledLibrary).toHaveBeenCalledTimes(3);
    expect(LibraryApi.installBundledLibrary).toHaveBeenNthCalledWith(1, 'LibC', 'test-path');
    expect(LibraryApi.installBundledLibrary).toHaveBeenNthCalledWith(2, 'LibB', 'test-path');
    expect(LibraryApi.installBundledLibrary).toHaveBeenNthCalledWith(3, 'LibA', 'test-path');
  });

  it('should detect dependency cycles', async () => {
    await expect(LibraryManager.install('CycleX', 'test-path'))
      .rejects.toThrow(/Dependency cycle detected/);
  });

  it('should detect incompatible architectures', async () => {
    // LibC is avr only
    await expect(LibraryManager.install('LibC', 'test-path', 'samd'))
      .rejects.toThrow(/not compatible with architecture \"samd\"/);

    // Should work for avr
    await LibraryManager.install('LibC', 'test-path', 'avr');
    expect(LibraryApi.installBundledLibrary).toHaveBeenCalledWith('LibC', 'test-path');
  });

  it('should throw error for missing dependencies', async () => {
    const brokenLib: LibraryInfo = {
      name: 'Broken',
      author: 'X',
      version: '1.0.0',
      description: 'Broken',
      source: 'bundled',
      installed: false,
      dependencies: ['NonExistent']
    };

    LibraryManager.resolve = vi.fn().mockImplementation(async (name) => {
       if (name === 'Broken') return brokenLib;
       return null;
    });

    await expect(LibraryManager.install(brokenLib, 'test-path'))
      .rejects.toThrow(/Missing dependency for \"Broken\": \"NonExistent\"/);
  });
});
