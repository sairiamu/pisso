import { CompilerApi, CompileResult } from "../infrastructure/tauri/compiler-api";
import { ProjectService } from "./project-service";
import { ProjectFile, BoardDefinition } from "../domain/models";

export const CompilerService = {
  async compile(
    projectPath: string,
    files: ProjectFile[],
    board: BoardDefinition,
    mainSketchName: string
  ): Promise<CompileResult> {
    // 1. Save all project files
    await ProjectService.saveProjectFiles(projectPath, files);

    // 2. Invoke the compile command
    const sketchPath = `${projectPath}/src/${mainSketchName}`;
    return await CompilerApi.compileSketch(sketchPath, board.fqbn);
  },

  async upload(
    hexPath: string,
    port: string,
    board: BoardDefinition
  ): Promise<string> {
    return await CompilerApi.uploadHex(hexPath, port, board.fqbn);
  }
};
