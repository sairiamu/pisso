import { invoke } from "@tauri-apps/api/core";

export interface LibraryCatalogEntry {
  name: string;
  author: string;
  version: string;
  description: string;
  bundled: boolean;
}

export const LibraryApi = {
  listInstalledLibraries: async (): Promise<string[]> => {
    return await invoke<string[]>("list_installed_libraries");
  },

  getLibraryCatalog: async (): Promise<LibraryCatalogEntry[]> => {
    return await invoke<LibraryCatalogEntry[]>("get_library_catalog");
  },

  removeLibrary: async (name: string): Promise<void> => {
    await invoke("remove_library", { name });
  },

  installBundledLibrary: async (name: string): Promise<void> => {
    await invoke("install_bundled_library", { name });
  },

  installLibraryFromZip: async (zipPath: string): Promise<string> => {
    return await invoke<string>("install_library_from_zip", { zipPath });
  }
};
