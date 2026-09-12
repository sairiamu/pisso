import { LibraryApi, LibraryCatalogEntry } from "../infrastructure/tauri/library-api";
import { SystemApi } from "../infrastructure/tauri/system-api";

export interface OnlineLibraryEntry {
  name: string;
  author: string;
  version: string;
  description: string;
  url: string;
}

export const LibraryService = {
  async getInstalledLibraries(): Promise<string[]> {
    return await LibraryApi.listInstalledLibraries();
  },

  async getLibraryCatalog(): Promise<LibraryCatalogEntry[]> {
    return await LibraryApi.getLibraryCatalog();
  },

  async removeLibrary(name: string): Promise<void> {
    await LibraryApi.removeLibrary(name);
  },

  async installBundledLibrary(name: string): Promise<void> {
    await LibraryApi.installBundledLibrary(name);
  },

  async importLibraryFromZip(): Promise<string | null> {
    const selected = await SystemApi.openZipDialog();
    if (selected) {
      return await LibraryApi.installLibraryFromZip(selected);
    }
    return null;
  },

  async downloadAndInstallLibrary(entry: OnlineLibraryEntry): Promise<string> {
    const response = await SystemApi.fetch(entry.url);
    if (!response.ok) throw new Error("Download failed");

    const bytes = new Uint8Array(await response.arrayBuffer());
    const fileName = `pisso-download-${Date.now()}.zip`;

    const fullPath = await SystemApi.writeTempFile(fileName, bytes);
    return await LibraryApi.installLibraryFromZip(fullPath);
  },

  async fetchOnlineIndex(): Promise<OnlineLibraryEntry[]> {
    const response = await SystemApi.fetch("https://downloads.arduino.cc/libraries/library_index.json");
    if (!response.ok) throw new Error("Failed to reach Arduino registry");
    const data = await response.json();

    const latestLibs: Record<string, OnlineLibraryEntry> = {};

    if (data.libraries && Array.isArray(data.libraries)) {
      for (const lib of data.libraries) {
        const existing = latestLibs[lib.name];
        if (!existing || this.compareVersions(lib.version, existing.version) > 0) {
          latestLibs[lib.name] = {
            name: lib.name,
            author: lib.author || "Unknown",
            version: lib.version,
            description: lib.sentence || lib.description || "",
            url: lib.url
          };
        }
      }
    }

    return Object.values(latestLibs);
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
