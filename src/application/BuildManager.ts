import { CompilerService } from "./compiler-service";
import { Project, BuildResult, Diagnostic, ProjectFile, Circuit } from "../domain/models";
import { preprocess } from "../domain/sketch-generator";
import { PARTS_REGISTRY } from "../parts";
import { getBoardByFqbn } from "../domain/boards";

/**
 * Minimal interface required for a project to be built.
 */
export interface BuildableProject {
  rootPath: string;
  files: ProjectFile[];
  circuit: Circuit;
}

/**
 * BuildManager orchestrates the build process, translating project state
 * into compiler commands and returning structured build results.
 */
export const BuildManager = {
  // Simple in-memory cache for the last build result per project path
  _lastResults: new Map<string, BuildResult>(),

  /**
   * Builds the given project for the specified board.
   * If boardFqbn is not provided, it attempts to infer it from the circuit.
   */
  async build(project: BuildableProject, boardFqbn?: string): Promise<BuildResult> {
    const timestamp = Date.now();
    const fqbn = boardFqbn || this.inferBoardFqbn(project as Project);

    if (!fqbn) {
      return {
        status: 'error',
        output: "Error: No board found in project. Add a board to the circuit before building.",
        diagnostics: [{
          severity: 'error',
          message: "No board found in project."
        }],
        timestamp
      };
    }

    const boardDef = getBoardByFqbn(fqbn);
    if (!boardDef) {
      return {
        status: 'error',
        output: `Error: Unknown board FQBN: ${fqbn}`,
        diagnostics: [{
          severity: 'error',
          message: `Unknown board FQBN: ${fqbn}`
        }],
        timestamp
      };
    }

    let output = `Compiling project for ${boardDef.name}...\n`;

    try {
      // 1. Prepare project files (handles .ino concatenation, prototypes, etc.)
      const processedFiles = preprocess(project.files);

      // Find the main sketch file
      const mainSketch = processedFiles.find(f => f.name.endsWith(".ino")) || processedFiles[0];
      if (!mainSketch) {
        throw new Error("No source files found to build.");
      }

      // 2. Invoke the compiler service
      const result = await CompilerService.compile(
        project.rootPath,
        processedFiles,
        boardDef,
        mainSketch.name
      );

      if (result.success) {
        const buildResult: BuildResult = {
          status: 'success',
          hex: result.hex,
          flashUsed: result.flash_used,
          ramUsed: result.ram_used,
          stdout: result.stdout,
          stderr: result.stderr,
          output: output + `Successfully compiled: Flash ${result.flash_used} bytes, RAM ${result.ram_used} bytes`,
          diagnostics: [],
          timestamp
        };

        this._lastResults.set(project.rootPath, buildResult);
        return buildResult;
      } else {
        const buildResult: BuildResult = {
          status: 'failed',
          stdout: result.stdout,
          stderr: result.stderr,
          output: output + `Compilation failed:\n${result.stderr}`,
          diagnostics: this.parseDiagnostics(result.stderr),
          timestamp
        };

        this._lastResults.set(project.rootPath, buildResult);
        return buildResult;
      }
    } catch (err) {
      const errorMsg = String(err);
      const buildResult: BuildResult = {
        status: 'error',
        stdout: '',
        stderr: errorMsg,
        output: output + `System error: ${errorMsg}`,
        diagnostics: [{
          severity: 'error',
          message: errorMsg
        }],
        timestamp
      };

      this._lastResults.set(project.rootPath, buildResult);
      return buildResult;
    }
  },

  /**
   * Cleans build artifacts for the given project.
   */
  async clean(project: { rootPath: string }): Promise<void> {
    this._lastResults.delete(project.rootPath);
  },

  /**
   * Retrieves the last build result for the given project.
   */
  async getBuildResult(project: { rootPath: string }): Promise<BuildResult | null> {
    return this._lastResults.get(project.rootPath) || null;
  },

  /**
   * Attempts to find a suitable FQBN from the project's circuit.
   */
  inferBoardFqbn(project: Project): string | null {
    const board = project.circuit.components.find(c => {
      const definition = PARTS_REGISTRY.get(c.definitionId);
      return definition?.isBoard;
    });

    if (board) {
      const definition = PARTS_REGISTRY.get(board.definitionId);
      return definition?.fqbn || null;
    }

    return null;
  },

  /**
   * Simple parser for compiler output to extract diagnostics.
   */
  parseDiagnostics(errorOutput: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const lines = errorOutput.split('\n');

    // Regular expressions for different compiler output formats
    // 1. file:line:column: severity: message [-Wcode]
    const complexRegex = /^(.+?):(\d+):(\d+): (error|warning|info): (.+?)(?: \[(.+)\])?$/;
    // 2. file:line: severity: message
    const simpleRegex = /^(.+?):(\d+): (error|warning|info): (.+?)(?: \[(.+)\])?$/;

    for (const line of lines) {
      const trimmedLine = line.trim();
      let match = trimmedLine.match(complexRegex);

      if (match) {
        diagnostics.push({
          severity: match[4] as 'error' | 'warning' | 'info',
          message: match[5],
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          code: match[6]
        });
        continue;
      }

      match = trimmedLine.match(simpleRegex);
      if (match) {
        diagnostics.push({
          severity: match[3] as 'error' | 'warning' | 'info',
          message: match[4],
          file: match[1],
          line: parseInt(match[2]),
          code: match[5]
        });
      }
    }

    // Filter out redundant "Compilation failed" messages if we have specific errors
    if (diagnostics.length === 0 && errorOutput.trim().length > 0) {
      // Only add a generic error if no structured diagnostics were found
      // and it doesn't look like just noisy compiler internal output
      const meaningfulLines = lines.filter(l =>
        l.trim().length > 0 &&
        !l.includes("In function") &&
        !l.includes("In file included from")
      );

      if (meaningfulLines.length > 0) {
        diagnostics.push({
          severity: 'error',
          message: meaningfulLines[0].trim()
        });
      }
    }

    return diagnostics;
  }
};
