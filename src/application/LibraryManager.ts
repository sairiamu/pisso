import { LibraryApi, LibraryCatalogEntry, InstalledLibraryInfo } from "../infrastructure/tauri/library-api";
import { SystemApi } from "../infrastructure/tauri/system-api";
import { ProjectApi } from "../infrastructure/tauri/project-api";
import { Diagnostic } from "../domain/models";

export interface LibraryInfo {
  name: string;
  author: string;
  version: string;
  description: string;
  url?: string;
  checksum?: string;
  source: 'bundled' | 'online' | 'local' | 'project';
  installed: boolean;
  dependencies?: string[];
  includes?: string[];
  maintainer?: string;
  sentence?: string;
  paragraph?: string;
  category?: string;
  architectures?: string;
}

export class LibraryDiagnosticError extends Error {
  constructor(public diagnostic: Diagnostic) {
    super(diagnostic.message);
    this.name = 'LibraryDiagnosticError';
  }
}

/**
 * LibraryManager is the central abstraction for all library-related operations.
 * It handles searching, resolving, installing, and managing libraries.
 */
export const LibraryManager = {
  /**
   * Searches for libraries matching the query across all sources.
   */
  async search(query: string, projectPath?: string | null): Promise<LibraryInfo[]> {
    const [catalog, online, installedLibs] = await Promise.all([
      this.getBundledCatalog(),
      this.fetchOnlineIndex(),
      LibraryApi.listInstalledLibraries(projectPath)
    ]);

    const installedMap = new Map<string, InstalledLibraryInfo>();
    installedLibs.forEach(lib => installedMap.set(lib.name.toLowerCase(), lib));

    // Combine sources
    const allLibs = new Map<string, LibraryInfo>();

    // Add bundled
    catalog.forEach(c => {
      const key = c.name.toLowerCase();
      const installed = installedMap.get(key);
      allLibs.set(key, {
        ...c,
        source: 'bundled',
        installed: !!installed,
        url: '',
        ...installed?.properties
      });
    });

    // Add online (overriding or adding new)
    online.forEach(o => {
      const key = o.name.toLowerCase();
      const existing = allLibs.get(key);
      const installed = installedMap.get(key);

      if (!existing || this.compareVersions(o.version, existing.version) > 0) {
        allLibs.set(key, {
          ...o,
          source: 'online',
          installed: !!installed,
          ...installed?.properties
        });
      }
    });

    // Add installed libraries that might not be in catalogs
    installedLibs.forEach(lib => {
      const key = lib.name.toLowerCase();
      const source = lib.source as any;
      const props = lib.properties;

      if (!allLibs.has(key)) {
        allLibs.set(key, {
          name: props?.name || lib.name,
          author: props?.author || (source === 'project' ? 'Project' : 'Local'),
          version: props?.version || 'unknown',
          description: props?.sentence || (source === 'project' ? 'Project-local library' : 'Installed library'),
          source: source,
          installed: true,
          maintainer: props?.maintainer,
          sentence: props?.sentence,
          paragraph: props?.paragraph,
          category: props?.category,
          architectures: props?.architectures,
          dependencies: props?.depends ? props.depends.split(',').map(d => d.trim()) : []
        });
      } else {
        const existing = allLibs.get(key)!;
        existing.installed = true;
        if (source === 'project') {
            existing.source = 'project';
        }
        if (props) {
            existing.version = props.version;
            existing.author = props.author;
            existing.maintainer = props.maintainer;
            existing.sentence = props.sentence;
            existing.paragraph = props.paragraph;
            existing.category = props.category;
            existing.architectures = props.architectures;
            existing.dependencies = props.depends ? props.depends.split(',').map(d => d.trim()) : existing.dependencies;
        }
      }
    });

    const searchLower = query.toLowerCase();
    return Array.from(allLibs.values()).filter(lib =>
      lib.name.toLowerCase().includes(searchLower) ||
      lib.author.toLowerCase().includes(searchLower) ||
      lib.description.toLowerCase().includes(searchLower)
    );
  },

  /**
   * Resolves a library name to its best available metadata.
   */
  async resolve(name: string, projectPath?: string | null): Promise<LibraryInfo | null> {
    const libs = await this.search(name, projectPath);
    return libs.find(l => l.name.toLowerCase() === name.toLowerCase()) || null;
  },

  /**
   * Installs a library and all its dependencies recursively.
   */
  async install(
    library: LibraryInfo | string,
    projectPath?: string | null,
    targetArchitecture?: string,
    visited: Set<string> = new Set()
  ): Promise<string> {
    if (typeof library === 'string') {
      const resolved = await this.resolve(library, projectPath);
      if (!resolved) {
        throw new LibraryDiagnosticError({
          severity: 'error',
          message: `Could not resolve library: ${library}`,
          library: library,
          stage: 'resolution',
          reason: 'missing library',
          suggestion: 'Check the library name or search for it in the Library Manager.'
        });
      }
      library = resolved;
    }

    if (visited.has(library.name)) {
      throw new LibraryDiagnosticError({
        severity: 'error',
        message: `Dependency cycle detected: ${Array.from(visited).join(' -> ')} -> ${library.name}`,
        library: library.name,
        stage: 'dependency resolution',
        reason: 'dependency failure',
        details: `Cycle: ${Array.from(visited).join(' -> ')} -> ${library.name}`,
        suggestion: 'Remove the circular dependency in library.properties.'
      });
    }
    visited.add(library.name);

    // 1. Architecture check
    if (targetArchitecture && library.architectures) {
      const archs = library.architectures.split(',').map(a => a.trim());
      if (!archs.includes('*') && !archs.includes(targetArchitecture)) {
         throw new LibraryDiagnosticError({
           severity: 'error',
           message: `Library "${library.name}" is not compatible with architecture "${targetArchitecture}".`,
           library: library.name,
           stage: 'architecture check',
           reason: 'unsupported architecture',
           details: `Supported: ${library.architectures}, Target: ${targetArchitecture}`,
           suggestion: 'Choose a different board or use a library compatible with this architecture.'
         });
      }
    }

    // 2. Resolve and install dependencies first
    const dependencies = library.dependencies || [];
    for (const depName of dependencies) {
      const depLib = await this.resolve(depName, projectPath);
      if (!depLib) {
        throw new LibraryDiagnosticError({
          severity: 'error',
          message: `Missing dependency for "${library.name}": "${depName}"`,
          library: library.name,
          stage: 'dependency resolution',
          reason: 'dependency failure',
          details: `Dependency "${depName}" could not be found.`,
          suggestion: `Ensure "${depName}" is available in the library registry.`
        });
      }

      if (!depLib.installed) {
        await this.install(depLib, projectPath, targetArchitecture, new Set(visited));
      }
    }

    // 3. Install the library itself
    try {
      if (library.source === 'bundled') {
        await LibraryApi.installBundledLibrary(library.name, projectPath);
      } else if (library.source === 'online' && library.url) {
        await LibraryApi.downloadAndInstallLibrary(library.url, library.name, library.checksum, projectPath);
      } else if (library.source === 'local' || library.source === 'project') {
          // Already present
      } else {
        throw new Error(`Unknown source: ${library.source}`);
      }
    } catch (err: any) {
      const errorStr = String(err);
      let reason = 'installation failure';
      let suggestion = 'Check your internet connection and try again.';

      if (errorStr.includes('network') || errorStr.includes('fetch')) {
        reason = 'network failure';
      } else if (errorStr.includes('Checksum mismatch')) {
        reason = 'invalid ZIP';
        suggestion = 'The downloaded library file failed integrity validation. This could be due to a corrupted download or an outdated library index.';
      } else if (errorStr.includes('zip') || errorStr.includes('extract')) {
        reason = 'invalid ZIP';
        suggestion = 'The library package might be corrupted. Try installing a different version.';
      } else if (errorStr.includes('permission') || errorStr.includes('access denied')) {
        reason = 'permission failure';
        suggestion = 'Ensure the application has write permissions to the library directory.';
      } else if (errorStr.includes('disk') || errorStr.includes('space')) {
        reason = 'disk failure';
        suggestion = 'Check if your disk is full or read-only.';
      } else if (errorStr.includes('library.properties')) {
        reason = 'missing library.properties';
        suggestion = 'The library is missing a valid library.properties file.';
      }

      throw new LibraryDiagnosticError({
        severity: 'error',
        message: `Failed to install library "${library.name}": ${errorStr}`,
        library: library.name,
        stage: 'installation',
        reason,
        details: errorStr,
        suggestion
      });
    }

    return library.name;
  },

  /**
   * Removes an installed library.
   */
  async remove(name: string, projectPath?: string | null): Promise<void> {
    await LibraryApi.removeLibrary(name, projectPath);
  },

  /**
   * Checks for and applies updates to the specified library.
   */
  async update(name: string, projectPath?: string | null): Promise<boolean> {
    const installed = await this.listInstalled(projectPath);
    if (!installed.find(l => l.name === name)) return false;

    const resolved = await this.resolve(name, projectPath);
    if (!resolved || !resolved.installed) return false;

    // In a real implementation, compare versions and re-install if newer
    // For now, we'll just re-install if online version is different
    if (resolved.source === 'online' && resolved.url) {
        await this.install(resolved, projectPath);
        return true;
    }

    return false;
  },

  /**
   * Lists all currently installed libraries with full metadata.
   */
  async listInstalled(projectPath?: string | null): Promise<LibraryInfo[]> {
    const installed = await LibraryApi.listInstalledLibraries(projectPath);
    const names = installed.map(l => l.name);
    const all = await this.search("", projectPath);
    return all.filter(l => names.includes(l.name));
  },

  /**
   * Returns a list of dependencies for a given library.
   */
  async getDependencies(name: string, projectPath?: string | null): Promise<string[]> {
    const resolved = await this.resolve(name, projectPath);
    return resolved?.dependencies || [];
  },

  /**
   * Scans project source files for missing dependencies and resolves them to online libraries.
   */
  async scanDependencies(projectPath: string, boardFqbn: string): Promise<LibraryInfo[]> {
    const missingHeaders = await ProjectApi.scanMissingHeaders(projectPath, boardFqbn);
    if (missingHeaders.length === 0) return [];

    const all = await this.search("", projectPath);
    const online = all.filter(l => l.source === 'online' || l.source === 'bundled');

    const toInstall: LibraryInfo[] = [];

    for (const header of missingHeaders) {
        const headerLower = header.toLowerCase();
        const headerBase = header.replace(/\.h$/, '').toLowerCase();

        // 1. Try to find a library that explicitly lists this header in its 'includes'
        let found = online.find(l => l.includes?.some(inc => inc.toLowerCase() === headerLower));

        // 2. Exact match by name (e.g. Servo.h -> Servo)
        if (!found) {
            found = online.find(l => l.name.toLowerCase() === headerBase);
        }

        if (found && !toInstall.find(l => l.name === found!.name)) {
            toInstall.push(found);
        }
    }

    return toInstall;
  },

  /**
   * Resolves missing dependencies for a project, optionally asking for confirmation.
   */
  async resolveDependencies(
    projectPath: string,
    boardFqbn: string,
    autoInstall: boolean = false,
    onLog?: (message: string) => void
  ): Promise<'ok' | 'cancelled' | 'none'> {
    const installed = await this.listInstalled(projectPath);
    const missing = await this.scanDependencies(projectPath, boardFqbn);

    if (onLog) {
      if (installed.length > 0 || missing.length > 0) {
        onLog("  Dependency Tree:");
        installed.forEach((lib, i) => {
            const isLast = i === installed.length - 1 && missing.length === 0;
            onLog(`    ${isLast ? "└─" : "├─"} [✓] ${lib.name} (${lib.version})`);
        });
        missing.forEach((lib, i) => {
            const isLast = i === missing.length - 1;
            onLog(`    ${isLast ? "└─" : "├─"} [✗] ${lib.name} (Missing)`);
        });
      } else {
        onLog("  Dependencies: None");
      }
    }

    if (missing.length === 0) return 'none';

    if (!autoInstall) {
      const names = missing.map(l => l.name).join(", ");
      const confirmed = await SystemApi.confirm(
        "Missing Libraries",
        `This project requires the following libraries: ${names}.\n\nWould you like to install them now?`
      );
      if (!confirmed) return 'cancelled';
    }

    for (const lib of missing) {
      if (onLog) onLog(`    Installing ${lib.name}...`);
      await this.install(lib, projectPath);
      if (onLog) onLog(`    [✓] ${lib.name} installed`);
    }

    return 'ok';
  },

  /**
   * Imports a library from a user-selected zip file.
   */
  async importFromZip(projectPath?: string | null): Promise<string | null> {
    const selected = await SystemApi.openZipDialog();
    if (selected) {
      try {
        return await LibraryApi.installLibraryFromZip(selected, projectPath);
      } catch (err: any) {
        const errorStr = String(err);
        let reason = 'installation failure';
        if (errorStr.includes('zip') || errorStr.includes('format')) reason = 'invalid ZIP';
        if (errorStr.includes('permission')) reason = 'permission failure';

        throw new LibraryDiagnosticError({
          severity: 'error',
          message: `Failed to import library from ZIP: ${errorStr}`,
          library: 'External ZIP',
          stage: 'import',
          reason,
          details: errorStr,
          suggestion: 'Ensure the ZIP file is a valid Arduino library and you have necessary permissions.'
        });
      }
    }
    return null;
  },

  // Private-ish helpers (migrated from LibraryService)

  async getBundledCatalog(): Promise<LibraryCatalogEntry[]> {
    return await LibraryApi.getLibraryCatalog();
  },

  async fetchOnlineIndex(): Promise<LibraryInfo[]> {
    try {
      const response = await SystemApi.fetch("https://downloads.arduino.cc/libraries/library_index.json");
      if (!response.ok) return [];
      const data = await response.json();

      const latestLibs: Record<string, LibraryInfo> = {};

      if (data.libraries && Array.isArray(data.libraries)) {
        for (const lib of data.libraries) {
          const existing = latestLibs[lib.name];
          if (!existing || this.compareVersions(lib.version, existing.version) > 0) {
            latestLibs[lib.name] = {
              name: lib.name,
              author: lib.author || "Unknown",
              version: lib.version,
              description: lib.sentence || lib.description || "",
              url: lib.url,
              checksum: lib.checksum,
              includes: lib.includes,
              source: 'online',
              installed: false
            };
          }
        }
      }

      return Object.values(latestLibs);
    } catch (e) {
      console.error("Failed to fetch online index", e);
      return [];
    }
  },

  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }
};
