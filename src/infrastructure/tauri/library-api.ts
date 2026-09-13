import { invoke } from "@tauri-apps/api/core";

export interface LibraryCatalogEntry {
  name: string;
  author: string;
  version: string;
  description: string;
  bundled: boolean;
}

export interface LibraryProperties {
  name: string;
  version: string;
  author: string;
  maintainer: string;
  sentence: string;
  paragraph?: string;
  category: string;
  url: string;
  architectures?: string;
  depends?: string;
}

export interface InstalledLibraryInfo {
  name: string;
  source: string;
  properties?: LibraryProperties;
}

export const LibraryApi = {
  listInstalledLibraries: async (projectPath?: string | null): Promise<InstalledLibraryInfo[]> => {
    return await invoke<InstalledLibraryInfo[]>("list_installed_libraries", { projectPath });
  },

  getLibraryCatalog: async (): Promise<LibraryCatalogEntry[]> => {
    return await invoke<LibraryCatalogEntry[]>("get_library_catalog");
  },

  removeLibrary: async (name: string, projectPath?: string | null): Promise<void> => {
    await invoke("remove_library", { name, projectPath });
  },

  installBundledLibrary: async (name: string, projectPath?: string | null): Promise<void> => {
    await invoke("install_bundled_library", { name, projectPath });
  },

  installLibraryFromZip: async (zipPath: string, projectPath?: string | null): Promise<string> => {
    return await invoke<string>("install_library_from_zip", { zipPath, projectPath });
  },

  downloadAndInstallLibrary: async (
    url: string,
    name: string,
    checksum?: string,
    projectPath?: string | null
  ): Promise<string> => {
    return await invoke<string>("download_and_install_library", { url, name, checksum, projectPath });
  }
};
