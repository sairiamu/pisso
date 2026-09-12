import { invoke } from "@tauri-apps/api/core";

export interface CompileResult {
  hex: string;
  flash_used: number;
  ram_used: number;
}

export const CompilerApi = {
  compileSketch: async (sketchPath: string, boardFqbn: string): Promise<CompileResult> => {
    return await invoke<CompileResult>("compile_sketch", {
      sketchPath,
      boardFqbn,
    });
  },

  uploadHex: async (hexPath: string, port: string, boardFqbn: string): Promise<string> => {
    return await invoke<string>("upload_hex", {
      hexPath,
      port,
      boardFqbn,
    });
  }
};
