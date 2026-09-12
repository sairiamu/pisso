import { CompilerApi, CompileResult } from "../infrastructure/tauri/compiler-api";
import { ProjectService } from "./project-service";
import { ProjectFile } from "../infrastructure/tauri/project-api";

export const CompilerService = {
  async compile(
    projectPath: string,
    files: ProjectFile[],
    boardFqbn: string,
    mainSketchName: string
  ): Promise<CompileResult> {
    // 1. Save all project files
    await ProjectService.saveProjectFiles(projectPath, files);

    // 2. Invoke the compile command
    const sketchPath = `${projectPath}/code/${mainSketchName}`;
    return await CompilerApi.compileSketch(sketchPath, boardFqbn);
  },

  async upload(
    hexPath: string,
    port: string,
    boardFqbn: string
  ): Promise<string> {
    return await CompilerApi.uploadHex(hexPath, port, boardFqbn);
  }
};
