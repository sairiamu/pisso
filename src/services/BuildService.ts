import { BuildManager, BuildableProject } from '../application/BuildManager';
import { BuildResult, Diagnostic } from '../core/diagnostics/Diagnostic';

export class BuildService {
  public static async buildProject(
    project: BuildableProject,
    boardFqbn?: string,
    autoInstall: boolean = false
  ): Promise<BuildResult> {
    return await BuildManager.build(project, boardFqbn, autoInstall);
  }

  public static async cleanProject(project: { rootPath: string }): Promise<void> {
    await BuildManager.clean(project);
  }

  public static async getLastBuildResult(project: { rootPath: string }): Promise<BuildResult | null> {
    return await BuildManager.getBuildResult(project);
  }

  public static parseDiagnostics(errorOutput: string): Diagnostic[] {
    return BuildManager.parseDiagnostics(errorOutput);
  }
}
