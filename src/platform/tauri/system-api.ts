import { fetch } from "@tauri-apps/plugin-http";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { join, tempDir } from "@tauri-apps/api/path";
import { open, ask, message } from "@tauri-apps/plugin-dialog";

export const SystemApi = {
  fetch: async (url: string) => {
    return await fetch(url);
  },

  writeTempFile: async (fileName: string, bytes: Uint8Array): Promise<string> => {
    await writeFile(fileName, bytes, { baseDir: BaseDirectory.Temp });
    const tDir = await tempDir();
    return await join(tDir, fileName);
  },

  confirm: async (title: string, msg: string): Promise<boolean> => {
    return await ask(msg, { title, kind: 'warning', okLabel: 'Install', cancelLabel: 'Cancel' });
  },

  alert: async (title: string, msg: string): Promise<void> => {
    await message(msg, { title, kind: 'info' });
  },

  openZipDialog: async (): Promise<string | null> => {
    const selected = await open({
      filters: [{ name: "Library", extensions: ["zip"] }],
      multiple: false,
      title: "Import Library from .zip"
    });
    return typeof selected === 'string' ? selected : null;
  },

  openDirectoryDialog: async (defaultPath?: string, title?: string): Promise<string | null> => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath,
      title
    });
    return typeof selected === 'string' ? selected : null;
  }
};
